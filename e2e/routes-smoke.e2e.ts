import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/parent",
  "/parent/assistant",
  "/parent/budget",
  "/parent/communaute",
  "/parent/communaute/montreal",
  "/parent/cours",
  "/parent/cours/fractions",
  "/parent/parcours-quebec",
  "/parent/parcours-quebec/calendrier",
  "/parent/plan",
  "/parent/settings",
  "/student",
  "/student/cours",
  "/student/cours/fractions",
  "/student/jeux",
  "/student/progression",
  "/student/live/fractions",
  "/tutor/live/atelier-ecosystemes",
];

test("every MVP route renders meaningful content without browser errors", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("body")).not.toContainText("Internal Server Error");
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toBeEmpty();
  }

  expect(runtimeErrors).toEqual([]);
});
