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

    # Prefer relational select when FK metadata exists, but gracefully fall back
    # for legacy deployments where companies relation is not declared.
    relation_available = True
    try:
        cand_resp = (
            supabase.table("waste_listings")
            .select("*, companies(name, location, sector)")
            .eq("status", "active")
            .eq("listing_type", opposite_type)
            .neq("id", listing_id)
            .execute()
        )
        candidates = getattr(cand_resp, "data", []) or []
    except Exception:
        relation_available = False
        cand_resp = (
            supabase.table("waste_listings")
            .select("*")
            .eq("status", "active")
            .eq("listing_type", opposite_type)
            .neq("id", listing_id)
            .execute()
        )
        candidates = getattr(cand_resp, "data", []) or []

    # If no opposite listing_type exists (legacy schema), match against all actives except source.
    if not candidates:
        fallback_resp = (
            supabase.table("waste_listings")
            .select("*")
            .eq("status", "active")
            .neq("id", listing_id)
            .execute()
        )
        candidates = getattr(fallback_resp, "data", []) or []

    scored = []
    for row in candidates:
        if not row.get("embedding"):
            try:
                embed_listing(row["id"])
                row_resp = supabase.table("waste_listings").select("*, companies(name, location, sector)").eq("id", row["id"]).single().execute()
                row = getattr(row_resp, "data", row)
            except Exception:
                continue
        v = parse_embedding(row.get("embedding"))
        if v is None or v.size != source_emb.size:
            continue
        if not relation_available and row.get("company_id") and not row.get("companies"):
            try:
                company_resp = (
                    supabase.table("companies")
                    .select("name, location, sector")
                    .eq("id", row.get("company_id"))
                    .limit(1)
                    .execute()
                )
                company_data = getattr(company_resp, "data", []) or []
                row["companies"] = company_data[0] if company_data else {}
            except Exception:
                row["companies"] = {}

        score = float(np.dot(source_emb, v))
        scored.append({"score": score, "listing": row})

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:max(1, int(top_k))]