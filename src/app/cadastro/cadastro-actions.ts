"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CorFaixa, CategoriaFaixa } from "@/lib/types";

export async function verificarEmailExistente(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  const emailNorm = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data) return false;
  return data.users.some((u) => u.email?.toLowerCase() === emailNorm);
}

export async function concluirCadastroResponsavel(params: {
  nomeResponsavel: string;
  telefone: string | null;
  contactoEmergencia: string | null;
  nif: string | null;
  nomeAluno: string;
  dataNascAluno: string | null;
  nifAluno: string | null;
  faixaAluno: CorFaixa | null;
  grausAluno: number;
  categoriaAluno: CategoriaFaixa;
}): Promise<{ ok: boolean; erro?: string }> {
  try {
    const supabase = await createClient();
    const { data, error: authErr } = await supabase.auth.getUser();
    if (authErr || !data?.user) return { ok: false, erro: "Sessão expirada. Começa o registo novamente." };
    const user = data.user;

    const admin = createAdminClient();
    const alunoId = crypto.randomUUID();

    const { error: respErr } = await admin
      .from("profiles")
      .update({
        nome_completo: params.nomeResponsavel,
        telefone: params.telefone,
        contacto_emergencia: params.contactoEmergencia,
        nif: params.nif,
      })
      .eq("id", user.id);

    if (respErr) return { ok: false, erro: `Erro ao guardar dados do responsável: ${respErr.message}` };

    const { error: alunoErr } = await admin.from("profiles").insert({
      id: alunoId,
      nome_completo: params.nomeAluno,
      data_nascimento: params.dataNascAluno,
      nif: params.nifAluno,
      faixa: params.faixaAluno,
      graus: params.grausAluno,
      categoria: params.categoriaAluno,
      perfil: "aluno",
      status: "ativo",
      sem_login: true,
    });

    if (alunoErr) return { ok: false, erro: `Erro ao criar perfil do aluno: ${alunoErr.message}` };

    const { error: depErr } = await admin.from("dependentes").insert({
      responsavel_id: user.id,
      dependente_id: alunoId,
    });

    if (depErr) return { ok: false, erro: `Erro ao vincular aluno: ${depErr.message}` };

    return { ok: true };
  } catch (err) {
    return { ok: false, erro: err instanceof Error ? err.message : "Erro inesperado no servidor." };
  }
}
