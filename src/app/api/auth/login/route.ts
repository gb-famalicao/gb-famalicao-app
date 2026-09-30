import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { PerfilUsuario } from "@/lib/types";

export type LoginErro = "credenciais" | "nao_confirmado" | "perfil" | "generico";

/**
 * Login por Route Handler em vez de Server Action.
 *
 * Motivo: em WebKit antigo (Safari 15 do iPad da recepção) o caminho das Server
 * Actions + router RSC não estabelecia sessão — o cookie não chegava ao pedido
 * seguinte e o middleware devolvia o utilizador ao ecrã de login. Um POST normal
 * com Set-Cookie do servidor, seguido de navegação dura no cliente, é o caminho
 * mais compatível. Também evita o corte de 7 dias que o ITP do Safari aplica a
 * cookies escritos via document.cookie.
 */
export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown; perfilEsperado?: unknown };

  try {
    body = await request.json();
  } catch {
    return erro("generico");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const perfilEsperado =
    typeof body.perfilEsperado === "string" ? (body.perfilEsperado as PerfilUsuario) : null;

  if (!email || !password) return erro("credenciais");

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cookieStore.set(name, value, options as any)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    if (error?.message.includes("Email not confirmed")) return erro("nao_confirmado");
    return erro("credenciais");
  }

  // Verificação de perfil server-side (ex.: só a conta do tablet entra em /tablet)
  if (perfilEsperado) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("perfil")
      .eq("id", data.user.id)
      .single();

    if (profile?.perfil !== perfilEsperado) {
      await supabase.auth.signOut();
      return erro("perfil");
    }
  }

  return NextResponse.json({ ok: true });
}

function erro(tipoErro: LoginErro) {
  return NextResponse.json({ ok: false, tipoErro }, { status: 200 });
}
