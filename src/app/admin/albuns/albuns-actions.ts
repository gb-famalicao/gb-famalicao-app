"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

export async function criarAlbum(titulo: string, descricao: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin.from("albuns").insert({ titulo, descricao: descricao || null, autor_id: auth.userId });
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/albuns");
  return { ok: true };
}

export async function editarAlbum(id: string, titulo: string, descricao: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();
  const { error } = await admin.from("albuns").update({ titulo, descricao: descricao || null }).eq("id", id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/albuns");
  return { ok: true };
}

const BUCKET = "galeria";
const STORAGE_MARKER = `/object/public/${BUCKET}/`;

function storagePathFromUrl(url: string): string | null {
  const idx = url.indexOf(STORAGE_MARKER);
  return idx !== -1 ? url.slice(idx + STORAGE_MARKER.length) : null;
}

export async function apagarAlbum(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const { data: fotos } = await admin.from("fotos").select("url").eq("album_id", id);
  if (fotos && fotos.length > 0) {
    const paths = fotos.map((f) => storagePathFromUrl(f.url)).filter(Boolean) as string[];
    if (paths.length > 0) await admin.storage.from(BUCKET).remove(paths);
  }

  const { error: erroFotos } = await admin.from("fotos").delete().eq("album_id", id);
  if (erroFotos) return { ok: false, erro: erroFotos.message };
  const { error } = await admin.from("albuns").delete().eq("id", id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath("/admin/albuns");
  return { ok: true };
}
