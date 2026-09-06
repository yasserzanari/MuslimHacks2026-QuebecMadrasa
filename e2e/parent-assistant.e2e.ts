import { expect, test } from "@playwright/test";

test.describe("Assistant IA parent", () => {
  test("answers, creates a draft and keeps parent approval explicit", async ({ page }) => {
    await page.goto("/parent/assistant");

    await expect(page.getByRole("heading", { name: "Assistant IA parent" })).toBeVisible();
    await expect(page.getByText("Conseils IA")).toBeVisible();

    await page.getByRole("button", { name: /Résume la progression d’Amine/ }).click();
    await expect(page.getByLabel("Message à l’assistant")).toHaveValue(/Résume la progression d’Amine/);
    await page.getByRole("button", { name: "Envoyer ↗" }).click();
    await expect(page.locator(".ai-message.assistant").last()).toContainText("priorité");

    await page.getByRole("button", { name: "Créer une révision de fractions" }).click();
    const job = page.locator(".ai-job").first();
    await expect(job).toContainText("À valider");
    await job.getByRole("button", { name: "Approuver" }).click();
    await expect(job).toContainText("Approuvé");
    await job.getByRole("button", { name: /Ajout manuel au plan/ }).click();
    await expect(job).toContainText("Ajouté au plan");
  });

  test("can switch the child before asking for guidance", async ({ page }) => {
    await page.goto("/parent/assistant");
    await page.locator(".ai-child-selector button").filter({ hasText: "Sara" }).click();
    await expect(page.locator(".ai-child-selector button.selected")).toContainText("Sara");
    await page.getByLabel("Message à l’assistant").fill("Comment aider Sara en sciences ?");
    await page.getByRole("button", { name: "Envoyer ↗" }).click();
    await expect(page.locator(".ai-message.assistant").last()).toBeVisible();
  });
});
