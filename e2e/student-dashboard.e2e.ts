import { expect, test } from "@playwright/test";

test("young student dashboard has a clear, working next action", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Bonjour Yasmine" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Une mission claire, puis une petite victoire." })).toBeVisible();

  await page.getByRole("link", { name: /Continuer le cours/ }).click();
  await expect(page).toHaveURL(/\/student\/cours\/fractions$/);
  await page.goBack();

  await page.getByRole("link", { name: /Jouer et apprendre/ }).click();
  await expect(page).toHaveURL(/\/student\/jeux$/);
  await page.goBack();

  await page.getByRole("button", { name: "Demander un devoir personnalisé" }).click();
  await expect(page.getByRole("button", { name: /Prêt en quelques secondes/ })).toBeVisible();
});
