import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log("Supabase URL:", process.env.REACT_APP_SUPABASE_URL);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase env vars");
} else {
  console.log("✅ Supabase env vars loaded");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
