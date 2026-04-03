# CirclOS

Monorepo containing backend (FastAPI) and frontend (Vite + React).

## Structure

- backend: API service for Railway deployment
- frontend: web app for Vercel deployment

## Deployment

- Railway Root Directory: backend
- Vercel Root Directory: frontend

## Environment Variables

Frontend (Vercel):
- VITE_API_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Backend (Railway):
- SUPABASE_URL
- SUPABASE_KEY
- ALLOWED_ORIGINS
