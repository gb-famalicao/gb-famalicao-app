"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CorFaixa, CategoriaFaixa, HistoricoGraduacao } from "@/lib/types";

export async function registrarGraduacao(
  alunoId: string,
  faixaAnterior: CorFaixa | null,
  grausAnterior: number,
  faixaNova: CorFaixa,
  grausNova: number,
  categoria: CategoriaFaixa,
  dataGraduacao: string,
  observacoes?: string,
): Promise<{ ok: true; graduacao: HistoricoGraduacao } | { ok: false; erro: string }> {
  const admin = createAdminClient();
  const auth  = await createClient();
  const { data: { user } } = await auth.auth.getUser();

  const { error: profileError } = await admin
    .from("profiles")
    .update({ faixa: faixaNova, graus: grausNova, categoria })
    .eq("id", alunoId);

  if (profileError) return { ok: false, erro: profileError.message };

  const { data, error } = await admin
    .from("historico_graduacoes")
    .insert({
      aluno_id:       alunoId,
      faixa_anterior: faixaAnterior,
      graus_anterior: grausAnterior,
      faixa_nova:     faixaNova,
      graus_nova:     grausNova,
      graduado_por:   user?.id ?? null,
      data_graduacao: dataGraduacao,
      observacoes:    observacoes || null,
    })
    .select("*, professor:profiles!historico_graduacoes_graduado_por_fkey(nome_completo)")
    .single();

  if (error) return { ok: false, erro: error.message };
  return { ok: true, graduacao: data as HistoricoGraduacao };
}

export async function excluirGraduacao(
  id: string,
): Promise<{ ok: boolean; erro?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("historico_graduacoes")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}
