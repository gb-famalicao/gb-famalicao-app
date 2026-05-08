import { createAdminClient } from "@/lib/supabase/admin";
import { FinanceiroView } from "./FinanceiroView";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("mensalidades")
    .select("*, profiles(nome_completo)")
    .order("mes_referencia", { ascending: false })
    .order("data_vencimento", { ascending: false });

  return <FinanceiroView mensalidades={data ?? []} />;
}
