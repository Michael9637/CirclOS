from sentence_transformers import SentenceTransformer
from supabase import create_client
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# Initialize model once at module load
model = SentenceTransformer("all-MiniLM-L6-v2")


def _get_supabase_client():
  url = os.getenv("SUPABASE_URL")
  key = os.getenv("SUPABASE_KEY")

  if not url or not key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in the environment.")

  return create_client(url, key)


supabase = _get_supabase_client()


def encode_text(text: str) -> list:
  """
  Encode a single text string into an embedding list.
  """
  if text is None:
    text = ""

  embedding = model.encode(text)
  return embedding.tolist()


def embed_listing(listing_id: str) -> None:
  """
  Compute and persist an embedding for a single listing.
  """
  # Fetch listing
  response = (
    supabase.table("waste_listings")
    .select("*")
    .eq("id", listing_id)
    .single()
    .execute()
  )

  listing = getattr(response, "data", None) or getattr(response, "json", lambda: None)()

  if not listing:
    raise ValueError(f"Listing with id {listing_id} not found.")

  material_type = listing.get("material_type", "") or ""
  description = listing.get("description", "") or ""

  embed_text = f"{material_type} {description}".strip()
  embedding = encode_text(embed_text)

  # Update listing with embedding
  supabase.table("waste_listings").update(
    {"embedding": embedding}
  ).eq("id", listing_id).execute()


def _cosine_similarity(vec1, vec2) -> float:
  a = np.array(vec1, dtype=float)
  b = np.array(vec2, dtype=float)

  if a.size == 0 or b.size == 0:
    return 0.0

  denom = (np.linalg.norm(a) * np.linalg.norm(b))
  if denom == 0:
    return 0.0

  return float(np.dot(a, b) / denom)


def find_matches(listing_id: str) -> list:
  """
  Main matching function.
  Returns a ranked list of matching companies for the given listing_id.
  """
  # Fetch listing
  listing_resp = (
    supabase.table("waste_listings")
    .select("*")
    .eq("id", listing_id)
    .single()
    .execute()
  )

  listing = getattr(listing_resp, "data", None) or getattr(
    listing_resp, "json", lambda: None
  )()

  if not listing:
    raise ValueError(f"Listing with id {listing_id} not found.")

  # Ensure listing has an embedding
  listing_embedding = listing.get("embedding")
  if not listing_embedding:
    embed_listing(listing_id)
    # Re-fetch listing to get the new embedding
    listing_resp = (
      supabase.table("waste_listings")
      .select("*")
      .eq("id", listing_id)
      .single()
      .execute()
    )
    listing = getattr(listing_resp, "data", None) or getattr(
      listing_resp, "json", lambda: None
    )()
    if not listing:
      raise ValueError(f"Listing with id {listing_id} not found after embedding.")
    listing_embedding = listing.get("embedding") or []

  if not isinstance(listing_embedding, (list, tuple)):
    listing_embedding = list(listing_embedding)

  listing_classification = listing.get("legal_classification")
  listing_volume = listing.get("volume_kg_per_month") or 0

  # STAGE 1 — Rule-based filter
  companies_resp = supabase.table("companies").select("*").execute()
  companies = getattr(companies_resp, "data", None) or getattr(
    companies_resp, "json", lambda: None
  )()

  if not isinstance(companies, list):
    companies = []

  filtered_companies = []
  for company in companies:
    if not company:
      continue

    accepted = company.get("accepted_classifications") or []
    if isinstance(accepted, str):
      # If stored as a comma-separated string
      accepted = [c.strip() for c in accepted.split(",") if c.strip()]

    max_volume = company.get("max_volume_kg_per_month")
    if max_volume is None:
      max_volume = 0

    # Check classification rule
    classification_ok = (
      listing_classification is None
      or not accepted
      or listing_classification in accepted
    )

    # Check volume rule (0 means no limit)
    volume_ok = max_volume == 0 or max_volume >= listing_volume

    if classification_ok and volume_ok:
      filtered_companies.append(company)

  # If fewer than 2 companies pass, skip filtering and use all companies
  if len(filtered_companies) < 2:
    filtered_companies = companies

  # STAGE 2 — Vector similarity
  scored_companies = []
  for company in filtered_companies:
    if not company:
      continue

    company_embedding = company.get("embedding")
    if not company_embedding:
      continue

    try:
      similarity = _cosine_similarity(listing_embedding, company_embedding)
    except Exception:
      # If bad embedding shape or type, skip this company
      continue

    scored_companies.append((company, similarity))

  # Sort by similarity descending and keep top 10
  scored_companies.sort(key=lambda cs: cs[1], reverse=True)
  top_scored = scored_companies[:10]

  # STAGE 3 — Rank and return
  results = []
  for company, score in top_scored:
    sector = company.get("sector")
    listing_sector = listing.get("sector")

    if sector and listing_sector and sector == listing_sector:
      match_reason = "High material compatibility — same sector"
    else:
      match_reason = "Volume and classification match"

    results.append(
      {
        "company_id": company.get("id"),
        "company_name": company.get("name"),
        "sector": sector,
        "location": company.get("location"),
        "similarity_score": round(float(score), 4),
        "match_reason": match_reason,
      }
    )

  # Ensure sorted by similarity_score descending
  results.sort(key=lambda r: r["similarity_score"], reverse=True)
  return results


__all__ = ["encode_text", "embed_listing", "find_matches"]

