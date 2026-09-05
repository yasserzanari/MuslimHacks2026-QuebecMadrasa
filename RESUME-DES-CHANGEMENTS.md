# Résumé des changements — branche `dev-bennywaveyy` vs `main`

Deux agents IA complets, du contrat de domaine jusqu'à l'écran, avec leurs garde-fous,
leurs traductions et leurs tests navigateur.

```
43 fichiers modifiés · 6458 insertions · 68 suppressions · 2 commits
```

Sur `main`, l'IA se résumait à trois fichiers : un type de job, une interface d'outils avec
des retours `unknown`, et une route qui fabriquait un job en dur. Rien n'était exécuté,
rien n'était vérifié, rien n'était traduit.

---

## 1. Ce qui est nouveau pour l'utilisateur

### Atelier de devoirs — `/parent/assistant`

Un parent, un tuteur ou un éducateur de groupe **ne parle jamais au modèle**. Il remplit une
spécification : enfant, matière, niveau québécois, format, notion, jusqu'à cinq objectifs,
types de questions, nombre, difficulté, durée visée, adaptations, contexte réel,
à inclure / à éviter, corrigé, autorisation de dévoiler la solution, sources approuvées.

La demande devient un `generation_job` : crédits réservés → worker → outils autorisés →
brouillon → contrôle automatique → **à valider** → approbation ou rejet humain.
L'approbation publie une leçon élève; **l'ajout au plan de la semaine reste manuel**.

### Leçon et tuteur élève — `/student/lesson/[lessonId]`

Le devoir occupe le centre de la page, le tuteur un panneau droit de ~28 % (mesuré par les
tests). L'élève **écrit ou parle** (Web Speech API : dictée et lecture à voix haute).

Le **serveur** — pas le navigateur, pas le modèle — décide du niveau d'aide autorisé :

```
question → indice 1 → indice 2 → exemple → solution expliquée
```

Un cran à la fois. Le dernier cran reste verrouillé et barré à l'écran si le devoir ne
l'autorise pas.

---

## 2. Nouveaux fichiers, par couche

### Domaine — règles pures, sans entrées/sorties

| Fichier | Rôle |
|---|---|
| `src/domain/homework-options.ts` | Catalogues (matières, niveaux, formats, types de questions, adaptations) et estimation des crédits. Sans dépendance de validation, pour que le formulaire l'importe sans alourdir le navigateur. |
| `src/domain/ai-homework-spec.ts` | Le contrat que l'adulte remplit, validé par Zod côté serveur. |
| `src/domain/ai-homework-document.ts` | La forme du brouillon **et** son contrôle automatique. |
| `src/domain/ai-tutor-session.ts` | L'échelle d'aide, la détection de « donne-moi la réponse », la limite de tours, l'escalade vers un adulte. |
| `src/domain/ai-tool-registry.ts` | Le catalogue **complet** des outils. Un outil absent n'existe pas. |
| `src/domain/learning-records.ts` | Contrats partagés : `Family`, `Child`, `Evidence`, `QuebecRequirement`, `StudentLesson`… |

`ai-generation-job.ts` et `parent-ai-tools.ts` existaient : ils sont étendus (locale, spec,
priorité, remboursement, tentatives; retours typés au lieu de `unknown`).

### Serveur — jamais chargé par le navigateur (`import "server-only"`)

| Fichier | Rôle |
|---|---|
| `src/server/parent-tools.ts` | Implémente les outils adultes : vérifie la famille, respecte le consentement par classe de données, journalise chaque accès. |
| `src/server/tutor-agent.ts` | Décide le niveau **avant** l'appel au modèle et filtre la réponse **après**. |
| `src/server/generation-worker.ts` | Vide la file : `queued → running → review_required`, ou `failed` avec remboursement. |
| `src/server/ai/provider.ts` | L'interface qui isole le fournisseur du reste du produit. |
| `src/server/ai/mock-provider.ts` | Générateur déterministe : aucun réseau, aucune clé. |
| `src/server/ai/anthropic-provider.ts` | Boucle d'outils réelle sur l'API Messages, terminée par un outil strict `submit_homework_draft`. |
| `src/server/store.ts` | Adaptateur de persistance local — la couture que SQLite/Prisma remplacera. |
| `src/server/demo-data.ts` | Famille de démonstration inventée. Aucune donnée réelle d'enfant. |
| `src/server/session.ts` | Résolution de session (à remplacer en phase 5). |
| `src/server/http.ts` | Erreurs du domaine → statuts HTTP, avec des **codes** et non des phrases. |

### Routes API

