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

export function mascararTelefonePT(v: string): string {
  const digits = v.replace(/\D/g, "")
  if (!digits) return ""
  // Strip country code prefix if present
  const local = digits.startsWith("351") && digits.length > 9 ? digits.slice(3) : digits
  const d = local.slice(0, 9)
  if (d.length <= 3) return `+351 ${d}`
  if (d.length <= 6) return `+351 ${d.slice(0, 3)} ${d.slice(3)}`
  return `+351 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

export function formatarTelefonePT(phone: string | null | undefined): string {
  if (!phone) return "—"
  return phone.startsWith("+351") ? phone : `+351 ${phone}`
}

export function formatarData(date: string | null | undefined): string {
  if (!date) return "—"
  const d = new Date(date.includes("T") ? date : `${date}T00:00:00`)
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function formatarMes(mes: string | null | undefined): string {
  if (!mes) return "—"
  const [year, month] = mes.split("-")
  const m = parseInt(month, 10)
  return `${MESES_PT[m - 1] ?? mes} ${year}`
}

export function formatarMoeda(value: number | null | undefined): string {
  if (value == null) return "—"
  return value.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
}
