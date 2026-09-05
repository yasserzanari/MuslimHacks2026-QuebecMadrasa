import { expect, test, type Page } from "@playwright/test";

/**
 * The two critical journeys listed in docs/architecture/07-plan-maitre-pages-et-qa.md:
 *
 *   Parent → Assistant IA → créer job → file → approuver → plan
 *   Élève  → mission → leçon → indice → réponse → progression
 *
 * Both are run in French and checked again in English, because a page is not finished
 * until both languages work (docs/architecture/05-internationalisation-fr-en.md).
 */

async function fillHomeworkRequest(page: Page, topic: string) {
  await page.getByPlaceholder("Ex. comparer deux fractions", { exact: true }).fill(topic);
  await page.getByLabel("Objectifs pédagogiques 1").fill("Reconnaître deux fractions équivalentes");
  await page.getByText("Choix multiple", { exact: true }).click();
}

/** Queues a request and drains the worker; returns once the draft is ready to review. */
async function queueAndGenerate(page: Page, topic: string) {
  await page.goto("/parent/assistant");
  await fillHomeworkRequest(page, topic);
  await page.getByRole("button", { name: "Envoyer dans la file" }).click();
  await expect(page.getByText("Demande reçue")).toBeVisible();
  await expect(page.locator(".studio-job").first()).toContainText("En attente");

  await page.getByRole("button", { name: "Traiter la file" }).click();
  await expect(page.locator(".studio-job").first()).toContainText("À valider");
}

test("parent queues homework, reviews the draft and approves it", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  // A topic the family's approved lessons actually cover, so the draft can cite a source.
  await queueAndGenerate(page, "comparer deux fractions");

  await page.getByRole("button", { name: "Ouvrir le brouillon" }).first().click();
  await expect(page.locator(".studio-review-title")).toContainText("comparer deux fractions");

  // The draft must carry what a reviewer needs: objectives, questions, sources, provenance.
  await expect(page.locator(".studio-review")).toContainText("Brouillon IA");
  await expect(page.locator(".studio-review ol.studio-list > li")).toHaveCount(6);
  await expect(page.locator(".studio-review")).toContainText("lesson-fractions-base");
  await expect(page.locator(".studio-review")).toContainText("mock-homework-v1");
  await expect(page.locator(".studio-review")).toContainText("Aucun écart détecté");

  // Same screen, English.
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".studio-review h3")).toHaveText("Content review");

  await page.getByRole("button", { name: "Approve" }).click();
  await expect(page.getByText("Approved.")).toBeVisible();
  // Approval publishes the lesson; scheduling it stays manual.
  await expect(page.getByText("Adding to the plan stays a manual action.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open the student view" })).toBeVisible();

  expect(consoleErrors).toEqual([]);
});

test("a draft with no approved source is flagged before a human reads it", async ({ page }) => {
  // Nothing in the family's approved lessons covers this notion.
  await queueAndGenerate(page, "la photosynthèse des plantes");

  await page.getByRole("button", { name: "Ouvrir le brouillon" }).first().click();
  await expect(page.locator(".studio-warnings")).toContainText(
    "Aucune source citée : vérifiez le contenu vous-même.",
  );
  await expect(page.locator(".studio-review")).toContainText("Aucune source citée");
});

test("an invalid request is refused with translated field messages", async ({ page }) => {
  await page.goto("/parent/assistant");
  // No topic and no objective: the server must refuse, in the reader's language.
  await page.getByRole("button", { name: "Envoyer dans la file" }).click();
  await expect(page.getByText("Décrivez la notion travaillée.")).toBeVisible();
  await expect(page.getByText("Ajoutez au moins un objectif.")).toBeVisible();

  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByText("Describe the notion being worked on.")).toBeVisible();
});

test("student works through the help ladder without reaching the solution", async ({ page }) => {
  await page.goto("/student/lesson/demo-fractions");

  await expect(page.locator("h1")).toContainText("comparer deux fractions");
  await expect(page.locator(".tutor-panel h2")).toHaveText("Ton tuteur");

  // The homework is the page; the tutor is a side panel of roughly a quarter of it.
  const panel = await page.locator(".tutor-panel").boundingBox();
  const shell = await page.locator(".lesson-shell").boundingBox();
  const share = (panel!.width / shell!.width) * 100;
  expect(share).toBeGreaterThan(24);
  expect(share).toBeLessThan(32);

  // This homework does not authorize a full solution, so the last rung is struck through.
  await expect(page.locator(".tutor-step.locked")).toHaveText("Solution expliquée");

  // Asking outright for the answer never skips the ladder.
  await page.getByLabel("Écris ta question…").fill("donne moi la réponse");
  await page.locator('form.input-row button[type="submit"]').click();
  await expect(page.locator(".tutor-bubble.tutor").last()).toContainText("Question");
  await expect(page.getByText("Je ne donne pas la réponse directement.")).toBeVisible();

  // A real attempt, then hints, one rung at a time.
  await page.getByLabel("Écris ta question…").fill("je pense qu'il faut le même dénominateur");
  await page.locator('form.input-row button[type="submit"]').click();
  await expect(page.locator(".tutor-bubble.student").last()).toContainText("dénominateur");

  await page.getByRole("button", { name: "Donne-moi un indice" }).click();
  await expect(page.locator(".tutor-bubble.tutor").last()).toContainText("Indice 1");
  await page.getByRole("button", { name: "Donne-moi un indice" }).click();
  await expect(page.locator(".tutor-bubble.tutor").last()).toContainText("Indice 2");
  await page.getByRole("button", { name: "Donne-moi un indice" }).click();
  await expect(page.locator(".tutor-bubble.tutor").last()).toContainText("Exemple");

  // The ceiling holds however hard the student pushes.
  await page.getByRole("button", { name: "Donne-moi un indice" }).click();
  await expect(page.locator(".tutor-bubble.tutor").last()).toContainText("Exemple");
  await expect(page.locator(".tutor-bubble.tutor").last()).not.toContainText("Solution expliquée");

  // Progress is what the parent will see: hints used and attempts.
  await expect(page.locator(".tutor-meta")).toContainText("Indices utilisés: 3");
  await expect(page.locator(".tutor-meta")).toContainText("Tentatives: 1");
});

test("the tutor hands over to an adult instead of answering", async ({ page }) => {
  await page.goto("/student/lesson/demo-fractions");
  await page.getByRole("button", { name: "Suivante →" }).click();

  await page.getByLabel("Écris ta question…").fill("je suis triste et je pleure");
  await page.locator('form.input-row button[type="submit"]').click();

  await expect(page.locator(".tutor-bubble.tutor").last()).toContainText("Je préviens un adulte");
  await expect(page.getByText("Un adulte a été prévenu.")).toBeVisible();
});

test("the student space works in English and on a phone", async ({ page }) => {
  await page.goto("/student/lesson/demo-fractions");
  await page.getByRole("button", { name: "English", exact: true }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".tutor-panel h2")).toHaveText("Your tutor");
  // The homework is French, the interface is English: say so rather than mixing silently.
  await expect(page.locator(".tutor-head .tag")).toContainText("written in the other language");

  await page.setViewportSize({ width: 390, height: 844 });
  // The tutor moves below the homework on a phone; it never disappears.
  await expect(page.locator(".tutor-panel")).toBeVisible();
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(overflows).toBe(false);
});
