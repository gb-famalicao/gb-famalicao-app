"use server";

import { createClient } from "@/lib/supabase/server";

export type LoginErro = "credenciais" | "nao_confirmado" | "generico";

export async function login(email: string, password: string): Promise<{ ok: boolean; tipoErro?: LoginErro }> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (!error) return { ok: true };

  if (error.message.includes("Email not confirmed")) {
    return { ok: false, tipoErro: "nao_confirmado" };
  }

  return { ok: false, tipoErro: "credenciais" };
}
