import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { StatusAula, StatusReserva, CategoriaFaixa } from "@/lib/types";
import { AulasView, type AulaParaAluno } from "./AulasView";

interface AulaRow {
  id: string;
  turma_id: string;
  data: string;
  horario: string;
  lotacao_maxima: number;
  status: string;
  turma: { id: string; nome: string; categoria: string; ativa: boolean } | null;
}

export default async function AulasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Fetch student's category
  const { data: profile } = await admin
    .from("profiles")
    .select("categoria")
    .eq("id", user.id)
    .single();

  const categoria: CategoriaFaixa = (profile?.categoria as CategoriaFaixa) ?? "adulto";

  const hoje  = new Date().toISOString().split("T")[0];
  const fim   = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data: aulasRaw } = await admin
    .from("aulas")
    .select("id, turma_id, data, horario, lotacao_maxima, status, turma:turmas(id, nome, categoria, ativa)")
    .gte("data", hoje)
    .lte("data", fim)
    .eq("status", "agendada")
    .order("data")
    .order("horario");

  // Filter: active turmas matching student's category
  const aulas = ((aulasRaw ?? []) as unknown as AulaRow[]).filter(
    (a) => a.turma?.ativa && a.turma.categoria === categoria,
  );

  const aulaIds = aulas.map((a) => a.id);

  const [reservasRes, minhasRes] = await Promise.all([
    aulaIds.length > 0
      ? admin.from("reservas").select("aula_id").in("aula_id", aulaIds).eq("status", "confirmada")
      : { data: [] as { aula_id: string }[] },
    aulaIds.length > 0
      ? admin.from("reservas").select("id, aula_id, status").eq("aluno_id", user.id).in("aula_id", aulaIds)
      : { data: [] as { id: string; aula_id: string; status: string }[] },
  ]);

  const contagem: Record<string, number> = {};
  for (const r of (reservasRes.data ?? [])) {
    contagem[r.aula_id] = (contagem[r.aula_id] ?? 0) + 1;
  }

  const minhasMap: Record<string, { id: string; status: StatusReserva }> = {};
  for (const r of (minhasRes.data ?? [])) {
    minhasMap[r.aula_id] = { id: r.id, status: r.status as StatusReserva };
  }

  const aulasParaAluno: AulaParaAluno[] = aulas.map((a) => ({
    id:             a.id,
    turma_id:       a.turma_id,
    data:           a.data,
    horario:        a.horario,
    lotacao_maxima: a.lotacao_maxima,
    status:         a.status as StatusAula,
    turma:          a.turma ? { id: a.turma.id, nome: a.turma.nome, categoria: a.turma.categoria as CategoriaFaixa } : null,
    reservas_confirmadas: contagem[a.id] ?? 0,
    minha_reserva_id:     minhasMap[a.id]?.id ?? null,
    minha_reserva_status: minhasMap[a.id]?.status ?? null,
  }));

  return <AulasView aulas={aulasParaAluno} categoriaAluno={categoria} />;
}
