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

- `/` — landing publique;
- `/parent` — dashboard parent;
- `/parent/assistant` — atelier de devoirs IA et file de génération;
- `/student` — espace élève;
- `/student/lesson/demo-fractions` — leçon avec tuteur IA texte et voix;
- `/api/health` — état du backend local;
- `/api/generation-jobs` — file de génération (créer, lister, ouvrir, décider, traiter);
- `/api/tutor/turn` — un tour du tuteur élève.

## Les deux agents IA

**Pour l'adulte** — un parent, un tuteur ou un éducateur décrit le devoir dans
`/parent/assistant` : matière, niveau, notion, objectifs, types de questions, nombre,
difficulté, durée, adaptations et consignes. La demande part dans une file, un worker
produit un brouillon, un contrôle automatique attache les écarts, et l'adulte approuve ou
rejette. Rien n'atteint l'enfant sans cette approbation.

**Pour l'élève** — dans une leçon, le devoir reste au centre et le tuteur occupe le panneau
droit. L'élève écrit ou parle; le serveur décide combien d'aide est permise
(question → indice 1 → indice 2 → exemple → solution) et la solution complète reste
verrouillée si le devoir ne l'autorise pas.

Détails et garde-fous : `docs/architecture/08-agents-ia-devoirs-et-tuteur.md`.

## Clés et fournisseur IA

Par défaut `AI_PROVIDER=mock` : générateur déterministe, aucun réseau, aucune clé. Pour
appeler la vraie API, copier `.env.example` vers `.env.local` et y mettre
`AI_PROVIDER=anthropic` avec `ANTHROPIC_API_KEY`. La clé est lue côté serveur uniquement et
n'atteint jamais le navigateur; sans clé, l'application retombe sur le mock.

## Vérifier avant une PR

```bash
npm run typecheck
npm run build
npm run test:e2e
```

`npm run test:e2e` rejoue en navigateur les deux parcours critiques — parent qui crée,
valide et approuve un devoir; élève qui monte l'échelle d'aide sans atteindre la solution —
en français et en anglais, sur le fournisseur `mock` et sans aucune clé.

Ces trois commandes tournent aussi automatiquement sur chaque pull request
(`.github/workflows/ci.yml`). En cas d'échec des parcours navigateur, le rapport Playwright
est joint à l'exécution GitHub Actions.

## Architecture

Lire d'abord :

1. `docs/architecture/00-architecture-globale.md`
2. `docs/architecture/01-stack-local.md`
3. `docs/architecture/03-conformite-quebec.md`
4. `docs/architecture/08-agents-ia-devoirs-et-tuteur.md`
5. `dev-teammate/README.md`

Sans `.env.local`, le projet n'utilise aucune clé externe, aucune vraie base cloud, aucune vraie génération IA et aucune vraie visioconférence. Les adaptateurs locaux sont intentionnels pour le développement et les tests.

## Plan produit

- [Plan global](docs/plan/00-plan-global.md)
- [Décisions critiques](docs/plan/01-decisions-critiques.md)
- [Pages et navigation](docs/plan/02-pages-navigation.md)
- [Plan d'exécution parallèle](docs/plan/03-plan-execution-parallele.md)
- [Services](docs/plan/services/)

Le service aide les familles à organiser leur parcours; il ne remplace ni le ministère,
ni une école accréditée, ni un enseignant, ni une autorité religieuse.
