# Agents IA — génération de devoirs et tuteur élève

Ce document décrit ce qui est **implémenté**, pas ce qui est souhaité. Les règles viennent de
`docs/plan/services/11-assistant-ia-parent.md`, `docs/plan/services/04-tuteur-ia-eleve.md`,
`docs/architecture/02-queue-ia-et-live.md` et `docs/architecture/04-securite-et-donnees.md`.

## Deux agents, deux publics

| | Agent adulte | Agent élève |
|---|---|---|
| Qui l'utilise | parent, tuteur, éducateur de groupe | élève |
| Où | `/parent/assistant` | `/student/lesson/[lessonId]` |
| Ce qu'il produit | un brouillon de devoir dans la file | une question, un indice, un exemple |
| Mode | formulaire → job asynchrone | texte et voix, tour par tour |
| Décision finale | l'humain approuve ou rejette | le serveur décide le niveau d'aide |

## Agent adulte — l'atelier de devoirs

L'adulte ne parle jamais au modèle directement. Il remplit une **spécification**
(`src/domain/ai-homework-spec.ts`) : enfant, matière, niveau, format, notion, objectifs,
types de questions, nombre, difficulté, durée, adaptations, contexte réel, à inclure,
à éviter, corrigé, autorisation de dévoiler la solution, sources approuvées seulement.

```text
formulaire → validation Zod côté serveur → vérification de la famille
  → crédits réservés → generation_job = queued
  → worker → outils autorisés → fournisseur IA → brouillon structuré
  → validation automatique (sécurité et cohérence) → review_required
  → parent approuve / rejette
  → l'approbation publie une leçon élève; l'ajout au plan reste manuel
```

Règles appliquées dans le code :

- un `requestId` identique ne crée jamais un deuxième job ni une deuxième réservation;
- trois tentatives au maximum, puis `failed` avec un code compréhensible;
- un job `failed` ou `cancelled` rembourse les crédits; un job rejeté après génération ne
  les rembourse pas, car la génération a bien eu lieu;
- aucune publication automatique dans le calendrier;
- chaque brouillon conserve objectifs, sources, version du modèle, version du gabarit,
  date et `requiresParentReview: true`.

### Contrôle automatique du brouillon

`src/domain/ai-homework-document.ts` compare le brouillon à la spécification avant qu'un
humain le lise et attache des avertissements traduits : nombre de questions différent,
type de question non demandé, corrigé incomplet, aucune source, mauvaise langue, question
vide, choix manquants, et surtout tout langage de **diagnostic**, de **note** ou
d'**exigence légale ou religieuse**. Le brouillon n'est jamais réécrit en silence : le
relecteur voit exactement ce qui cloche.

## Agent élève — le tuteur

Le devoir occupe le centre de la page; le tuteur est un panneau droit d'environ 28 %.
Il accepte le texte et la voix (Web Speech API pour la dictée et la lecture à voix haute).

L'échelle d'aide est décidée **par le serveur**, jamais par le navigateur ni par le modèle
(`src/domain/ai-tutor-session.ts`) :

```text
question → indice 1 → indice 2 → exemple → solution expliquée
```

- le premier tour est toujours une question rendue à l'élève : « explique-moi ton idée »;
- « donne-moi la réponse » fait monter d'un seul cran, jamais jusqu'à la solution;
- le plafond est `exemple` tant que le devoir n'autorise pas la solution complète;
- « explique autrement » reformule sans monter d'un cran;
- douze tours par question au maximum, puis pause ou adulte;
- détresse, sujet hors école ou demande de données personnelles : le modèle n'est pas
  appelé du tout, un adulte est prévenu et l'élève est informé;
- la réponse du modèle est filtrée après coup (longueur, diagnostic, données personnelles);
- le parent reçoit une progression — indices utilisés, tentatives — pas une transcription.

## Outils autorisés

`src/domain/ai-tool-registry.ts` est le catalogue complet. Un outil absent n'existe pas :
il n'y a pas d'accès libre à la base, aux paiements, aux messages privés ni à la position.

| Outil | Accès | Agent |
|---|---|---|
| `get_child_learning_snapshot` | lecture | adulte |
| `get_skill_evidence` | lecture | adulte |
| `get_week_plan` | lecture | adulte |
| `get_quebec_requirement_status` | lecture | adulte |
| `search_approved_lessons` | lecture | adulte, élève |
| `create_generation_job` | écriture contrôlée | adulte |
| `get_generation_job` | lecture | adulte |
| `cancel_generation_job` | écriture contrôlée | adulte |
| `approve_generated_content` | écriture contrôlée | **aucun agent** — décision humaine |
| `get_homework_question` | lecture | élève |
| `get_student_attempt_history` | lecture | élève |
| `escalate_to_adult` | écriture contrôlée | élève |

Chaque appel passe par `createParentToolExecutor` ou `createStudentToolExecutor`, qui
refusent un outil hors périmètre, revérifient la famille, contrôlent le consentement du
parent par classe de données et écrivent une entrée dans le journal d'accès.

## Fournisseurs

`AI_PROVIDER=mock` (défaut) : générateur déterministe, aucun réseau, aucune clé. La même
spécification donne le même devoir, ce qui rend la QA navigateur reproductible.

`AI_PROVIDER=anthropic` : appel réel à l'API Messages avec boucle d'outils. Le modèle lit
les données de la famille uniquement par les outils ci-dessus et termine en appelant un
outil strict `submit_homework_draft` qui impose la forme exacte du brouillon. La clé est
lue côté serveur uniquement; sans clé, l'application retombe sur le mock au lieu de casser.

## Langues

Toutes les chaînes visibles des deux agents sont dans `src/i18n/ai-dictionary.ts`, en
français et en anglais, avec le dictionnaire anglais typé sur le français : une clé
manquante est une erreur de compilation. Les erreurs API renvoient un **code**, jamais une
phrase, pour que chaque lecteur reçoive sa langue. Un devoir écrit dans une langue et lu
dans l'autre affiche un avertissement clair, et le tuteur ne mélange pas les deux langues
dans une même réponse.

## Ce qui n'est pas encore fait

- authentification réelle : `src/server/session.ts` résout la famille de démo et devra être
  remplacé en phase 5;
- persistance : la file, les brouillons et les sessions de tuteur vivent en mémoire;
- les signalements `escalate_to_adult` sont enregistrés côté serveur mais ne sont pas encore
  affichés dans le tableau de bord parent;
- « Signaler une réponse incorrecte » est local à l'écran élève et n'ouvre pas encore de
  billet côté parent.
