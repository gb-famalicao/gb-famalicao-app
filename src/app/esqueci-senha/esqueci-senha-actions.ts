"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function enviarResetSenha(email: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const origin = headersList.get("origin") ?? headersList.get("x-forwarded-host") ?? "";
  const redirectTo = `${origin}/auth/callback?next=/nova-senha`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  return { ok: !error };
}
