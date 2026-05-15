"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const BUCKET = "galeria";
const STORAGE_MARKER = `/object/public/${BUCKET}/`;
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function storagePathFromUrl(url: string): string | null {
  const idx = url.indexOf(STORAGE_MARKER);
  return idx !== -1 ? url.slice(idx + STORAGE_MARKER.length) : null;
}

export interface UploadResult {
  ok: boolean;
  uploaded: number;
  erros: string[];
}

export async function uploadFotos(albumId: string, formData: FormData): Promise<UploadResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, uploaded: 0, erros: [auth.erro] };

  const files = formData.getAll("fotos") as File[];
  if (!files.length) return { ok: false, uploaded: 0, erros: ["Nenhum ficheiro enviado."] };

  const admin = createAdminClient();
  const erros: string[] = [];
  let uploaded = 0;

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      erros.push(`${file.name}: formato não suportado.`);
      continue;
    }
    if (file.size > MAX_SIZE) {
      erros.push(`${file.name}: excede 5MB.`);
      continue;
    }

    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${crypto.randomUUID()}.${ext}`;
    const path = `${albumId}/${filename}`;

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      erros.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(path);

    const { error: dbError } = await admin.from("fotos").insert({
      album_id: albumId,
      url: publicUrl,
      autor_id: auth.userId,
    });

    if (dbError) {
      erros.push(`${file.name}: ${dbError.message}`);
      await admin.storage.from(BUCKET).remove([path]);
      continue;
    }

    uploaded++;
  }

  revalidatePath(`/admin/albuns/${albumId}/fotos`);
  revalidatePath("/admin/albuns");
  return { ok: uploaded > 0 || erros.length === 0, uploaded, erros };
}

export async function apagarFoto(
  fotoId: string,
  fotoUrl: string,
  albumId: string,
): Promise<{ ok: boolean; erro?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const path = storagePathFromUrl(fotoUrl);
  if (path) await admin.storage.from(BUCKET).remove([path]);

  const { data: album } = await admin.from("albuns").select("capa_url").eq("id", albumId).single();
  if (album?.capa_url === fotoUrl) {
    await admin.from("albuns").update({ capa_url: null }).eq("id", albumId);
  }

  const { error } = await admin.from("fotos").delete().eq("id", fotoId);
  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/admin/albuns/${albumId}/fotos`);
  revalidatePath("/admin/albuns");
  revalidatePath("/galeria");
  return { ok: true };
}

export async function definirCapa(
  albumId: string,
  fotoUrl: string,
): Promise<{ ok: boolean; erro?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();
  const { error } = await admin.from("albuns").update({ capa_url: fotoUrl }).eq("id", albumId);
  if (error) return { ok: false, erro: error.message };
  revalidatePath(`/admin/albuns/${albumId}/fotos`);
  revalidatePath("/admin/albuns");
  revalidatePath("/galeria");
  return { ok: true };
}

export async function editarLegenda(
  fotoId: string,
  legenda: string,
  albumId: string,
): Promise<{ ok: boolean; erro?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();
  const { error } = await admin
    .from("fotos")
    .update({ legenda: legenda.trim() || null })
    .eq("id", fotoId);
  if (error) return { ok: false, erro: error.message };
  revalidatePath(`/admin/albuns/${albumId}/fotos`);
  return { ok: true };
}
