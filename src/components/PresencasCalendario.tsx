"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Dumbbell, X, Loader2 } from "lucide-react";

export interface PresencaItem {
  id?: string;
  registrado_em: string;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

interface Props {
  presencas: PresencaItem[];
  onExcluirPresenca?: (id: string) => Promise<void>;
}

export function PresencasCalendario({ presencas, onExcluirPresenca }: Props) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [excluindo, setExcluindo] = useState<string | null>(null);

  const esMesAtual = mes === hoje.getMonth() && ano === hoje.getFullYear();

  const presencasNoMes = useMemo(
    () => presencas.filter((p) => {
      const d = new Date(p.registrado_em);
      return d.getMonth() === mes && d.getFullYear() === ano;
    }),
    [presencas, mes, ano]
  );

  const diasTreinados = useMemo(
    () => new Set(presencasNoMes.map((p) => new Date(p.registrado_em).getDate())),
    [presencasNoMes]
  );

  const calendarioCells = useMemo(() => {
    const offset = new Date(ano, mes, 1).getDay();
    const total = new Date(ano, mes + 1, 0).getDate();
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [mes, ano]);

  function navMes(delta: number) {
    let m = mes + delta;
    let a = ano;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    setMes(m);
    setAno(a);
  }

  function formatarHora(iso: string) {
    return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function formatarDataLista(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long",
    });
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta presença?")) return;
    setExcluindo(id);
    try {
      await onExcluirPresenca?.(id);
    } catch {
      // error is handled by parent; nothing to show here
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Seletor de mês + resumo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navMes(-1)}
            title="Mês anterior"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-900 text-sm">{MESES[mes]}</p>
            <p className="text-xs text-gray-400">{ano}</p>
          </div>
          <button
            type="button"
            onClick={() => navMes(1)}
            disabled={esMesAtual}
            title="Próximo mês"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
        <div className="mt-3 text-center">
          <p className="text-2xl font-black text-gb-blue tabular-nums">{presencasNoMes.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            presença{presencasNoMes.length !== 1 ? "s" : ""} em {MESES[mes].toLowerCase()}
          </p>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-7 mb-2">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarioCells.map((dia, i) => {
            if (dia === null) return <div key={`e-${i}`} />;
            const treinou = diasTreinados.has(dia);
            const eHoje = esMesAtual && hoje.getDate() === dia;
            return (
              <div
                key={dia}
                className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium select-none
                  ${treinou ? "bg-gb-blue text-white font-bold shadow-sm"
                    : eHoje ? "bg-gb-gray border-2 border-gb-blue text-gb-blue font-bold"
                    : "bg-gray-50 text-gray-400"}`}
              >
                {dia}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gb-blue" />
            <span className="text-xs text-gray-400">Treinou</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-200" />
            <span className="text-xs text-gray-400">Sem treino</span>
          </div>
        </div>
      </div>

      {/* Lista */}
      {presencasNoMes.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="font-bold text-gray-900 text-sm">Registros de {MESES[mes].toLowerCase()}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {presencasNoMes.map((p, i) => (
              <div key={p.id ?? i} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gb-blue/10 flex items-center justify-center shrink-0">
                    <Dumbbell size={12} className="text-gb-blue" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {formatarDataLista(p.registrado_em)}
                  </span>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm text-gray-400 tabular-nums">{formatarHora(p.registrado_em)}</span>
                  {onExcluirPresenca && p.id && (
                    <button
                      type="button"
                      onClick={() => handleExcluir(p.id!)}
                      disabled={excluindo === p.id}
                      title="Excluir presença"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {excluindo === p.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <X size={12} />
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <CalendarDays size={36} className="text-gray-200 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Nenhuma presença em {MESES[mes].toLowerCase()}</p>
        </div>
      )}
    </div>
  );
}
