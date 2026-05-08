"use client";

import { useState } from "react";

export interface ChartDataPoint {
  label: string;
  total: number;
}

interface Props {
  semanalData: ChartDataPoint[];
  mensalData: ChartDataPoint[];
}

const MAX_BAR_H = 140;
const CHART_H   = 180; // MAX_BAR_H + ~40 para a label de valor acima

export function PresencasChart({ semanalData, mensalData }: Props) {
  const [view, setView] = useState<"semanas" | "meses">("semanas");
  const data   = view === "semanas" ? semanalData : mensalData;
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold text-gray-700">Presenças</h2>
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {(["semanas", "meses"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "semanas" ? "4 semanas" : "6 meses"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative px-1 overflow-visible" style={{ height: CHART_H }}>

        {/* Horizontal grid lines at 33 %, 66 %, 100 % of MAX_BAR_H from bottom */}
        {[0.33, 0.66, 1].map((ratio) => (
          <div
            key={ratio}
            className="absolute inset-x-1 border-t border-dashed border-gray-100 pointer-events-none"
            style={{ bottom: Math.round(ratio * MAX_BAR_H) }}
          />
        ))}

        {/* Bars — items-end aligns all columns to the same baseline */}
        <div className="absolute inset-0 flex items-end gap-2">
          {data.map((d) => {
            const barH = d.total > 0
              ? Math.max((d.total / maxVal) * MAX_BAR_H, 4)
              : 0;
            return (
              <div
                key={d.label}
                className="flex-1 flex flex-col items-center"
                style={{ gap: 4 }}
              >
                {/* Value label — invisible (not hidden) when 0 to preserve column height */}
                <span
                  className="text-xs font-semibold text-gray-500 leading-none tabular-nums"
                  style={{ visibility: d.total > 0 ? "visible" : "hidden" }}
                >
                  {d.total}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gb-blue transition-[height] duration-300 ease-out"
                  style={{ height: barH }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-2 px-1 mt-2 pt-2 border-t border-gray-100">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <span className="text-xs text-gray-400">{d.label}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
