"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

interface ActionResult {
  ok: boolean;
  erro?: string;
}

export async function marcarPago(mensalidadeId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const hoje = new Date().toISOString().split("T")[0];

  const { error } = await admin
    .from("mensalidades")
    .update({ status: "pago", data_pagamento: hoje })
    .eq("id", mensalidadeId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/financeiro");
  return { ok: true };
}

export async function desmarcarPago(mensalidadeId: string): Promise<ActionResult> {
  const admin = createAdminClient();
  const hoje = new Date().toISOString().split("T")[0];

  const { data: m, error: errBusca } = await admin
    .from("mensalidades")
    .select("data_vencimento")
    .eq("id", mensalidadeId)
    .single();

  if (errBusca || !m) return { ok: false, erro: errBusca?.message ?? "Mensalidade não encontrada." };

  const novoStatus = m.data_vencimento < hoje ? "atrasado" : "pendente";

  const { error } = await admin
    .from("mensalidades")
    .update({ status: novoStatus, data_pagamento: null })
    .eq("id", mensalidadeId);

  if (error) return { ok: false, erro: error.message };

  revalidatePath("/admin/financeiro");
  return { ok: true };
}
