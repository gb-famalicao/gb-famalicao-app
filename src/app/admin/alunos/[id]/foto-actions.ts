"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function uploadFotoAluno(
  alunoId: string,
  formData: FormData,
): Promise<{ ok: boolean; url?: string; erro?: string }> {
  const file = formData.get("foto") as File | null;
  if (!file || file.size === 0) return { ok: false, erro: "Nenhum ficheiro enviado." };

  const admin = createAdminClient();
  const fileName = `${alunoId}.webp`;

  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(fileName, file, { contentType: "image/webp", upsert: true });

  if (uploadError) return { ok: false, erro: uploadError.message };

  const { data: { publicUrl } } = admin.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const { error: updateError } = await admin
    .from("profiles")
    .update({ foto_url: publicUrl })
    .eq("id", alunoId);

  if (updateError) return { ok: false, erro: updateError.message };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true, url: publicUrl };
}
