"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { telefoneLimpo } from "@/lib/phone";
import { revalidatePath } from "next/cache";

export interface AgendarExperimentalResult {
  ok: boolean;
  erro?: string;
}

export async function agendarExperimental(formData: FormData): Promise<AgendarExperimentalResult> {
  const tipo             = (formData.get("tipo") as string) || "";
  const aula_id          = (formData.get("aula_id") as string) || "";
  const nome             = ((formData.get("nome") as string) ?? "").trim();
  const nome_responsavel = ((formData.get("nome_responsavel") as string) ?? "").trim();
  const nome_aluno       = ((formData.get("nome_aluno") as string) ?? "").trim();
  const idadeRaw         = formData.get("idade") as string | null;
  const idade            = idadeRaw ? Number(idadeRaw) : null;
  const telefone         = telefoneLimpo(((formData.get("telefone") as string) ?? ""));

  if (tipo !== "adulto" && tipo !== "infantil") {
    return { ok: false, erro: "Seleciona adulto ou infantil." };
  }
  if (!aula_id) return { ok: false, erro: "Seleciona uma data disponível." };
  if (!telefone) return { ok: false, erro: "Telemóvel é obrigatório." };

  if (tipo === "adulto") {
    if (!nome) return { ok: false, erro: "Nome é obrigatório." };
  } else {
    if (!idade || idade < 3 || idade > 12) return { ok: false, erro: "Idade inválida." };
    if (!nome_responsavel) return { ok: false, erro: "Nome do responsável é obrigatório." };
    if (!nome_aluno) return { ok: false, erro: "Nome do aluno(a) é obrigatório." };
  }

  const admin = createAdminClient();

  const { data: aulaRaw, error: aulaError } = await admin
    .from("aulas")
    .select("id, data, status, lotacao_maxima, turma:turmas(nome, ativa, apenas_experimental)")
    .eq("id", aula_id)
    .single();

  if (aulaError || !aulaRaw) return { ok: false, erro: "Data inválida." };

  const aula = aulaRaw as unknown as {
    id: string; data: string; status: string; lotacao_maxima: number;
    turma: { nome: string; ativa: boolean; apenas_experimental: boolean } | null;
  };
  const turma = aula.turma;
  const hoje = new Date().toISOString().split("T")[0];

  if (
    aula.status !== "agendada" ||
    aula.data < hoje ||
    !turma?.ativa ||
    !turma?.apenas_experimental
  ) {
    return { ok: false, erro: "Esta data já não está disponível." };
  }

  const turmaNome = turma.nome.toLowerCase();
  const tipoValido =
    tipo === "adulto"
      ? turmaNome.includes("adulto")
      : idade! <= 6
        ? turmaNome.includes("kids")
        : turmaNome.includes("juniores");

  if (!tipoValido) return { ok: false, erro: "Turma inválida para os dados selecionados." };

  const { count } = await admin
    .from("agendamentos_experimental")
    .select("id", { count: "exact", head: true })
    .eq("aula_id", aula_id);

  if ((count ?? 0) >= aula.lotacao_maxima) {
    return { ok: false, erro: "Vaga preenchida entretanto. Escolhe outro horário." };
  }

  const { error: insertError } = await admin.from("agendamentos_experimental").insert({
    aula_id,
    tipo,
    nome: tipo === "adulto" ? nome : null,
    nome_responsavel: tipo === "infantil" ? nome_responsavel : null,
    nome_aluno: tipo === "infantil" ? nome_aluno : null,
    idade: tipo === "infantil" ? idade : null,
    telefone,
  });

  if (insertError) return { ok: false, erro: "Erro ao agendar. Tenta novamente." };

  revalidatePath("/aula-experimental");
  return { ok: true };
}
