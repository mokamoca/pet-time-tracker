import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL または Anon Key が設定されていません (.env を確認してください)");
}


export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
