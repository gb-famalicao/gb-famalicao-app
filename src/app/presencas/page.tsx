import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PresencasView, type PresencaItem } from "./PresencasView";

export default async function PresencasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: presencas } = await supabase
    .from("presencas")
    .select("registrado_em")
    .order("registrado_em", { ascending: false });

  return <PresencasView presencas={(presencas ?? []) as PresencaItem[]} />;
}
