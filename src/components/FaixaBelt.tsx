"use client";

import { cn } from "@/lib/utils";
import type { CorFaixa } from "@/lib/types";

type FaixaInfo = {
  bg: string;
  secondary?: string;
  label: string;
  darkText?: boolean;
};

const FAIXA_COLORS: Record<CorFaixa, FaixaInfo> = {
  branca:         { bg: "bg-white border-gray-300",   label: "Branca",         darkText: true  },
  cinza_branca:   { bg: "bg-gray-400",  secondary: "bg-white",      label: "Cinza-Branca"           },
  cinza:          { bg: "bg-gray-400",                label: "Cinza"                              },
  cinza_preta:    { bg: "bg-gray-400",  secondary: "bg-gray-950",   label: "Cinza-Preta"            },
  amarela_branca: { bg: "bg-yellow-400",secondary: "bg-white",      label: "Amarela-Branca", darkText: true },
  amarela:        { bg: "bg-yellow-400",              label: "Amarela",        darkText: true  },
  amarela_preta:  { bg: "bg-yellow-400",secondary: "bg-gray-950",   label: "Amarela-Preta",  darkText: true },
  laranja_branca: { bg: "bg-orange-500",secondary: "bg-white",      label: "Laranja-Branca"         },
  laranja:        { bg: "bg-orange-500",              label: "Laranja"                            },
  laranja_preta:  { bg: "bg-orange-500",secondary: "bg-gray-950",   label: "Laranja-Preta"          },
  verde_branca:   { bg: "bg-green-600", secondary: "bg-white",      label: "Verde-Branca"           },
  verde:          { bg: "bg-green-600",               label: "Verde"                              },
  verde_preta:    { bg: "bg-green-600", secondary: "bg-gray-950",   label: "Verde-Preta"            },
  azul:           { bg: "bg-blue-600",                label: "Azul"                               },
  roxa:           { bg: "bg-purple-700",              label: "Roxa"                               },
  marrom:         { bg: "bg-amber-800",               label: "Marrom"                             },
  preta:          { bg: "bg-gray-900",                label: "Preta"                              },
  coral:          { bg: "bg-red-400",                 label: "Coral"                              },
  vermelha:       { bg: "bg-red-600",                 label: "Vermelha"                           },
};

interface FaixaBeltProps {
  cor: CorFaixa;
  graus: number;
  className?: string;
}

export function FaixaBelt({ cor, graus, className }: FaixaBeltProps) {
  const faixa = FAIXA_COLORS[cor] ?? FAIXA_COLORS.branca;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Belt visual */}
      <div className="relative w-full max-w-xs h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
        {/* Main belt color */}
        <div className={cn("absolute inset-0", faixa.bg)} />
        {/* Secondary color stripe for mixed belts (sits between main color and black tip) */}
        {faixa.secondary && (
          <div className={cn("absolute right-12 top-0 bottom-0 w-8", faixa.secondary)} />
        )}
        {/* Black tip (ponta preta) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gray-900" />
        {/* Grau dots on the black tip */}
        <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center gap-1 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full border border-white/50 transition-all",
                i < graus ? "bg-white" : "bg-transparent"
              )}
            />
          ))}
        </div>
        {/* Center logo area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "text-xs font-bold tracking-widest uppercase",
            faixa.darkText ? "text-gray-800" : "text-white"
          )}>
            GB
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-semibold text-gray-900">{faixa.label}</p>
        <p className="text-sm text-gray-500">
          {graus === 0 ? "Sem graus" : `${graus} ${graus === 1 ? "grau" : "graus"}`}
        </p>
      </div>
    </div>
  );
}
