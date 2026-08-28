import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

/**
 * Formatta um telefone PT em `+351 XXX XXX XXX` para inputs legados.
 * Mantido para compat de dados antigos guardados sem prefixo.
 */
export function formatarTelefone(valor: string): string {
  let digits: string;
  if (valor.startsWith("+351")) {
    digits = valor.slice(4).replace(/\D/g, "");
  } else if (valor.startsWith("351")) {
    digits = valor.slice(3).replace(/\D/g, "");
  } else {
    digits = valor.replace(/\D/g, "");
  }
  digits = digits.slice(0, 9);
  if (!digits) return "+351 ";
  if (digits.length <= 3) return `+351 ${digits}`;
  if (digits.length <= 6) return `+351 ${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `+351 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function telefoneLimpo(telefone: string): string | null {
  return telefone.replace(/\D/g, "").length > 3 ? telefone.trim() : null;
}

/**
 * Normaliza qualquer telefone (E.164, legado PT, com espaços) para o formato E.164
 * que o `<PhoneInput>` da lib `react-phone-number-input` aceita como `value`.
 * Se não conseguir parsear, devolve `undefined`.
 */
export function telefoneParaE164(raw: string | null | undefined, defaultCountry: CountryCode = "PT"): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (parsed && parsed.isValid()) return parsed.number;

  return undefined;
}

/**
 * Formata um telefone (E.164 ou legado) para apresentação humana.
 * `+351911234567` → `+351 911 234 567`.
 * Se falhar, devolve o valor original.
 */
export function telefoneParaExibir(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const parsed = parsePhoneNumberFromString(trimmed, "PT");
  if (parsed) return parsed.formatInternational();

  return trimmed;
}

/**
 * Devolve o número sem `+` nem espaços — pronto para links `https://wa.me/…`.
 */
export function telefoneParaWhatsApp(raw: string | null | undefined): string | null {
  const e164 = telefoneParaE164(raw);
  if (!e164) return null;
  return e164.replace(/\D/g, "");
}
