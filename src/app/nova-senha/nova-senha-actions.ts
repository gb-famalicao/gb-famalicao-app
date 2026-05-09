"use server";

import { createClient } from "@/lib/supabase/server";

export async function atualizarSenha(novaSenha: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  return { ok: !error, erro: error?.message };
}
