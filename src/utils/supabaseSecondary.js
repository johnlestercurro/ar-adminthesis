import { createClient } from '@supabase/supabase-js'

const supabaseSecondaryUrl = import.meta.env.VITE_SUPABASE_SECONDARY_URL
const supabaseSecondaryAnonKey = import.meta.env.VITE_SUPABASE_SECONDARY_ANON_KEY

export const supabaseSecondary = createClient(supabaseSecondaryUrl, supabaseSecondaryAnonKey)
