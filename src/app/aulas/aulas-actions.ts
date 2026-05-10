"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface ActionResult {
  ok: boolean;
  erro?: string;
  reservaId?: string;
}

async function verificarPermissao(userId: string, alunoId: string): Promise<boolean> {
  if (alunoId === userId) return true;
  const admin = createAdminClient();
  const { data } = await admin
    .from("dependentes")
    .select("dependente_id")
    .eq("responsavel_id", userId)
    .eq("dependente_id", alunoId)
    .maybeSingle();
  return !!data;
}

export async function reservar(aulaId: string, alunoId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  if (!(await verificarPermissao(user.id, alunoId))) {
    return { ok: false, erro: "Sem permissão." };
  }

  const admin = createAdminClient();

  const { data: aula } = await admin
    .from("aulas")
    .select("id, lotacao_maxima, status")
    .eq("id", aulaId)
    .single();

  if (!aula) return { ok: false, erro: "Aula não encontrada." };
  if (aula.status !== "agendada") return { ok: false, erro: "Esta aula não está disponível." };

  const { count } = await admin
    .from("reservas")
    .select("id", { count: "exact", head: true })
    .eq("aula_id", aulaId)
    .eq("status", "confirmada");

  if ((count ?? 0) >= aula.lotacao_maxima) {
    return { ok: false, erro: "Aula sem vagas disponíveis." };
  }

  const { data: existente } = await admin
    .from("reservas")
    .select("id, status")
    .eq("aula_id", aulaId)
    .eq("aluno_id", alunoId)
    .maybeSingle();

  if (existente) {
    if (existente.status === "confirmada") {
      return { ok: false, erro: "Já existe reserva nesta aula." };
    }
    const { error } = await admin
      .from("reservas")
      .update({ status: "confirmada" })
      .eq("id", existente.id);
    if (error) return { ok: false, erro: error.message };
    revalidatePath("/aulas");
    return { ok: true, reservaId: existente.id };
  }

  const { data: nova, error } = await admin
    .from("reservas")
    .insert({ aula_id: aulaId, aluno_id: alunoId, status: "confirmada" })
    .select("id")
    .single();

  if (error || !nova) return { ok: false, erro: error?.message ?? "Erro ao reservar." };

  revalidatePath("/aulas");
  return { ok: true, reservaId: nova.id };
}

export async function cancelarMinhaReserva(reservaId: string, alunoId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, erro: "Não autenticado." };

  if (!(await verificarPermissao(user.id, alunoId))) {
    return { ok: false, erro: "Sem permissão." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("reservas")
    .update({ status: "cancelada" })
    .eq("id", reservaId)
    .eq("aluno_id", alunoId);

  if (error) return { ok: false, erro: error.message };
  revalidatePath("/aulas");
  return { ok: true };
}
