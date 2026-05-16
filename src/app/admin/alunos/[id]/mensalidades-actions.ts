"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import type { ActionResult, Mensalidade } from "@/lib/types";

interface GerarResult extends ActionResult {
  mensalidade?: Mensalidade;
}

interface PresencaResult extends ActionResult {
  presencaId?: string;
  registrado_em?: string;
}

export async function marcarPago(mensalidadeId: string, alunoId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();
  const hoje = new Date().toISOString().split("T")[0];

  const { error } = await admin
    .from("mensalidades")
    .update({ status: "pago", data_pagamento: hoje })
    .eq("id", mensalidadeId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true };
}

export async function desmarcarPago(mensalidadeId: string, alunoId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const { error } = await admin
    .from("mensalidades")
    .update({ status: "pendente", data_pagamento: null })
    .eq("id", mensalidadeId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true };
}

export async function gerarProximoMes(alunoId: string): Promise<GerarResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const { data: ultima, error: errBusca } = await admin
    .from("mensalidades")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("mes_referencia", { ascending: false })
    .limit(1)
    .single();

  if (errBusca || !ultima) return { ok: false, erro: "Nenhuma mensalidade encontrada." };

  const [ano, mes] = ultima.mes_referencia.split("-").map(Number);
  const proximoAno  = mes === 12 ? ano + 1 : ano;
  const proximoMes  = mes === 12 ? 1 : mes + 1;
  const mesRef      = `${proximoAno}-${String(proximoMes).padStart(2, "0")}-01`;

  const { data: existe } = await admin
    .from("mensalidades")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("mes_referencia", mesRef)
    .maybeSingle();

  if (existe) return { ok: false, erro: "Mensalidade para esse mês já existe." };

  const diaVenc       = Number(ultima.data_vencimento.split("-")[2]);
  const ultimoDiaMes  = new Date(proximoAno, proximoMes, 0).getDate();
  const diaReal       = Math.min(diaVenc, ultimoDiaMes);
  const dataVenc      = `${proximoAno}-${String(proximoMes).padStart(2, "0")}-${String(diaReal).padStart(2, "0")}`;

  const { data: nova, error } = await admin
    .from("mensalidades")
    .insert({
      aluno_id:        alunoId,
      mes_referencia:  mesRef,
      data_vencimento: dataVenc,
      valor:           ultima.valor,
      status:          "pendente",
    })
    .select()
    .single();

  if (error || !nova) return { ok: false, erro: error?.message ?? "Erro ao inserir." };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true, mensalidade: nova as Mensalidade };
}

export async function adicionarPresenca(alunoId: string, data: string): Promise<PresencaResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;

  const hoje = new Date().toISOString().slice(0, 10);
  if (data > hoje) return { ok: false, erro: "Não é possível registrar presença para data futura." };

  const admin = createAdminClient();

  const { data: existe } = await admin
    .from("presencas")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("dia_registro", data)
    .maybeSingle();

  if (existe) return { ok: false, erro: "Já existe uma presença neste dia." };

  const { data: nova, error } = await admin
    .from("presencas")
    .insert({ aluno_id: alunoId, registrado_em: `${data}T12:00:00+00:00` })
    .select("id, registrado_em")
    .single();

  if (error || !nova) return { ok: false, erro: error?.message ?? "Erro ao inserir." };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true, presencaId: nova.id, registrado_em: nova.registrado_em };
}

export async function editarMensalidade(
  mensalidadeId: string,
  alunoId: string,
  dados: { valor: number; data_vencimento: string },
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const { error } = await admin
    .from("mensalidades")
    .update({ valor: dados.valor, data_vencimento: dados.data_vencimento })
    .eq("id", mensalidadeId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true };
}

export async function excluirMensalidade(mensalidadeId: string, alunoId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const { error } = await admin
    .from("mensalidades")
    .delete()
    .eq("id", mensalidadeId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true };
}

export async function excluirPresenca(presencaId: string, alunoId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const admin = createAdminClient();

  const { error } = await admin
    .from("presencas")
    .delete()
    .eq("id", presencaId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath(`/admin/alunos/${alunoId}`);
  return { ok: true };
}
