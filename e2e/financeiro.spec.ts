import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

// Uses admin storageState from playwright.config.ts

let seedMensalidadeId: string | undefined;
let alunoUserId: string | undefined;

test.beforeAll(async () => {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Find the test aluno user created by global-setup
  const { data: { users } } = await admin.auth.admin.listUsers();
  const alunoUser = users.find(
    (u) => u.email === process.env.PLAYWRIGHT_TEST_EMAIL
  );
  if (!alunoUser) throw new Error("Test aluno not found — run global-setup first");
  alunoUserId = alunoUser.id;

  // Seed a mensalidade in "pendente" state for the test aluno
  const now = new Date();
  const mesRef = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const dataVenc = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-05`;

  const { data, error } = await admin
    .from("mensalidades")
    .upsert(
      {
        aluno_id: alunoUserId,
        mes_referencia: mesRef,
        data_vencimento: dataVenc,
        valor: 62,
        status: "pendente",
        data_pagamento: null,
      },
      { onConflict: "aluno_id,mes_referencia" }
    )
    .select("id")
    .single();

  if (error || !data) throw new Error(`Seed failed: ${error?.message}`);
  seedMensalidadeId = data.id;
});

test.afterAll(async () => {
  if (!seedMensalidadeId) return;
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  await admin.from("mensalidades").delete().eq("id", seedMensalidadeId);
});

test.describe("Financeiro — marcar/desmarcar pago", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/financeiro");
    await expect(page).toHaveURL(/\/admin\/financeiro/, { timeout: 10_000 });
    // Wait for table to load
    await expect(page.getByText("Aluno Teste E2E")).toBeVisible({ timeout: 10_000 });
  });

  test("renders mensalidades table as admin", async ({ page }) => {
    // Table headers visible — use columnheader role to avoid matching cell content
    await expect(page.getByRole("columnheader", { name: "Aluno" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("marks mensalidade as pago", async ({ page }) => {
    // Find the row for the test aluno
    const row = page.locator(`tr[data-mensalidade-id="${seedMensalidadeId}"]`);
    await expect(row).toBeVisible({ timeout: 8_000 });

    // Must start in pendente state
    await expect(row.getByText(/Pendente/i)).toBeVisible();

    // Click mark as paid
    await row.getByTestId("btn-marcar-pago").click();

    // Badge changes to "Pago"
    await expect(row.getByText(/^Pago$/i)).toBeVisible({ timeout: 8_000 });
  });

  test("unmarks mensalidade (desmarcar pago)", async ({ page }) => {
    const row = page.locator(`tr[data-mensalidade-id="${seedMensalidadeId}"]`);
    await expect(row).toBeVisible({ timeout: 8_000 });

    // Ensure it is in "pago" state (may need to mark first)
    const isPago = await row.getByText(/^Pago$/i).isVisible();
    if (!isPago) {
      await row.getByTestId("btn-marcar-pago").click();
      await expect(row.getByText(/^Pago$/i)).toBeVisible({ timeout: 8_000 });
    }

    await row.getByTestId("btn-desmarcar-pago").click();

    // Badge changes back to Pendente or Atrasado
    await expect(row.getByText(/Pendente|Atrasado/i)).toBeVisible({ timeout: 8_000 });
  });
});
