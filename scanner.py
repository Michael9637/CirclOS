from __future__ import annotations

import re
from typing import Any, Dict, List

import requests
from bs4 import BeautifulSoup

ECGT_PROHIBITED = [
    "eco-friendly", "environmentally friendly", "green", "sustainable",
    "climate neutral", "carbon neutral", "CO2 neutral", "net zero",
    "umweltfreundlich", "nachhaltig", "klimaneutral", "CO2-neutral",
    "grun", "okologisch", "naturfreundlich", "umweltschonend",
    "ressourcenschonend", "emissionsfrei", "emissionsarm",
]

ECGT_NEEDS_EVIDENCE = [
    "recycled", "recyclable", "biodegradable", "organic", "renewable",
    "recycelt", "recycelbar", "biologisch abbaubar", "erneuerbar",
    "wiederverwendbar", "ressourceneffizient", "kreislaufwirtschaft",
    "circular", "low emission", "reduced carbon", "geringer co2",
]


def scrape_url(url: str) -> List[str]:
    if not url.startswith("http"):
        url = "https://" + url
    try:
        headers = {"User-Agent": "Mozilla/5.0 (CirclOS Compliance Scanner)"}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch URL: {exc}")

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    raw = soup.get_text(separator=" ")
    raw = re.sub(r"\s+", " ", raw).strip()
    sentences = re.split(r"(?<=[.!?])\s+", raw)
    return [s.strip() for s in sentences if len(s.strip()) > 25]


def classify_claims(sentences: List[str]) -> List[Dict[str, Any]]:
    results = []
    for sentence in sentences:
        lower = sentence.lower()
        prohibited_hits = [kw for kw in ECGT_PROHIBITED if kw.lower() in lower]
        evidence_hits = [kw for kw in ECGT_NEEDS_EVIDENCE if kw.lower() in lower]

        if not prohibited_hits and not evidence_hits:
            continue

        if prohibited_hits:
            status = "prohibited"
            ecgt_risk = (
                "Generic unsubstantiated claim under ECGT Article 6. "
                f"Prohibited keywords: {', '.join(prohibited_hits)}. "
                "Enforcement risk from September 2026."
            )
        else:
            status = "needs_evidence"
            ecgt_risk = (
                "Claim requires verifiable evidence under ECGT. "
                f"Keywords: {', '.join(evidence_hits)}. "
                "Link to verified transaction records or third-party certification."
            )

        results.append({
            "text": sentence[:300],
            "status": status,
            "keywords_found": prohibited_hits or evidence_hits,
            "ecgt_risk": ecgt_risk,
        })

    return results[:20]
