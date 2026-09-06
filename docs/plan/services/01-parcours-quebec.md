# Service 01 — Parcours Québec

> Ce fichier est celui que `dev-teammate/README.md` cite avec la mention « si présent ». Il ne l'était pas.

## Objectif

Accompagner une famille qui quitte l'école publique pour l'enseignement à la maison, du départ jusqu'à l'identification datée de toutes les obligations de l'année scolaire.

**Mesure de réussite** : un parent qui a retiré son enfant hier ouvre la page et sait, en moins de 60 secondes, quelle est l'obligation la plus urgente, sa date, l'article qui la prévoit, et dispose d'un brouillon.

## Limite permanente

Le module prépare et suit. Il ne certifie aucune conformité, ne dépose rien auprès du ministère et ne donne pas d'avis juridique. La phrase « vous êtes conforme » et ses équivalents anglais ne doivent apparaître nulle part ; un test le vérifie sur le dictionnaire et sur les exports.

## Ce qui a été vérifié, et comment

Vérification du 5 septembre 2026.

**LégisQuébec et CanLII refusent l'accès automatisé (HTTP 403)**, y compris l'URL citée dans `docs/architecture/03-conformite-quebec.md`. Le texte réglementaire lui-même n'a donc pas pu être lu par outil. Le fond a été confronté à trois sources ministérielles :

- le Guide d'accompagnement « Exigences en contexte d'enseignement à la maison » (`26-140-01-3-ACC`, éd. 2023);
- l'Échéancier officiel de l'enseignement à la maison;
- la page « Démarche et étapes » de quebec.ca.

Chaque `RequirementDefinition` porte donc `sourceProvenance` et `primaryTextVerified: false`. **Tant qu'une personne n'a pas ouvert le règlement et confirmé les numéros d'articles, ce drapeau reste faux.** C'est la première tâche à faire reprendre par un humain.

### Confirmé sans écart

| Obligation | Article | Échéance |
|---|---|---|
| Avis de déclaration | art. 2, 3 | 1er juillet, ou 10 jours après la cessation de fréquentation |
| Destinataires de l'avis | art. 3 | ministre (DEM) **et** centre de services scolaire compétent |
| Projet d'apprentissage | art. 4, 5 | 30 septembre, ou 30 jours après la cessation |
| Bilan de fin | art. 16 | 15 juin |
| Rencontre de suivi | art. 12 | pendant la mise en œuvre, préavis ministériel de 15 jours |
| Modes d'évaluation | art. 15 | cinq modes |
| Épreuves ministérielles | art. 15.1 | existe, en vigueur depuis 2021-2022 |

L'article 15.1 précise que la réussite d'une épreuve en 4e ou 5e secondaire **ne donne pas droit aux unités du DES**. L'interface l'affiche tel quel dès que ce mode est retenu.

### Écart avec la brief de mission — corrigé

`dev-teammate/04-parcours-quebec-end-to-end.md` et la table de `03-conformite-quebec.md` décrivent l'état de situation avec **deux** branches. Il en a **trois** :

| Date de cessation | État de situation |
|---|---|
| 1er janvier – 31 mars | dû **au plus tard le 15 juin** — pas la fenêtre du 3e au 5e mois |
| après le 31 mars | facultatif |
| autrement | fenêtre normale du 3e au 5e mois |

Le modèle à deux branches calcule une date fausse pour une sortie entre janvier et mars, qui est une fenêtre de départ courante. La branche du 15 juin est implémentée et testée (`quebec-deadlines.test.ts`).

### Nuance réglementation / pratique

Le Guide d'accompagnement indique **quatre fois** que « la rencontre de suivi, le bilan de mi-parcours et l'état de situation sont désormais combinés » en un seul point de suivi, principalement à l'oral, consigné dans un « Dossier de suivi annuel » de l'espace sécurisé.

Ce sont malgré tout **trois obligations distinctes aux dispenses différentes** :

- l'art. 11 dispense pour une sortie **après le 31 mars**;
- l'art. 16 dispense pour une cessation **après le 31 décembre**.

Pour une sortie hivernale, l'état de situation reste donc **exigé au 15 juin** alors que le bilan de mi-parcours devient **facultatif**. Le modèle garde trois définitions indépendantes et les réunit par un `jointGroupId` purement présentationnel. Deux tests échouent bruyamment si un refactor futur les fusionne.

## Hypothèses documentées

Trois points restent ouverts. Chacun a une question précise et une personne capable d'y répondre.

### 1. Numéros d'articles non vérifiés sur le texte primaire

- **Question** : les numéros 2, 3, 4, 5, 7, 11, 12, 15, 15.1, 16 et 17 correspondent-ils toujours aux objets décrits ici ?
- **Qui peut répondre** : n'importe qui ouvrant `https://www.legisquebec.gouv.qc.ca/fr/document/rc/I-13.3%2C%20r.%206.01` dans un navigateur, ou la personne-ressource de la DEM.
- **Effet si faux** : les citations affichées sont erronées. Les dates, elles, viennent de l'Échéancier et resteraient exactes.

### 2. Échéance des conclusions d'évaluation hors portfolio

- **Question** : les conclusions sont-elles dues le 30 juin pour tous les modes, ou la date varie-t-elle jusqu'en juillet selon le mode retenu ?
- **Qui peut répondre** : le centre de services scolaire de la famille, ou la DEM.
- **État actuel** : `uncertain: true` sur cette seule exigence. L'interface affiche la date la plus hâtive avec une réserve visible. Un test vérifie que c'est la seule échéance ainsi marquée, pour que le drapeau garde son sens.

### 3. Bornage de l'arithmétique des mois

