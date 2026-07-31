// Regra tem de bater com a password policy configurada no Supabase Auth
// (Settings → Auth → Password requirements): mín. 8 caracteres, com
// maiúscula, minúscula e número.
export const REGRA_SENHA_TEXTO = "8+ caracteres, com maiúscula, minúscula e número.";

export function senhaValida(s: string): boolean {
  return s.length >= 8 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /[0-9]/.test(s);
}
