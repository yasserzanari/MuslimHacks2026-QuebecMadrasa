import { expect, test, type Page } from "@playwright/test";

/**
 * Parcours critiques listés dans `docs/architecture/07-plan-maitre-pages-et-qa.md`.
 *
 * Un seul de ces parcours était automatisé (Parcours Québec, dans son propre
 * fichier). Ceux-ci couvrent les quatre autres : visiteur bilingue, file de
 * génération validée par le parent, leçon élève avec indice, et la classe
 * collaborative vue des deux côtés.
 */

async function resetQueue(page: Page) {
  const response = await page.request.get("/api/generation-jobs");
  const { jobs } = await response.json();
  for (const job of jobs) {
    if (job.status === "queued" || job.status === "running") {
      await page.request.patch("/api/generation-jobs", { data: { jobId: job.id, action: "cancel" } });
    }
  }
}

test.describe("Visiteur → landing → English → parent", () => {
  test("the public landing switches language and reaches the parent space", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".real-nav")).toBeVisible();
    // Règle permanente : navbar horizontale en haut, jamais de sidebar en public.
    await expect(page.locator(".sidebar")).toHaveCount(0);

    const englishSwitch = page.getByRole("button", { name: /English|EN/ }).first();
    await englishSwitch.click();
    await expect(page.getByRole("link", { name: /Parent space|Parent/ }).first()).toBeVisible();

    await page.goto("/parent");
    await expect(page.locator(".sidebar")).toBeVisible();
  });
});

test.describe("Parent → Assistant IA → créer job → file → approuver → plan", () => {
  test("a generated draft only reaches the plan after the parent approves it", async ({ page }) => {
    await resetQueue(page);
    await page.goto("/parent/assistant");
    await expect(page.getByRole("heading", { name: "Assistant IA" })).toBeVisible();

    // Le contexte transmis est explicite : on coche ce que l'assistant peut lire.
    const source = page.locator(".assistant-source").first();
    await expect(source).toBeVisible();

    await page.locator(".assistant-create input").nth(1).fill("Additionner deux fractions");
    await page.getByRole("button", { name: "Créer un job de génération" }).click();
    await expect(page.locator(".toast")).toContainText("Job créé");

    await page.goto("/parent/generation");
    const card = page.locator(".queue-card").filter({ hasText: "Additionner deux fractions" }).first();
    // Première visite de la route : le serveur de dev la compile encore.
    await expect(card).toBeVisible({ timeout: 20_000 });

    // Le worker local fait avancer le job jusqu'à la validation parent.
    await expect(card.locator(".queue-status")).toHaveText("À valider", { timeout: 15_000 });

    await card.getByRole("button", { name: "Ouvrir le brouillon" }).click();
    await expect(page.locator(".queue-drawer")).toBeVisible();
    await expect(page.locator(".queue-warnings")).toBeVisible();
    await page.locator(".detail-close").click();

    await card.getByRole("button", { name: "Approuver" }).click();
    await expect(card.locator(".queue-status")).toHaveText("Approuvé");

    await card.getByRole("button", { name: "Ajouter au plan" }).click();
    await expect(card).toContainText("Ajouté au plan");
  });

  test("a rejected job publishes nothing and can be retried", async ({ page }) => {
    await resetQueue(page);
    await page.goto("/parent/assistant");
    await page.locator(".assistant-create input").nth(1).fill("Réviser les verbes");
    await page.getByRole("button", { name: "Créer un job de génération" }).click();

    await page.goto("/parent/generation");
    const card = page.locator(".queue-card").filter({ hasText: "Réviser les verbes" }).first();
    await expect(card.locator(".queue-status")).toHaveText("À valider", { timeout: 15_000 });

    await card.getByRole("button", { name: "Rejeter" }).click();
    await expect(card.locator(".queue-status")).toHaveText("Rejeté");
    await expect(card.getByRole("button", { name: "Ajouter au plan" })).toHaveCount(0);
    await expect(card.getByRole("button", { name: "Relancer" })).toBeVisible();
  });
});