- **Question** : « entre le 3e et le 5e mois » à partir du 31 août — la fenêtre se ferme-t-elle le 30 novembre ou le 1er décembre ?
- **Qui peut répondre** : la DEM. Le règlement ne tranche pas.
- **Choix retenu** : bornage au dernier jour du mois cible, donc le 30 novembre. La fenêtre est raccourcie d'un jour, jamais allongée. Décision visible dans `addMonths` et couverte par un test, plutôt qu'accidentelle.

## Modèle de données

Reprend la séparation de `03-conformite-quebec.md` et **ne reproduit pas** la régression de `dev-teammate/04`, qui accroche `status` directement sur l'exigence.

- `RequirementDefinition` — immuable, versionnée. Ne porte jamais de statut. Un changement ministériel met à jour une définition.
- `FamilySubmission` — mutable. Épingle `requirementId` + `requirementDefinitionVersion`, porte le statut et la saisie du parent.
- `Evidence`, `JointSuiviEvent`, `SchoolYear`, `Jurisdiction` — complètent le découpage.

Vocabulaire de statut à six états, **`confirmé` compris** — que `dev-teammate/04` laisse tomber, ce qui rendrait les délais des art. 7 et 17 inexprimables :

`à faire → en brouillon → vérifié par le parent → exporté → transmis manuellement → confirmé`

La terminalité est **dérivée** de la table de transitions, à un seul endroit. `src/domain/ai-generation-job.ts` l'exprime à trois endroits ; ce module ne reproduit pas ce défaut.

## Moteur d'échéances

`src/domain/quebec-deadlines.ts`, fonction pure. `now` est un paramètre, l'arithmétique est en UTC, et un test lit le fichier source pour interdire `new Date()`, `Date.now(` et `toLocale` dans le code.

Trois ancres :

```ts
type DeadlineAnchors = {
  schoolYear: SchoolYearId;              // 1er juillet, 30 septembre, 15 juin
  schoolExitDate?: IsoDate;              // horloges de 10 et 30 jours
  projectImplementationDate?: IsoDate;   // fenêtres du 3e au 5e mois
};
```

- Sans date de sortie, le calendrier annuel s'applique.
- Avec une date de sortie, l'avis et le projet passent aux horloges relatives ; les dates annuelles deviennent **inapplicables**, et l'échéance déplacée est renvoyée dans `supersededRules` pour que l'interface puisse l'expliquer.
- Les prédicats de dispense dépendent de `schoolExitDate`, jamais de `now`.
- Les échéances réactives (art. 7, art. 17) sont **absentes** tant qu'aucune réponse ministérielle n'est enregistrée — pas en retard.
- L'art. 5 fait coïncider transmission et mise en œuvre, donc son échéance sert d'ancre de mise en œuvre par défaut, avec `anchorDerivation: "derived_from_art5"` et une mention visible invitant le parent à saisir sa vraie date.
- **Chaque échéance indique l'ancre qui l'a produite.** Une date ne s'affiche jamais sans dire d'où elle vient.

## Classement de l'urgence

Une obligation réglementaire passe toujours avant un simple usage, même si la date de l'usage est dépassée. Sans cette règle, « prévenir l'école » — daté du jour du départ, donc immédiatement en retard — masquait l'avis de déclaration et son délai de 10 jours. Le bug a été trouvé par un test, qui le garde fermé.

## Interface

Route `/parent/parcours-quebec`.

1. Question d'entrée en haut : « Votre enfant a-t-il déjà quitté l'école ? » Cette seule réponse choisit tout le calendrier.
2. Carte urgente : une obligation, sa date, les jours restants, l'article, une action. Seconde horloge en retrait.
3. Panneau des ancres, seul endroit qui déplace des dates.
4. Générateur d'avis : un formulaire, **deux brouillons adressés séparément** (art. 3). Le code permanent indique où le trouver plutôt que d'être simplement marqué manquant.
5. Carte du point de suivi combiné, qui avertit quand les trois obligations divergent.
6. Frise de toutes les obligations, y compris les facultatives — les masquer priverait un parent qui souhaite tout de même produire le document.
7. Formulaire de projet par matières de l'art. 4 ; champs manquants visibles, jamais bloquants.
8. Export JSON estampillé de la version du catalogue.

## Bilingue

Dictionnaire total dans `components/quebec/quebec-dictionary.ts` : aucun ternaire en ligne, `aria-label` et textes alternatifs compris. Le type anglais est dérivé du français, donc une clé manquante est une erreur de compilation. Choix mémorisé sous `madrasa-locale`, bascule sans rechargement. Les dates passent par `Intl` avec `timeZone: "UTC"` et une construction à midi : sans cela, `2027-06-15` s'afficherait « 14 juin » pour tout le Québec.

## Notes d'implémentation

- Les modules de `components/quebec/` importent le domaine en **chemins relatifs**, pas par l'alias `@/`. Vitest ne lit pas les `paths` de `tsconfig.json` et le périmètre de la mission n'autorise ni `vitest.config.ts` ni modification du tsconfig.
- `app/api/quebec/route.ts` est **sans état** : ni authentification ni base, donc un stockage partagé en mémoire serait lisible par tout navigateur et enfreindrait la séparation des familles. La route calcule et valide, elle ne conserve rien.
- `QuebecSidebar` duplique le gabarit de `app/parent/page.tsx`. Il n'existe pas de `app/parent/layout.tsx` et la mission n'autorise qu'un seul href dans la page parent. Toute nouvelle entrée de navigation doit être ajoutée aux deux endroits tant qu'un gabarit partagé n'est pas extrait.
