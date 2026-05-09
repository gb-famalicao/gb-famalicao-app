import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Verify caller is admin or professor
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, erro: "Não autenticado" }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("perfil")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.perfil !== "admin" && profile.perfil !== "professor")) {
    return NextResponse.json({ ok: false, erro: "Sem permissão" }, { status: 403 });
  }

  const { userId } = await req.json() as { userId: string };
  if (!userId) {
    return NextResponse.json({ ok: false, erro: "userId obrigatório" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
