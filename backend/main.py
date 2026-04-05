from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import supabase
from matching import find_matches, embed_listing


class CompanyCreate(BaseModel):
    name: str
    sector: str
    location: str
    description: str
    user_id: str | None = None


class ListingCreate(BaseModel):
    company_id: str | None = None
    user_id: str | None = None
    listing_type: str = "seller"
    material_type: str
    volume_kg_per_month: float
    legal_classification: str
    description: str


class MatchConfirm(BaseModel):
    listing_id: str
    matched_listing_id: str
    similarity_score: float


class ScanRequest(BaseModel):
    url: str
    company_id: str | None = None
    user_id: str | None = None


app = FastAPI(title="CirclOS API")

origins_env = os.getenv("ALLOWED_ORIGINS", "*")

# Keep production usable even if ALLOWED_ORIGINS is misconfigured.
default_origins = {
    "https://circlosat.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
}

parsed_origins = {origin.strip() for origin in origins_env.split(",") if origin.strip()}
if not parsed_origins or "*" in parsed_origins:
    origins = ["*"]
else:
    origins = sorted(default_origins.union(parsed_origins))

# Wildcard origins and credentials cannot be combined safely in browser CORS.
allow_credentials = origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)   


def _resolve_company_id(company_id: str | None = None, user_id: str | None = None) -> str:
    if company_id:
        return company_id

    if not user_id:
        raise HTTPException(status_code=400, detail="company_id or user_id is required")

    try:
        response = (
            supabase.table("companies")
            .select("id")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to resolve company for user: {exc}")

    if getattr(response, "error", None):
        raise HTTPException(status_code=400, detail=str(response.error))

    data = getattr(response, "data", None) or []
    if not data or not data[0].get("id"):
        raise HTTPException(status_code=404, detail="No company found for user. Register company first.")

    return data[0]["id"]


def _insert_listing_with_schema_fallback(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Insert a listing while tolerating older schemas that lack listing_type."""
    try:
        response = (
            supabase.table("waste_listings")
            .insert(payload)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create listing: {exc}")

    if getattr(response, "error", None):
        error_message = str(response.error)

        # Backward compatibility for older deployments that do not have listing_type.
        if payload.get("listing_type") and "listing_type" in error_message.lower():
            fallback_payload = dict(payload)
            fallback_payload.pop("listing_type", None)

            try:
                retry_response = (
                    supabase.table("waste_listings")
                    .insert(fallback_payload)
                    .execute()
                )
            except Exception as exc:
                raise HTTPException(status_code=500, detail=f"Failed to create listing: {exc}")

            if getattr(retry_response, "error", None):
                raise HTTPException(status_code=400, detail=str(retry_response.error))

            retry_data = getattr(retry_response, "data", None) or []
            if not retry_data:
                raise HTTPException(status_code=500, detail="Listing not returned from Supabase")

            return retry_data[0]

        raise HTTPException(status_code=400, detail=error_message)

    data = getattr(response, "data", None) or []
    if not data:
        raise HTTPException(status_code=500, detail="Listing not returned from Supabase")

    return data[0]


def _is_missing_listing_type_column_error(error_message: str) -> bool:
    normalized = " ".join((error_message or "").lower().split())
    mentions_column = "listing_type" in normalized or "listing type" in normalized
    missing_column = "does not exist" in normalized or "code': '42703" in normalized or 'code": "42703' in normalized
    return mentions_column and missing_column


def _coerce_listings_by_type(listings: List[Dict[str, Any]], listing_type: str | None) -> List[Dict[str, Any]]:
    if not listing_type:
        return listings

    has_listing_type = any(isinstance(item, dict) and "listing_type" in item for item in listings)
    if not has_listing_type:
        # Legacy schema had only seller-style listings and no listing_type column.
        return listings if listing_type == "seller" else []

    return [item for item in listings if item.get("listing_type") == listing_type]


@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "ok", "message": "CirclOS API running"}


@app.post("/companies")
def create_company(body: CompanyCreate) -> Dict[str, Any]:
    payload = body.model_dump()
    if not payload.get("user_id"):
        payload["user_id"] = None

    try:
        response = (
            supabase.table("companies")
            .insert(payload)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create company: {exc}")

    if getattr(response, "error", None):
        error_message = str(response.error)
        # If user_id has a strict FK and the value is invalid, retry as null.
        if payload.get("user_id") and "user_id" in error_message.lower() and "foreign key" in error_message.lower():
            payload["user_id"] = None
            retry_response = (
                supabase.table("companies")
                .insert(payload)
                .execute()
            )
            if getattr(retry_response, "error", None):
                raise HTTPException(status_code=400, detail=str(retry_response.error))
            retry_data = getattr(retry_response, "data", None) or []
            if not retry_data:
                raise HTTPException(status_code=500, detail="Company not returned from Supabase")
            return retry_data[0]

        raise HTTPException(status_code=400, detail=error_message)

    data = getattr(response, "data", None) or []
    if not data:
        raise HTTPException(status_code=500, detail="Company not returned from Supabase")

    return data[0]


@app.post("/listings")
def create_listing(body: ListingCreate) -> Dict[str, Any]:
    payload = body.model_dump(exclude_none=True)
    payload["company_id"] = _resolve_company_id(payload.get("company_id"), payload.get("user_id"))
    payload.pop("user_id", None)
    if not payload.get("listing_type"):
        payload.pop("listing_type", None)
    listing = _insert_listing_with_schema_fallback(payload)

    # Embedding is best-effort so listing creation never fails due to model cold start.
    try:
        embed_listing(listing["id"])
    except Exception:
        pass

    return listing


@app.get("/listings")
def list_active_listings(listing_type: str | None = None) -> List[Dict[str, Any]]:
    base_query = supabase.table("waste_listings").select("*").eq("status", "active")

    try:
        query = base_query
        if listing_type:
            query = query.eq("listing_type", listing_type)
        response = query.execute()
    except Exception as exc:
        if listing_type and _is_missing_listing_type_column_error(str(exc)):
            try:
                fallback_response = base_query.execute()
            except Exception as fallback_exc:
                raise HTTPException(status_code=500, detail=f"Failed to fetch listings: {fallback_exc}")

            fallback_data = getattr(fallback_response, "data", []) or []
            return _coerce_listings_by_type(fallback_data, listing_type)

        raise HTTPException(status_code=500, detail=f"Failed to fetch listings: {exc}")

    if getattr(response, "error", None):
        error_message = str(response.error)
        if listing_type and _is_missing_listing_type_column_error(error_message):
            try:
                fallback_response = base_query.execute()
            except Exception as fallback_exc:
                raise HTTPException(status_code=500, detail=f"Failed to fetch listings: {fallback_exc}")

            fallback_data = getattr(fallback_response, "data", []) or []
            return _coerce_listings_by_type(fallback_data, listing_type)

        raise HTTPException(status_code=400, detail=error_message)

    data = getattr(response, "data", []) or []
    return _coerce_listings_by_type(data, listing_type)


@app.get("/listings/{listing_id}")
def get_listing(listing_id: str) -> Dict[str, Any]:
    try:
        response = (
            supabase.table("waste_listings")
            .select("*")
            .eq("id", listing_id)
            .limit(1)
            .single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch listing: {exc}")

    if getattr(response, "error", None):
        # Supabase returns an error object; treat "row not found" as 404
        message = str(response.error)
        status_code = 404 if "No rows" in message or "not found" in message.lower() else 400
        raise HTTPException(status_code=status_code, detail=message)

    data = getattr(response, "data", None)
    if not data:
        raise HTTPException(status_code=404, detail="Listing not found")

    return data


@app.post("/listings/{listing_id}/embed")
async def embed_listing_endpoint(listing_id: str):
    try:
        embed_listing(listing_id)
        return {"status": "ok", "message": "Embedding created"}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/listings/{listing_id}/matches")
async def get_matches(listing_id: str):
    try:
        matches = find_matches(listing_id)
        return {"listing_id": listing_id, "matches": matches}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/matches/confirm")
def confirm_match(body: MatchConfirm):
    try:
        seller_resp = supabase.table("waste_listings").select("*").eq("id", body.listing_id).single().execute()
        seller = getattr(seller_resp, "data", None) or {}
        if not seller:
            raise HTTPException(status_code=404, detail="Seller listing not found")

        buyer_resp = supabase.table("waste_listings").select("*").eq("id", body.matched_listing_id).single().execute()
        buyer = getattr(buyer_resp, "data", None) or {}
        if not buyer:
            raise HTTPException(status_code=404, detail="Matched listing not found")

        now_iso = datetime.now(timezone.utc).isoformat()
        cert_text = (
            f"CirclOS Evidence Record | "
            f"Material: {seller.get('material_type')} | "
            f"Volume: {seller.get('volume_kg_per_month')}kg/month | "
            f"AWG: {seller.get('legal_classification')} | "
            f"AI Score: {round(body.similarity_score * 100)}%"
        )

        match_resp = supabase.table("matches").insert({
            "listing_id": body.listing_id,
            "matched_listing_id": body.matched_listing_id,
            "similarity_score": body.similarity_score,
            "status": "confirmed",
            "confirmed_at": now_iso,
        }).execute()
        match_data = getattr(match_resp, "data", None) or []
        match_id = match_data[0].get("id") if match_data else ""

        supabase.table("evidence_records").insert({
            "match_id": match_id,
            "seller_company_id": seller.get("company_id", ""),
            "buyer_company_id": buyer.get("company_id", ""),
            "material_type": seller.get("material_type", ""),
            "volume_kg": seller.get("volume_kg_per_month", 0),
            "awg_classification": seller.get("legal_classification", ""),
            "confirmed_at": now_iso,
            "certificate_text": cert_text,
        }).execute()
        return {"status": "confirmed", "certificate_text": cert_text}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/evidence")
def get_evidence_records(company_id: str | None = None, user_id: str | None = None) -> List[Dict[str, Any]]:
    resolved_company_id = _resolve_company_id(company_id, user_id)

    try:
        response = (
            supabase.table("evidence_records")
            .select("*")
            .or_(f"seller_company_id.eq.{resolved_company_id},buyer_company_id.eq.{resolved_company_id}")
            .order("confirmed_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch evidence records: {exc}")

    return getattr(response, "data", []) or []


@app.post("/scan")
def scan_website(body: ScanRequest):
    from scanner import scrape_url, classify_claims

    resolved_company_id = _resolve_company_id(body.company_id, body.user_id)

    try:
        sentences = scrape_url(body.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    claims = classify_claims(sentences)
    prohibited = [c for c in claims if c["status"] == "prohibited"]
    needs_evidence = [c for c in claims if c["status"] == "needs_evidence"]

    try:
        supabase.table("compliance_scans").insert({
            "company_id": resolved_company_id,
            "url_scanned": body.url,
            "claims_found": claims,
            "scan_status": "complete",
        }).execute()
    except Exception:
        # The scan result is still useful to return even if persistence fails.
        pass

    return {
        "url": body.url,
        "total_claims_found": len(claims),
        "prohibited_count": len(prohibited),
        "needs_evidence_count": len(needs_evidence),
        "claims": claims,
    }
