import { expect, test } from "@playwright/test";

test("landing links to mosque services and mosque CTAs are usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Pour les mosquées" })).toBeVisible();
  await page.getByRole("link", { name: "Pour les mosquées" }).click();
  await expect(page).toHaveURL(/\/services\/mosquees$/);
  await expect(page.getByRole("heading", { name: /Accompagner les élèves/ })).toBeVisible();
  for (const service of ["Dashboard mosquée", "Familles et élèves", "Classes et groupes", "Outils pour tuteurs", "Suivi et devoirs assistés par IA", "Activités extrascolaires", "Calendrier islamique et prières", "Bourses et places sponsorisées", "Sécurité des mineurs"]) {
    await expect(page.getByRole("heading", { name: service })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: "Demander une démo" }).first()).toHaveAttribute("href", "#contact");
  await expect(page.getByRole("link", { name: "Lancer un pilote" })).toHaveAttribute("href", "#pilote");
  await expect(page.getByText(/Aucun résultat financier ni certification automatique/)).toBeVisible();
});