test.describe("Élève → mission → leçon → indice → progression", () => {
  test("the student reaches the lesson and the tutor answers with a hint, not a solution", async ({ page }) => {
    await page.goto("/student");
    await page.getByRole("link", { name: /Continuer le cours/ }).click();
    await page.waitForURL("**/student/cours/fractions");

    // Le devoir reste au centre, le tuteur dans son panneau.
    await expect(page.locator(".kids-exercise, .lesson-v2-activity").first()).toBeVisible();
    const tutorPanel = page.locator(".kids-tutor-panel, .lesson-v2-tutor").first();
    await expect(tutorPanel).toBeVisible();

    const hint = page.getByRole("button", { name: /indice/i }).first();
    await hint.click();
    await expect(tutorPanel).toBeVisible();

    await page.goto("/student/progression");
    await expect(page.getByRole("heading", { name: "Ma progression" })).toBeVisible();
    await expect(page.locator(".progress-row").first()).toBeVisible();
  });

  test("the play page explains a wrong answer instead of only scoring it", async ({ page }) => {
    await page.goto("/student/jouer");
    await page.locator(".play-card").first().getByRole("button").click();
    await page.locator(".play-choice").first().click();
    await expect(page.locator(".play-feedback")).toBeVisible();
    await expect(page.locator(".play-feedback")).toContainText("Pourquoi");
  });
});

test.describe("Classe collaborative : élève et tuteur", () => {
  test("the tutor opens the room, gives the floor, corrects a note and publishes the summary", async ({ page, context }) => {
    await page.request.patch("/api/live", { data: { action: "reset" } });

    const tutor = page;
    await tutor.goto("/tutor/live/ecosystemes");
    await expect(tutor.getByRole("heading", { name: "Salle non ouverte" })).toBeVisible();

    const student = await context.newPage();
    await student.goto("/student/live/ecosystemes");
    await expect(student.getByRole("heading", { name: /La salle n’est pas encore ouverte/ })).toBeVisible();
    // Les règles sont visibles avant d'entrer.
    await expect(student.locator(".live-rules li").first()).toBeVisible();

    await tutor.getByRole("button", { name: "Ouvrir la salle" }).click();
    await expect(student.locator(".live-onair")).toBeVisible({ timeout: 10_000 });

    // L'élève demande la parole, le tuteur la donne.
    await student.getByRole("button", { name: /Je suis prêt/ }).click();
    await expect(tutor.locator(".live-turnbar small")).toContainText("Yasmine", { timeout: 10_000 });
    await tutor.locator(".live-turnbar-actions .live-primary").click();
    await expect(student.locator(".student-live-turn strong")).toHaveText("Tu as la parole", { timeout: 10_000 });

    // Une idée partagée devient une note de session, marquée comme telle.
    await student.locator(".student-live-activity textarea").fill("Sans abeilles, moins de fruits.");
    await student.getByRole("button", { name: /Partager mon idée/ }).click();
    await expect(tutor.locator(".live-note-column.said .live-note")).toHaveCount(1, { timeout: 10_000 });
    await expect(tutor.locator(".live-note-column.said .live-note-source")).toHaveText("Session");

    // L'IA propose, elle ne publie pas : sa note est marquée IA.
    await tutor.getByRole("button", { name: /Résumer/ }).click();
    await expect(tutor.locator(".live-note-source.ai").first()).toBeVisible();

    // Le tuteur corrige une note avant publication.
    await tutor.locator(".live-note-form input").fill("Vérifier le rôle des autres pollinisateurs.");
    await tutor.locator(".live-note-form select").selectOption("to_check");
    await tutor.locator(".live-note-form .live-primary").click();
    await expect(tutor.locator(".live-note-column.to_check .live-note")).toHaveCount(1);

    // Le défi de fin est une vérification, pas un classement.
    await tutor.getByRole("button", { name: "Lancer le défi" }).click();
    await expect(student.locator(".student-live-question")).toHaveCount(3, { timeout: 10_000 });
    await student.locator(".student-live-question").first().getByRole("button").first().click();
    await expect(tutor.locator(".live-ticket-scores div").first()).toContainText("1/3", { timeout: 10_000 });

    // Rien n'est publié avant validation.
    await tutor.getByRole("button", { name: "Valider les notes" }).click();
    await expect(tutor.locator(".live-badge")).toHaveText("Notes validées");
    await tutor.getByRole("button", { name: "Publier le résumé" }).click();
    await expect(tutor.locator(".live-badge")).toHaveText("Résumé publié");

    await student.close();
  });

  test("the summary cannot be published before it is validated", async ({ page }) => {
    await page.request.patch("/api/live", { data: { action: "reset" } });
    await page.goto("/tutor/live/ecosystemes");
    await page.getByRole("button", { name: "Ouvrir la salle" }).click();
    await expect(page.getByRole("button", { name: "Publier le résumé" })).toHaveCount(0);

    const refused = await page.request.patch("/api/live", { data: { action: "publish_summary" } });
    expect(refused.status()).toBe(409);
  });
});
