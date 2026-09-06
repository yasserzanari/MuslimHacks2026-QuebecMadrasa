import { expect, test } from "@playwright/test";

test("le tableau de bord mosquée se charge et ses actions de démo fonctionnent", async ({ page }) => {
  await page.goto("/mosquee");
  await expect(page.getByRole("heading", { name: "La communauté, en mouvement." })).toBeVisible();
  await expect(page.getByText("Élèves inscrits")).toBeVisible();
  await expect(page.getByText("Matières à risque")).toBeVisible();
  await expect(page.getByText("Impact du pilote")).toBeVisible();
  await page.getByRole("button", { name: "Youssef A. Demande un accompagnement Aide" }).click();
  await expect(page.getByRole("complementary", { name: "Détail de Youssef A." })).toBeVisible();
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page.getByLabel("Valeur horaire choisie").fill("30");
  await expect(page.locator("text=/1\\s?500/")).toBeVisible();
  await page.getByRole("button", { name: "30 jours" }).click();
  await expect(page.getByText(/30 jours/).first()).toBeVisible();
  await page.getByRole("button", { name: "↗ Exporter le rapport" }).click();
  await expect(page.getByRole("status")).toContainText("Rapport préparé");
});
