import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const supabaseConfigError = (!supabaseUrl || !supabaseAnonKey)
  ? 'Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your frontend environment.'
  : null

// Avoid crashing the entire app at import-time when env vars are missing in production.
export const supabase = supabaseConfigError
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)
