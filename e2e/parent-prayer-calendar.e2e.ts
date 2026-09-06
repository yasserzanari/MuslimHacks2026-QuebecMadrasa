import { expect, test } from "@playwright/test";

test("parent prayer calendar keeps five configurable prayer blocks", async ({ page }) => {
  await page.goto("/parent/plan");
  await expect(page.getByRole("heading", { name: "Prières du jour" })).toBeVisible();
  for (const prayer of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
    await expect(page.getByText(prayer, { exact: true })).toBeVisible();
    await expect(page.getByLabel(`Heure ${prayer}`)).toBeVisible();
  }

  await page.getByLabel("Ville").fill("Québec");
  await page.getByLabel("Date").fill("2026-09-08");
  await page.getByLabel("Préparation Fajr en minutes").fill("20");
  await page.getByLabel("Durée Fajr en minutes").fill("12");
  await expect(page.getByText(/Québec · 2026-09-08/)).toBeVisible();
  await expect(page.getByText(/20 min avant \+ 12 min/)).toBeVisible();
});
