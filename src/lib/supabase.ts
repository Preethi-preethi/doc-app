import { createClient } from '@supabase/supabase-js'

// Using mocked environment variables until the user provides real ones.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-xyz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
