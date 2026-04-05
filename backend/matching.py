from __future__ import annotations

import json
import os
from typing import Any, Dict, List

import numpy as np

os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", "/tmp/sentence_transformers")
from sentence_transformers import SentenceTransformer

from database import supabase

_MODEL = None


def _get_model():
    global _MODEL
    if _MODEL is None:
        _MODEL = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _MODEL


model = None


def encode_text(text: str) -> str:
    global model
    if model is None:
        model = _get_model()
    vec = model.encode([text], normalize_embeddings=True)[0]
    return json.dumps(vec.astype(float).tolist())


def parse_embedding(emb):
    if emb is None:
        return None
    if isinstance(emb, str):
        try:
            emb = json.loads(emb)
        except Exception:
            return None
    if isinstance(emb, list):
        return np.asarray(emb, dtype=np.float32)
    return None


def _is_missing_listing_type_column_error(error_message: str) -> bool:
    normalized = " ".join((error_message or "").lower().split())
    mentions_column = "listing_type" in normalized or "listing type" in normalized
    missing_column = (
        "does not exist" in normalized
        or "code': '42703" in normalized
        or 'code": "42703' in normalized
    )
    return mentions_column and missing_column


def _listing_to_text(listing):
    parts = [
        str(listing.get("material_type") or ""),
        str(listing.get("legal_classification") or ""),
        str(listing.get("description") or ""),
        f'volume_kg_per_month={listing.get("volume_kg_per_month")}',
    ]
    return "\n".join([p for p in parts if p and p != "None"]).strip()


def embed_listing(listing_id: str) -> None:
    listing_resp = supabase.table("waste_listings").select("*").eq("id", listing_id).single().execute()
    listing = getattr(listing_resp, "data", None)
    if not listing:
        raise RuntimeError("Listing not found")
    text = _listing_to_text(listing)
    if not text:
        raise RuntimeError("Listing has no text to embed")
    embedding_json = encode_text(text)
    supabase.table("waste_listings").update({"embedding": embedding_json}).eq("id", listing_id).execute()


def _lookup_company_profile(company_id: Any) -> Dict[str, Any]:
    if company_id is None:
        return {}

    # Try primary key lookup first for schemas where waste_listings.company_id
    # references companies.id.
    try:
        company_by_id = (
            supabase.table("companies")
            .select("name, location, sector")
            .eq("id", company_id)
            .limit(1)
            .execute()
        )
        company_data = getattr(company_by_id, "data", []) or []
        if company_data:
            return company_data[0]
    except Exception:
        pass

    # Fallback for deployments where listings store UUID user ids and
    # companies.id uses a different type (e.g. bigint).
    try:
        company_by_user = (
            supabase.table("companies")
            .select("name, location, sector")
            .eq("user_id", company_id)
            .limit(1)
            .execute()
        )
        company_data = getattr(company_by_user, "data", []) or []
        if company_data:
            return company_data[0]
    except Exception:
        pass

    return {}


def find_matches(listing_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
    source_resp = supabase.table("waste_listings").select("*").eq("id", listing_id).single().execute()
    source = getattr(source_resp, "data", None)
    if not source:
        raise RuntimeError("Listing not found")

    if not source.get("embedding"):
        embed_listing(listing_id)
        source_resp = supabase.table("waste_listings").select("*").eq("id", listing_id).single().execute()
        source = getattr(source_resp, "data", None) or source

    source_emb = parse_embedding(source.get("embedding"))
    if source_emb is None:
        raise RuntimeError("Could not create embedding")

    source_type = source.get("listing_type", "seller")
    opposite_type = "buyer" if source_type == "seller" else "seller"

    try:
        cand_resp = (
            supabase.table("waste_listings")
            .select("*")
            .eq("status", "active")
            .eq("listing_type", opposite_type)
            .neq("id", listing_id)
            .execute()
        )
        if getattr(cand_resp, "error", None):
            raise RuntimeError(str(cand_resp.error))
        candidates = getattr(cand_resp, "data", []) or []
    except Exception as exc:
        # If listing_type is missing in legacy schemas, fall back to all actives.
        if not _is_missing_listing_type_column_error(str(exc)):
            raise

        fallback_by_status = (
            supabase.table("waste_listings")
            .select("*")
            .eq("status", "active")
            .neq("id", listing_id)
            .execute()
        )
        if getattr(fallback_by_status, "error", None):
            raise RuntimeError(str(fallback_by_status.error))
        candidates = getattr(fallback_by_status, "data", []) or []

    scored = []
    for row in candidates:
        if not row.get("embedding"):
            try:
                embed_listing(row["id"])
                row_resp = supabase.table("waste_listings").select("*").eq("id", row["id"]).single().execute()
                row = getattr(row_resp, "data", row)
            except Exception:
                continue
        v = parse_embedding(row.get("embedding"))
        if v is None or v.size != source_emb.size:
            continue

        if not row.get("companies"):
            row["companies"] = _lookup_company_profile(row.get("company_id"))

        score = float(np.dot(source_emb, v))
        scored.append({"score": score, "listing": row})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:max(1, int(top_k))]