import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TabletScannerWrapper } from "./TabletScannerWrapper";

export default async function TabletPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/tablet/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("perfil")
    .eq("id", user.id)
    .single();

  if (profile?.perfil !== "tablet") redirect("/perfil");

  return <TabletScannerWrapper />;
}
