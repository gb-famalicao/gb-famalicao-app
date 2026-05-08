import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CorFaixa } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LABEL_COR_FAIXA: Record<CorFaixa, string> = {
  branca:        "Branca",
  cinza_branca:  "Cinza/Branca",
  cinza:         "Cinza",
  cinza_preta:   "Cinza/Preta",
  amarela_branca:"Amarela/Branca",
  amarela:       "Amarela",
  amarela_preta: "Amarela/Preta",
  laranja_branca:"Laranja/Branca",
  laranja:       "Laranja",
  laranja_preta: "Laranja/Preta",
  verde_branca:  "Verde/Branca",
  verde:         "Verde",
  verde_preta:   "Verde/Preta",
  azul:          "Azul",
  roxa:          "Roxa",
  marrom:        "Marrom",
  preta:         "Preta",
  coral:         "Coral",
  vermelha:      "Vermelha",
}

export function labelCorFaixa(faixa: CorFaixa): string {
  return LABEL_COR_FAIXA[faixa] ?? faixa
}
