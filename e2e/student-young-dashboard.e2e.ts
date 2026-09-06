import { expect, test } from "@playwright/test";

test("young student dashboard shows the main journeys", async ({ page }) => {
  await page.goto("/student/jeune");
  await expect(page.getByRole("heading", { name: "Salam Adam" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Ma mission/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Jouer et apprendre/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ma progression/ })).toBeVisible();
  await expect(page.locator("img[alt*='Adam apprend']")).toBeVisible();
  await page.getByRole("link", { name: /Commencer ma mission/ }).click();
  await expect(page).toHaveURL(/\/student\/young\/cours\/fractions$/);
  await page.getByRole("button", { name: "2\/4" }).click();
  await expect(page.getByText(/Il manque bien 2 parts/)).toBeVisible();
  await page.getByRole("link", { name: /Terminer la séance|Mission terminée/ }).count();
});
