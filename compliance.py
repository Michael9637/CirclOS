from __future__ import annotations

import re
from typing import Any
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup


# ECGT Article 6 terms that are prohibited without specific proof.
ECGT_BLACKLIST = [
    "umweltfreundlich",
    "eco-friendly",
    "nachhaltig",
    "sustainable",
    "gruen",
    "green",
    "klimaneutral",
    "climate neutral",
    "klimapositiv",
    "co2-neutral",
    "co2-positiv",
    "kohlenstoffneutral",
    "carbon neutral",
    "oekologisch",
    "ecological",
    "naturfreundlich",
    "nature-friendly",
    "umweltschonend",
    "environmentally friendly",
    "ramponiert",
    "verantwortungsbewusst",
    "responsible",
    "sauber",
    "clean energy",
    "saubere energie",
    "kreislaufwirtschaft-konform",
    "circular",
    "emissionsfrei",
    "emission-free",
    "null-emissionen",
    "zero emissions",
    "klimafreundlich",
    "climate friendly",
    "ressourcenschonend",
]


# Suggestion snippets that replace generic claims with verifiable statements.
CLAIM_CONTEXT = {
    "klimaneutral": "e.g. 'Wir haben unsere Scope-1-Emissionen um 18% seit 2022 reduziert (TUV-zertifiziert)'",
    "nachhaltig": "e.g. 'Wir leiten 8,4 Tonnen Produktionsabfall pro Monat an zertifizierte Recycler weiter (verifiziert durch CirclOS)'",
    "umweltfreundlich": "e.g. 'Unsere Verpackung besteht zu 60% aus recycelten Materialien (FSC-zertifiziert)'",
    "eco-friendly": "e.g. 'Our process now uses 42% recycled feedstock, verified by annual third-party audits'",
    "carbon neutral": "e.g. 'Seit 2023 beziehen wir 100% zertifizierten Oekostrom (Herkunftsnachweise dokumentiert)'",
    "circular": "e.g. '92% unserer Produktionsreste werden in einen dokumentierten Materialkreislauf zurueckgefuehrt'",
    "emissionsfrei": "e.g. 'Die Anlage emittiert im Betrieb 0,8 t CO2e/Jahr, gemessen nach ISO 14064'",
    "ressourcenschonend": "e.g. 'Der neue Prozess reduziert den Wasserverbrauch pro Einheit um 27% gegenueber 2022'",
}


def _normalize_url(url: str) -> str:
    if not url.startswith("http"):
        return f"https://{url}"
    return url


def _is_internal_link(href: str, domain: str) -> bool:
    if href.startswith("/"):
        return True
    parsed = urlparse(href)
    return bool(parsed.netloc) and parsed.netloc == domain


def _extract_visible_text(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")

    # Remove non-content tags so compliance checks only run on readable text.
    for tag in soup(["script", "style", "noscript", "nav", "footer", "header", "form", "button", "svg"]):
        tag.decompose()

    raw = soup.get_text(separator=" ")
    return re.sub(r"\s+", " ", raw).strip()


def _split_sentences(text: str) -> list[str]:
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 25]


async def crawl_website(url: str) -> dict[str, Any]:
    normalized_url = _normalize_url(url)
    base_parts = urlparse(normalized_url)
    domain = base_parts.netloc

    async with httpx.AsyncClient(
        timeout=15.0,
        headers={
            "User-Agent": "CirclOS-Compliance-Scanner/1.0 (contact: compliance@circlos.at)",
        },
        follow_redirects=True,
    ) as client:
        base_response = await client.get(normalized_url)
        if base_response.status_code != 200:
            raise Exception(f"Could not reach {normalized_url}: HTTP {base_response.status_code}")

        base_soup = BeautifulSoup(base_response.text, "lxml")

        internal_pages: list[str] = []
        seen: set[str] = set()

        def add_page(page_url: str) -> None:
            if page_url in seen:
                return
            seen.add(page_url)
            internal_pages.append(page_url)

        add_page(normalized_url)

        for anchor in base_soup.find_all("a", href=True):
            href = (anchor.get("href") or "").strip()
            if not href or href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
                continue
            if not _is_internal_link(href, domain):
                continue
            full_url = urljoin(normalized_url, href)
            add_page(full_url)
            if len(internal_pages) >= 15:
                break

        pages: list[dict[str, Any]] = []
        for page_url in internal_pages:
            try:
                page_response = await client.get(page_url)
                if page_response.status_code != 200:
                    pages.append(
                        {
                            "url": page_url,
                            "status": page_response.status_code,
                            "text": "",
                            "error": f"HTTP {page_response.status_code}",
                        }
                    )
                    continue
                visible_text = _extract_visible_text(page_response.text)
                pages.append(
                    {
                        "url": page_url,
                        "status": page_response.status_code,
                        "text": visible_text,
                    }
                )
            except Exception as exc:
                pages.append(
                    {
                        "url": page_url,
                        "status": None,
                        "text": "",
                        "error": str(exc),
                    }
                )

    combined_text = "\n".join(page["text"] for page in pages if page.get("text"))

    return {
        "input_url": url,
        "normalized_url": normalized_url,
        "domain": domain,
        "pages_crawled": len(pages),
        "pages": pages,
        "combined_text": combined_text,
    }


def classify_ecgt_claims(crawl_result: dict[str, Any]) -> dict[str, Any]:
    findings: list[dict[str, Any]] = []

    for page in crawl_result.get("pages", []):
        page_url = page.get("url", "")
        page_text = page.get("text", "")
        if not page_text:
            continue

        for sentence in _split_sentences(page_text):
            lower_sentence = sentence.lower()
            for term in ECGT_BLACKLIST:
                if term in lower_sentence:
                    findings.append(
                        {
                            "term": term,
                            "status": "prohibited_without_specific_proof",
                            "sentence": sentence[:400],
                            "page_url": page_url,
                            "suggestion": CLAIM_CONTEXT.get(
                                term,
                                "e.g. Replace this generic claim with a measurable metric, period, and verification source.",
                            ),
                        }
                    )

    # Deduplicate repeated findings from identical sentence/term combinations.
    deduped: list[dict[str, Any]] = []
    seen_keys: set[tuple[str, str, str]] = set()
    for item in findings:
        key = (item["page_url"], item["term"], item["sentence"])
        if key in seen_keys:
            continue
        seen_keys.add(key)
        deduped.append(item)

    return {
        "normalized_url": crawl_result.get("normalized_url"),
        "pages_crawled": crawl_result.get("pages_crawled", 0),
        "total_flagged_claims": len(deduped),
        "unique_terms_found": sorted({item["term"] for item in deduped}),
        "findings": deduped,
    }


async def scan_website_ecgt(url: str) -> dict[str, Any]:
    crawl_result = await crawl_website(url)
    classification = classify_ecgt_claims(crawl_result)
    return {
        "crawl": {
            "input_url": crawl_result.get("input_url"),
            "normalized_url": crawl_result.get("normalized_url"),
            "domain": crawl_result.get("domain"),
            "pages_crawled": crawl_result.get("pages_crawled"),
        },
        "classification": classification,
    }
