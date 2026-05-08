import { createAdminClient } from "@/lib/supabase/admin";
import { TurmasView } from "./TurmasView";

export default async function TurmasPage() {
  const admin = createAdminClient();

  const { data: turmas } = await admin
    .from("turmas")
    .select("*, professor:profiles(id, nome_completo)")
    .order("nome");

  return <TurmasView turmas={(turmas ?? []) as Parameters<typeof TurmasView>[0]["turmas"]} />;
}
