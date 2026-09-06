import { expect, test } from "@playwright/test";

test("senior student lesson matches the advanced reference and supports guided work", async ({ page }) => {
  await page.goto("/student");
  await expect(page.getByRole("heading", { name: "Fonctions affines — comprendre la pente" })).toBeVisible();
  await expect(page.getByText("Question 3 sur 8")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Que remarques-tu quand la pente augmente ?" })).toBeVisible();

  await page.getByLabel("Message au tuteur IA").fill("Je veux un indice");
  await page.getByRole("button", { name: "Envoyer le message" }).click();
  await expect(page.locator(".lesson-chat-message.tutor").last()).toContainText("distance verticale");

  await page.getByPlaceholder("Tape ta réponse ici…").fill("La droite monte plus rapidement.");
  await page.getByRole("button", { name: /Vérifier mon raisonnement/ }).click();
  await expect(page.getByText("Merci pour ta réponse.")).toBeVisible();

  await page.getByRole("button", { name: /Indice 1/ }).click();
  await expect(page.getByText("Indice 1 affiché dans la conversation.")).toBeVisible();
});
