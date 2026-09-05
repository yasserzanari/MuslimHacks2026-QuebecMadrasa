import { expect, test, type Page } from "@playwright/test";

/**
 * Parcours navigateur du module Parcours Québec.
 *
 * Couvre ce qu'aucun test unitaire ne peut couvrir : la page se rend, la
 * bascule de langue tient au rechargement, aucune clé de traduction n'apparaît
 * à l'écran, et un parent qui a retiré son enfant voit la bonne obligation en
 * premier.
 */

const ROUTE = "/parent/parcours-quebec";
const SHOTS = "e2e/screenshots";

async function setExitDate(page: Page, isoDate: string) {
  await page.getByRole("radio", { name: /Oui, à cette date|Yes, on this date/ }).check();
  await page
    .getByLabel(/Date de cessation de fréquentation scolaire|Date attendance ceased/)
    .first()
    .fill(isoDate);
}

test.describe("Parcours Québec", () => {
  test("renders in French and captures the page", async ({ page }) => {
    await page.goto(ROUTE);

    await expect(
      page.getByRole("heading", {
        name: "Quitter l'école pour l'enseignement à la maison",
      }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");

    // La question d'entrée passe avant tout le reste.
    await expect(
      page.getByText("Votre enfant a-t-il déjà quitté l'école ?"),
    ).toBeVisible();

    await page.screenshot({ path: `${SHOTS}/parcours-quebec-fr.png`, fullPage: true });
  });

  test("switches to English without a reload and remembers the choice", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await page.getByRole("button", { name: "English" }).click();

    await expect(
      page.getByRole("heading", { name: "Leaving school for homeschooling" }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    await page.screenshot({ path: `${SHOTS}/parcours-quebec-en.png`, fullPage: true });

    // Le choix est mémorisé sous `madrasa-locale`.
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Leaving school for homeschooling" }),
    ).toBeVisible();

    const stored = await page.evaluate(() =>
      window.localStorage.getItem("madrasa-locale"),
    );
    expect(stored).toBe("en");
  });

  /** Definition of done i18n, point 5 de docs/architecture/05-internationalisation-fr-en.md. */
  test("never renders a raw translation key", async ({ page }) => {
    for (const language of ["Français", "English"]) {
      await page.goto(ROUTE);
      await page.getByRole("button", { name: language }).click();
      const body = (await page.locator("body").innerText()).trim();

      expect(body).not.toMatch(/\b(requirement|applicability|urgency|reason)\.[a-z]/i);
      expect(body).not.toMatch(/art\d+-[a-z-]+/);
      expect(body).not.toContain("undefined");
      expect(body).not.toContain("[object Object]");
    }
  });

  test("never claims the family is compliant", async ({ page }) => {
    await page.goto(ROUTE);
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/vous êtes conforme/i);
    expect(body).not.toMatch(/you are compliant/i);
  });

  test("surfaces the 10-day notice first for a parent who just withdrew", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await setExitDate(page, "2026-09-04");

    const urgent = page.locator(".quebec-urgent");
    await expect(urgent).toContainText("Avis de déclaration");
    // 10 jours après le 4 septembre 2026.
    await expect(urgent).toContainText("14 septembre 2026");
    // Chaque date dit d'où elle vient.
    await expect(urgent).toContainText("Calculée à partir de la sortie de l'école");
    await expect(urgent).toContainText("art. 2, 3");

    await page.screenshot({
      path: `${SHOTS}/parcours-quebec-fr-sortie.png`,
      fullPage: true,
    });
  });

  /**
   * Le cœur de la correction apportée à la brief : une sortie entre janvier et
   * mars laisse l'état de situation exigé au 15 juin alors que le bilan de
   * mi-parcours devient facultatif.
   */
  test("shows the winter-exit divergence between the two mid-year obligations", async ({
    page,
  }) => {
    await page.goto(ROUTE);
    await setExitDate(page, "2027-02-10");

    const joint = page.locator(".quebec-joint-card");
    await expect(joint).toContainText(
      "ces obligations n'ont pas le même statut",
    );

    const etat = joint.locator(".quebec-joint-item", {
      hasText: "État de situation",
    });
    await expect(etat).toContainText("Obligatoire");
    await expect(etat).toContainText("15 juin 2027");

    const bilan = joint.locator(".quebec-joint-item", {
      hasText: "Bilan de mi-parcours",
    });
    await expect(bilan).toContainText("Facultatif");

    await page.screenshot({
      path: `${SHOTS}/parcours-quebec-fr-suivi.png`,
      fullPage: true,
    });
  });

  test("produces two separately addressed notice drafts from one form", async ({
    page,
  }) => {
    await page.goto(ROUTE);

    const cards = page.locator(".quebec-recipient-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("Direction de l'enseignement");
    await expect(cards.nth(1)).toContainText("Centre de services scolaire");

    // Les deux portent la mention de vérification parentale.
    for (const index of [0, 1]) {
      await expect(cards.nth(index)).toContainText(
        "Brouillon préparé avec l'aide de la plateforme",
      );
    }

    // Tant qu'il manque un champ, le téléchargement reste bloqué.
    await expect(
      cards.nth(0).getByRole("button", { name: "Télécharger le brouillon" }),
    ).toBeDisabled();
  });

  test("the parent dashboard links through to the pathway", async ({ page }) => {
    await page.goto("/parent");
    await page.getByRole("link", { name: "Parcours Québec" }).click();
    await expect(page).toHaveURL(new RegExp(`${ROUTE}$`));
  });

  test("stays readable at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(ROUTE);

    await expect(
      page.getByRole("heading", {
        name: "Quitter l'école pour l'enseignement à la maison",
      }),
    ).toBeVisible();

    // Le corps de page ne défile jamais horizontalement.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    await page.screenshot({
      path: `${SHOTS}/parcours-quebec-fr-mobile.png`,
      fullPage: true,
    });
  });
});
