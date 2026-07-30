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
