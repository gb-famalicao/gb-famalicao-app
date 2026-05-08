import { createClient } from "@supabase/supabase-js";

/** Cliente Supabase com service_role — apenas server-side, nunca expor ao cliente */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado no .env.local");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
