import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ucttoetyxtmgfejbsnlf.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjdHRvZXR5eHRtZ2ZlamJzbmxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NjY1ODYsImV4cCI6MjA3MzI0MjU4Nn0.sOrDrrnbd-2OFZWasOumV2FjHv-SwiKXYHJlUmajoOQ"

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
