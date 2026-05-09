"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function verificarEmailExistente(email: string): Promise<boolean> {
  const supabase = createAdminClient();
  const emailNorm = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error || !data) return false;
  return data.users.some((u) => u.email?.toLowerCase() === emailNorm);
}
