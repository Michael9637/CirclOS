from __future__ import annotations

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
    user_id: str


class ListingCreate(BaseModel):
    company_id: str
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
    company_id: str = "00000000-0000-0000-0000-000000000001"


app = FastAPI(title="CirclOS API")

import os
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)   


@app.get("/")
def root() -> Dict[str, str]:
    return {"status": "ok", "message": "CirclOS API running"}


@app.post("/companies")
def create_company(body: CompanyCreate) -> Dict[str, Any]:
    try:
        response = (
            supabase.table("companies")
            .insert(body.model_dump())
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create company: {exc}")

    if getattr(response, "error", None):
        raise HTTPException(status_code=400, detail=str(response.error))

    data = getattr(response, "data", None) or []
    if not data:
        raise HTTPException(status_code=500, detail="Company not returned from Supabase")

    return data[0]


@app.post("/listings")
def create_listing(body: ListingCreate) -> Dict[str, Any]:
    try:
        response = (
            supabase.table("waste_listings")
            .insert(body.model_dump())
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to create listing: {exc}")

    if getattr(response, "error", None):
        raise HTTPException(status_code=400, detail=str(response.error))

    data = getattr(response, "data", None) or []
    if not data:
        raise HTTPException(status_code=500, detail="Listing not returned from Supabase")

    listing = data[0]

    # Embedding is best-effort so listing creation never fails due to model cold start.
    try:
        embed_listing(listing["id"])
    except Exception:
        pass

    return listing


@app.get("/listings")
def list_active_listings(listing_type: str | None = None) -> List[Dict[str, Any]]:
    try:
        query = supabase.table("waste_listings").select("*").eq("status", "active")
        if listing_type:
            query = query.eq("listing_type", listing_type)
        response = query.execute()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch listings: {exc}")

    if getattr(response, "error", None):
        raise HTTPException(status_code=400, detail=str(response.error))

    return getattr(response, "data", []) or []


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
def get_evidence_records() -> List[Dict[str, Any]]:
    try:
        response = (
            supabase.table("evidence_records")
            .select("*")
            .order("confirmed_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch evidence records: {exc}")

    return getattr(response, "data", []) or []


@app.post("/scan")
def scan_website(body: ScanRequest):
    from scanner import scrape_url, classify_claims

    try:
        sentences = scrape_url(body.url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    claims = classify_claims(sentences)
    prohibited = [c for c in claims if c["status"] == "prohibited"]
    needs_evidence = [c for c in claims if c["status"] == "needs_evidence"]

    try:
        supabase.table("compliance_scans").insert({
            "company_id": body.company_id,
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
