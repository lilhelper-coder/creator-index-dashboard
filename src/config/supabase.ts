import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tbprnbizoajclgozrzmb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicHJuYml6b2FqY2xnb3pyem1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzQ0NzEsImV4cCI6MjA4MjkxMDQ3MX0.kWD9P8EJJZebPZaFT-WrcllhMvOd69bZN7n6MVL7Yms'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
