import { createAdminClient } from "@/lib/supabase/admin";
import type { Aviso } from "@/lib/types";
import { AvisosView } from "./AvisosView";

export default async function AvisosPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("avisos")
    .select("*")
    .order("fixado", { ascending: false })
    .order("created_at", { ascending: false });

  return <AvisosView avisos={(data ?? []) as Aviso[]} />;
}
