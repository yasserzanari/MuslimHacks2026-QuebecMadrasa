import { expect, test } from "@playwright/test";

test("senior student workspace guides a math problem and supports the AI tutor", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Comprendre avant de calculer." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Le billet de cinéma" })).toBeVisible();

  await page.getByLabel("Message au tuteur IA").fill("Je veux un indice");
  await page.getByRole("button", { name: "Envoyer" }).click();
  await expect(page.locator(".senior-chat-message.ai").last()).toContainText("Indice 1");

  await page.locator("#answer").fill("24");
  await page.getByRole("button", { name: /Vérifier ma réponse/ }).click();
  await expect(page.getByText("Bien joué — ton modèle est correct.")).toBeVisible();

  await page.getByRole("button", { name: "Voir un indice" }).click();
  await expect(page.getByText("Commence par enlever le prix du maïs soufflé.")).toBeVisible();
});
