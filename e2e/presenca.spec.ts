import { test, expect } from "@playwright/test";

// Uses aluno storageState from playwright.config.ts

test.describe("Presença — geração de QR Code", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/presenca");
    // Wait for page to finish loading (exits "carregando" state)
    await expect(page.getByTestId("btn-gerar-qr")).toBeVisible({ timeout: 10_000 });
  });

  test("shows Gerar QR Code button in idle state", async ({ page }) => {
    await expect(page.getByTestId("btn-gerar-qr")).toBeEnabled();
  });

  test("generates QR code image on button click", async ({ page }) => {
    await page.getByTestId("btn-gerar-qr").click();

    // QR image appears after RPC call succeeds
    await expect(page.getByTestId("qr-image")).toBeVisible({ timeout: 12_000 });

    // Countdown timer visible (shows seconds remaining)
    await expect(page.getByText(/\d+s/)).toBeVisible();
  });

  test("QR code expiry message shown after 60s", async ({ page }) => {
    test.slow(); // ~70s total — skip in default CI run with --grep-invert @slow

    await page.getByTestId("btn-gerar-qr").click();
    await expect(page.getByTestId("qr-image")).toBeVisible({ timeout: 12_000 });

    // Wait for expiry
    await page.waitForTimeout(63_000);

    await expect(page.getByText("QR Code expirado")).toBeVisible({ timeout: 5_000 });
    // Renewal button appears
    await expect(page.getByText(/Gerar Novo QR Code/i)).toBeVisible();
  });
});
