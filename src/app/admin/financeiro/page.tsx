import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { FinanceiroView } from "./FinanceiroView";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("perfil").eq("id", user.id).single();
    if (profile?.perfil !== "admin") redirect("/admin");
  }

  const admin = createAdminClient();

  const { data } = await admin
    .from("mensalidades")
    .select("*, profiles(nome_completo)")
    .order("mes_referencia", { ascending: false })
    .order("data_vencimento", { ascending: false });

  return <FinanceiroView mensalidades={data ?? []} />;
}