| Route | Rôle |
|---|---|
| `POST/GET /api/generation-jobs` | Créer une demande, lister la file. |
| `POST /api/generation-jobs/run` | Déclencher le worker. |
| `GET /api/generation-jobs/[jobId]` | Le job et son brouillon. |
| `POST /api/generation-jobs/[jobId]/decision` | Approuver, rejeter, annuler. |
| `POST /api/tutor/turn` | Un tour du tuteur élève. |

`/api/health` indique maintenant quel fournisseur est actif et si une clé est configurée —
sans jamais exposer la clé.

### Écrans, langues et tests

- `app/parent/assistant/` — formulaire, file de génération, panneau de révision;
- `app/student/lesson/[lessonId]/` — devoir au centre, tuteur à droite, voix;
- `src/i18n/locale.ts` et `src/i18n/ai-dictionary.ts` — **toutes** les chaînes visibles des
  deux agents, en français et en anglais;
- `tests/e2e/homework-agents.spec.ts` + `playwright.config.ts` — 6 tests navigateur;
- `.github/workflows/ci.yml` — typecheck, build et tests sur chaque pull request;
- `app/globals.css` — +128 lignes pour les deux écrans;
- `docs/architecture/08-agents-ia-devoirs-et-tuteur.md` — la documentation détaillée.

---

## 3. Les garde-fous, appliqués par le code

Ces règles ne sont pas des consignes dans un prompt : ce sont des lignes de code qu'un
modèle ne peut pas contourner.

- une même `requestId` ne crée jamais un deuxième job ni une deuxième réservation;
- trois tentatives au maximum, puis `failed` avec un code — et les crédits reviennent;
- `approve_generated_content` figure au registre mais **n'appartient à aucun agent** :
  approuver est un acte humain;
- le contrôle du brouillon signale un nombre de questions erroné, un type non demandé, un
  corrigé incomplet, l'absence de source, la mauvaise langue, et surtout tout langage de
  **diagnostic**, de **note** ou d'**exigence légale ou religieuse**;
- « donne-moi la réponse » fait monter d'un seul cran, jamais jusqu'à la solution;
- détresse, sujet hors école ou demande de données personnelles : **le modèle n'est pas
  appelé du tout**, un adulte est prévenu et l'élève en est informé;
- le parent reçoit une progression — indices utilisés, tentatives — pas une transcription;
- une famille ne peut pas lire les données d'une autre : vérifié côté serveur, pas dans l'UI.

---

## 4. Langues

Le dictionnaire anglais est **typé sur le français** : une clé manquante est une erreur de
compilation, pas un mot français sur un écran anglais. Les erreurs d'API renvoient un code,
jamais une phrase, pour que chaque lecteur reçoive sa langue. Un devoir écrit dans une
langue et lu dans l'autre affiche un avertissement clair, et le tuteur ne mélange pas les
deux langues dans une même réponse.

---

## 5. Essayer

```bash
npm install
npm run dev
```

Aucune clé n'est nécessaire : `AI_PROVIDER=mock` par défaut, aucun appel réseau, aucun coût.

- `/parent/assistant` — créer, traiter la file, ouvrir le brouillon, approuver;
- `/student/lesson/demo-fractions` — demander un indice, monter l'échelle, buter sur le
  plafond.

Pour la vraie génération : copier `.env.example` vers `.env.local`, mettre
`AI_PROVIDER=anthropic` et `ANTHROPIC_API_KEY`. La clé est lue côté serveur uniquement; sans
clé, l'application retombe sur le mock au lieu de casser.

### Vérifier

```bash
npm run typecheck
npm run build
npm run test:e2e     # 6 parcours navigateur, français et anglais, ~25 s
```

Les trois tournent aussi sur chaque pull request.

---

## 6. Ce qui n'est pas fait

Honnêtement, pour éviter une mauvaise surprise en révision :

- **pas d'authentification réelle** — `src/server/session.ts` résout la famille de démo. Les
  vérifications d'autorisation sont réelles; la session qui les alimente est un bouchon;
- **rien n'est persisté** — la file, les brouillons et les sessions de tuteur vivent en
  mémoire et disparaissent au redémarrage du serveur;
- les signalements `escalate_to_adult` sont enregistrés côté serveur mais **pas encore
  affichés** dans le tableau de bord parent;
- « Signaler une réponse incorrecte » reste local à l'écran élève;
- la voix dépend du navigateur : Chrome et Edge la fournissent, Firefox et Safari non — dans
  ce cas l'élève voit un message clair et peut écrire.

Ces points appartiennent aux phases 4 et 5 du plan maître, ou à la mission du tableau de
bord parent, et n'ont pas été empiétés depuis cette branche.
