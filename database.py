"""
CirclOS database configuration for FastAPI using Supabase.

This file:
1. Loads environment variables from `.env`
2. Reads `SUPABASE_URL` and `SUPABASE_KEY`
3. Creates a Supabase client: `supabase = create_client(url, key)`
4. Exports `supabase` for use in other modules.
"""

from __future__ import annotations

import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from supabase import Client, create_client

# 1. Import load_dotenv from dotenv and call it at the top
load_dotenv()

# 3. Read SUPABASE_URL and SUPABASE_KEY from environment variables using os.getenv
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL:
    raise RuntimeError(
        "Missing SUPABASE_URL. Add it to your environment or to a local .env file."
    )

if not SUPABASE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_KEY. Add it to your environment or to a local .env file."
    )

# 4. Create a supabase client: supabase = create_client(url, key)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


async def get_db() -> AsyncGenerator[Client, None]:
    """
    Optional FastAPI dependency that yields the global Supabase client.

    Usage:
        from fastapi import Depends
        from database import get_db, supabase

        @app.get("/health")
        async def health(db=Depends(get_db)):
            return {"ok": True}
    """

    yield supabase
