# MuslimHacks2026 — Québec Madrasa

Premier vertical slice local de la plateforme d'apprentissage en famille.

Décision produit permanente : toutes les pages et tous les services doivent être disponibles en français et en anglais. Le français est la langue par défaut au Québec, avec une bascule de langue prévue dans la navbar et les paramètres.

## Lancer localement

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

Pages disponibles :

Espace public

- `/` — landing publique.

Espace parent (sidebar à gauche, bascule FR/EN sur chaque page)

- `/parent` — tableau de bord;
- `/parent/plan` — plan de la semaine, glisser-déposer et créneaux indisponibles;
- `/parent/cours` et `/parent/cours/:id` — catalogue et fiche de cours;
- `/parent/assistant` — assistant IA, contexte explicite et création de job;
- `/parent/generation` — file de génération, brouillon, approbation, ajout au plan;
- `/parent/portfolio` — preuves, compétences, visibilité et journal d'accès;
- `/parent/communaute` et `/parent/communaute/:id` — groupes EXTRA;
- `/parent/parcours-quebec` — échéances, formulaire et export;
- `/parent/budget` — aides financières et services gratuits du CSS;
- `/parent/settings` — permissions, consentements, rétention, export et suppression.

Espace élève

- `/student` — mission du jour; bascule entre l'espace 12 ans et moins et l'espace 13 ans et plus;
- `/student/cours` et `/student/cours/:id` — cours et leçon avec le tuteur IA;
- `/student/progression` — progression par matière et par compétence;
- `/student/jouer` — mini-défis avec explication après chaque réponse;
- `/student/live` et `/student/live/:id` — lobby et classe collaborative.

Espace tuteur

- `/tutor/live/:id` — console de classe : présence, tour de parole, notes et défi de fin.

API locale

- `/api/health` — état du backend local;
- `/api/generation-jobs` — file IA : lecture, création, annulation, approbation;
- `/api/portfolio` — preuves et journal d'accès;
- `/api/family-settings` — permissions, consentements et export;
- `/api/live` — session de classe collaborative;
- `/api/week-plan`, `/api/courses`, `/api/communities`, `/api/quebec`, `/api/financial-aid`.

## Vérifier avant une PR

```bash
npm run typecheck
npm run build
npm test          # tests de domaine (Vitest)
npm run test:e2e  # parcours navigateur (Playwright)
```

Si le navigateur est déjà installé à une autre version que celle épinglée par
Playwright, indiquer le binaire à utiliser :

```bash
PLAYWRIGHT_CHROMIUM_PATH=/chemin/vers/chromium npm run test:e2e
```

Ne pas lancer `npm run build` pendant que `npm run dev` tourne : les deux
écrivent dans `.next` et le serveur de développement se met à répondre 404.

## Architecture

Lire d'abord :

1. `docs/architecture/00-architecture-globale.md`
2. `docs/architecture/01-stack-local.md`
3. `docs/architecture/03-conformite-quebec.md`
4. `dev-teammate/README.md`

Le projet n'utilise encore aucune clé externe, vraie base cloud, vraie génération IA ou vraie visioconférence. Les adaptateurs locaux sont intentionnels pour le développement et les tests.
