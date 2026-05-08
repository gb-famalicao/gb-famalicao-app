"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ActionResult {
  ok: boolean;
  erro?: string;
}

export async function criarAviso(
  titulo: string,
  conteudo: string,
  fixado: boolean,
  publicado: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("avisos")
    .insert({ titulo, conteudo, fixado, publicado, autor_id: user.id });
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/avisos");
  return { ok: true };
}

export async function editarAviso(
  id: string,
  titulo: string,
  conteudo: string,
  fixado: boolean,
  publicado: boolean
): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("avisos")
    .update({ titulo, conteudo, fixado, publicado })
    .eq("id", id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/avisos");
  return { ok: true };
}

export async function apagarAviso(id: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("avisos").delete().eq("id", id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/avisos");
  return { ok: true };
}

export async function toggleFixado(id: string, fixado: boolean): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("avisos").update({ fixado }).eq("id", id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/avisos");
  return { ok: true };
}

export async function togglePublicado(id: string, publicado: boolean): Promise<ActionResult> {
  const admin = createAdminClient();
  const { error } = await admin.from("avisos").update({ publicado }).eq("id", id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/avisos");
  return { ok: true };
}
