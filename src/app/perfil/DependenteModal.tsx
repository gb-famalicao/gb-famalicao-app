"use client";

import { useEffect, useState } from "react";
import { X, Award, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FaixaBJJ, inferCategoria } from "@/components/FaixaBJJ";
import { formatarData, labelCorFaixa } from "@/lib/utils";
import type { DependentePerfil, HistoricoGraduacao } from "@/lib/types";

interface Props {
  dependente: DependentePerfil;
  onClose: () => void;
}

export function DependenteModal({ dependente, onClose }: Props) {
  const [presencasCount, setPresencasCount] = useState<number | null>(null);
  const [presencasRecentes, setPresencasRecentes] = useState<{ registrado_em: string }[]>([]);
  const [graduacoes, setGraduacoes] = useState<HistoricoGraduacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const supabase = createClient();
      const [
        { count },
        { data: recentes },
        { data: grads },
      ] = await Promise.all([
        supabase
          .from("presencas")
          .select("id", { count: "exact", head: true })
          .eq("aluno_id", dependente.id),
        supabase
          .from("presencas")
          .select("registrado_em")
          .eq("aluno_id", dependente.id)
          .order("registrado_em", { ascending: false })
          .limit(5),
        supabase
          .from("historico_graduacoes")
          .select("*, professor:profiles!historico_graduacoes_graduado_por_fkey(nome_completo)")
          .eq("aluno_id", dependente.id)
          .order("data_graduacao", { ascending: false }),
      ]);

      setPresencasCount(count ?? 0);
      setPresencasRecentes(recentes ?? []);
      setGraduacoes((grads ?? []) as HistoricoGraduacao[]);
      setCarregando(false);
    }

    carregar();
  }, [dependente.id]);

  const iniciais = dependente.nome_completo
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gb-blue flex items-center justify-center overflow-hidden shrink-0">
              {dependente.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dependente.foto_url} alt={dependente.nome_completo} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-base">{iniciais}</span>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">{dependente.nome_completo}</p>
              {dependente.faixa && (
                <p className="text-xs text-gray-400">
                  {labelCorFaixa(dependente.faixa)} · {dependente.graus} grau{dependente.graus !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {carregando ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-gb-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {dependente.faixa && (
                <div className="bg-gb-gray rounded-2xl p-4">
                  <FaixaBJJ
                    faixa={dependente.faixa}
                    graus={dependente.graus}
                    categoria={dependente.categoria}
                    tamanho="md"
                    showLabel
                  />
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={16} className="text-gb-blue" />
                  <h3 className="font-bold text-gray-900 text-sm">Presenças</h3>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-black text-gb-blue">{presencasCount}</span>
                  <span className="text-sm text-gray-400">aulas</span>
                </div>
                {presencasRecentes.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Últimas</p>
                    {presencasRecentes.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gb-blue shrink-0" />
                        <p className="text-sm text-gray-700">
                          {new Date(p.registrado_em).toLocaleDateString("pt-PT", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {graduacoes.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={16} className="text-gb-blue" />
                    <h3 className="font-bold text-gray-900 text-sm">Evolução</h3>
                  </div>
                  <div className="relative pl-8">
                    {graduacoes.length > 1 && (
                      <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200 rounded-full" />
                    )}
                    {graduacoes.map((g) => (
                      <div key={g.id} className="relative mb-4 last:mb-0">
                        <div className="absolute -left-8 top-0.5 w-6 h-6 rounded-full bg-gb-blue border-2 border-white flex items-center justify-center shadow-sm z-10">
                          <Award size={10} className="text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-gray-400">{formatarData(g.data_graduacao)}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {g.faixa_anterior && (
                              <>
                                <FaixaBJJ
                                  faixa={g.faixa_anterior}
                                  graus={g.graus_anterior ?? 0}
                                  categoria={inferCategoria(g.faixa_anterior)}
                                  tamanho="sm"
                                  showLabel
                                />
                                <span className="text-gray-400 text-lg font-light">→</span>
                              </>
                            )}
                            <FaixaBJJ
                              faixa={g.faixa_nova}
                              graus={g.graus_nova}
                              categoria={inferCategoria(g.faixa_nova)}
                              tamanho="sm"
                              showLabel
                            />
                          </div>
                          {g.professor && (
                            <p className="text-xs text-gray-400">{g.professor.nome_completo}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
