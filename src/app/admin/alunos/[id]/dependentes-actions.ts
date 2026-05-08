"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function atualizarResponsavel(
  dependenteId: string,
  responsavelId: string | null,
): Promise<{ ok: boolean; erro?: string }> {
  const admin = createAdminClient();

  const { error: delErr } = await admin
    .from("dependentes")
    .delete()
    .eq("dependente_id", dependenteId);

  if (delErr) return { ok: false, erro: delErr.message };

  if (responsavelId) {
    const { error: insErr } = await admin.from("dependentes").insert({
      dependente_id:  dependenteId,
      responsavel_id: responsavelId,
    });
    if (insErr) return { ok: false, erro: insErr.message };
  }

  revalidatePath(`/admin/alunos/${dependenteId}`);
  return { ok: true };
}
