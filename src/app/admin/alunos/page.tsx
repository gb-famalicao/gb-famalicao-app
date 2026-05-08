import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { AlunosView } from "./AlunosView";

export default async function AdminAlunosPage() {
  const supabase = createAdminClient();

  const [{ data }, { data: dependentesRows }] = await Promise.all([
    supabase.from("profiles").select("*").neq("perfil", "tablet").order("nome_completo"),
    supabase.from("dependentes").select("dependente_id, responsavel_id"),
  ]);

  const alunos = (data ?? []) as Profile[];

  const profilesById = new Map(alunos.map((a) => [a.id, a.nome_completo]));
  const responsaveisMap: Record<string, string> = {};
  for (const row of dependentesRows ?? []) {
    const nome = profilesById.get(row.responsavel_id as string);
    if (nome) responsaveisMap[row.dependente_id as string] = nome;
  }

  return <AlunosView alunos={alunos} responsaveisMap={responsaveisMap} />;
}
