# Service — Tableau de bord tuteur (classe collaborative)

## Pourquoi ce document

La spécification de la vue tuteur était dispersée dans cinq fichiers dont aucun ne porte ce nom. Ce document rassemble les règles applicables à la page `P16` et renvoie aux sources d'origine plutôt que de les remplacer.

Sources consolidées :

- `dev-teammate/02-live-class-agent.md` — brief de mission et tranche de développement;
- `dev-teammate/README.md`, Mission B — liste de lecture et livrable attendu;
- `docs/plan/services/12-classes-collaboratives.md` — déroulement de session, notes et sécurité;
- `docs/architecture/02-queue-ia-et-live.md` — ce que le prototype live doit simuler;
- `docs/architecture/07-plan-maitre-pages-et-qa.md` — fiche `P16`, route et périmètre de fichiers;
- `assets/ui/12-classe-collaborative.png` — maquette de référence.

La vue élève correspondante est `P15` (`assets/ui/13-classe-collaborative-eleve.png`). Le tuteur IA individuel d'une leçon est un autre service, décrit dans `04-tuteur-ia-eleve.md` : il occupe un panneau latéral, pas une salle.

## Rôle

Route : `/tutor/live/:id`.

Le tuteur humain ouvre la salle, annonce l'objectif et les règles, distribue la parole, anime l'activité partagée, surveille la participation et valide les notes avant publication. L'assistant IA de classe l'assiste; il ne le remplace jamais automatiquement.

- données principales : présence, activité, modération, notes;
- actions réelles : ouvrir la salle, donner la parole, valider les notes.

## Layout obligatoire

```text
┌──────────────────────────────────────────────────────────────────────┐
│ logo · classe collaborative │ cours │ objectif │ minuteur │ présence  │
├──────────────┬───────────────────────────────────┬───────────────────┤
│ PARTICIPANTS │ ACTIVITÉ PARTAGÉE                 │ ASSISTANT IA      │
│ grille 2×2   │ tableau blanc, question, outils   │ relancer          │
│ pseudonymes  │                                   │ créer un défi     │
│ niveau audio ├───────────────────────────────────┤ résumer           │
│ tour actif   │ TOUR DE PAROLE · demander parole  │                   │
├──────────────┴───────────────────────────────────┼───────────────────┤
│ NOTES AUTOMATIQUES · en direct                   │ DÉFI ÉCLAIR       │
│ idées du groupe │ à vérifier │ prochaine activité │ 3 questions       │
├──────────────────────────────────────────────────┴───────────────────┤
│ règles de la salle · micro · caméra · chat · quitter · aide          │
└──────────────────────────────────────────────────────────────────────┘
```

Règles de composition :

- la page est une console de session pleine largeur, sans sidebar parent;
- l'activité partagée est la zone dominante; les participants restent à gauche et l'assistant IA à droite;
- l'objectif du cours et le minuteur de session sont visibles en permanence dans l'en-tête;
- le tour de parole est attaché à l'activité, pas noyé dans le chat;
- les notes automatiques restent lisibles sans quitter la salle;
- la barre de contrôle reste fixe en bas et contient toujours une sortie évidente.

## Fonctions du tuteur

- ouvrir la salle et afficher les règles avant l'entrée;
- voir la présence par pseudonyme et l'état audio de chaque élève;
- lancer le cercle de présentation chronométré;
- donner, retirer et mettre en file le tour de parole;
- animer le tableau blanc ou l'espace de réponse partagé;
- lancer un sondage ou une question rapide;
- ouvrir un groupe de travail limité;
- déclencher une relance de l'assistant IA;
- lancer le défi éclair de trois questions;
- relire, corriger et valider les notes avant publication;
- modérer : rappeler une règle, couper un micro, signaler, retirer un participant;
- terminer la session et publier le résumé.

## Déroulement d'une session

1. Le système recommande une session selon le cours et l'objectif.
2. Le parent réserve une place ou accepte l'invitation.
3. Chaque élève se présente avec un prénom affiché et répond à une question simple.
4. Le tuteur explique l'objectif et les règles de discussion.
5. Les élèves travaillent en équipe ou répondent à tour de rôle.
6. L'IA prend des notes structurées pendant la discussion.
7. La session se termine par un mini-jeu ou un ticket de sortie de trois questions.
8. Le tuteur valide le résumé, puis le système propose une activité individuelle.

## Notes automatiques et validation

Le compte rendu sépare toujours :

- `dit pendant la session` : faits ou citations courtes;
- `notions travaillées` : objectif et concepts;
- `à vérifier` : éléments incertains;
- `prochaine activité` : exercice proposé;
- `validation du tuteur` : confirmation ou correction avant publication.

Rien n'est publié au parent ou à l'élève avant la validation du tuteur. Les notes restent visibles, corrigibles et supprimables. Le résumé doit distinguer les faits des suggestions de l'IA.

## Assistant IA de classe

L'IA est un participant auxiliaire. Elle peut distribuer les tours de parole, repérer une question restée sans réponse, reformuler sans humilier un élève, proposer un indice ou une analogie, produire un résumé basé uniquement sur la conversation autorisée et transformer les erreurs fréquentes en mini-jeu de révision.

Elle ne parle pas à la place des élèves, ne note pas la personnalité, ne déduit pas une santé mentale et ne publie pas d'étiquette sur un élève. Ses actions restent des propositions que le tuteur déclenche ou valide.

## Sécurité et modération

- compte parent requis pour rejoindre une classe;
- prénom ou pseudonyme, jamais adresse ni contact privé;
- aucun message privé élève-élève au MVP;
- règles visibles avant l'entrée;
- adulte hôte identifié et signalement toujours accessible;
- limite de taille, d'âge et de capacité de la classe;
- enregistrement audio/vidéo désactivé par défaut;
- transcription optionnelle, logs d'accès minimaux, suppression configurable;
- aucune obligation de caméra pour participer.

## Contrats de données

```text
LiveSession { id, courseId, hostId, participants, objective, status, notesStatus }
LiveParticipant { id, sessionId, childId, displayName, role, audioState, handRaised }
SpeakingTurn { id, sessionId, participantId, startedAt, endedAt, grantedBy }
SessionNote { id, sessionId, section, content, source, validationStatus }
ExitTicket { id, sessionId, questions[], answers[], status }
```

`section` reprend les cinq blocs de notes ci-dessus. `source` distingue `session` et `ia`. `validationStatus` passe par `draft`, `validated` et `published`. Les contrats vivent dans `src/domain/live-*.ts` et ne sont jamais dupliqués dans les pages.

## Règles visuelles

- vert profond, vert clair, crème, jaune doux et accents pastel;
- titres en serif chaleureux, texte courant lisible, coins arrondis, cartes calmes;
- vert profond pour les cartes IA et la barre de contrôle : elles se lisent comme du châssis, pas comme du contenu;
- jaune doré réservé au temps et au bouton de défi;
- rouge réservé à `Quitter`;
- colonnes de notes teintées différemment pour distinguer les trois types d'un coup d'œil;
- tableau blanc rendu dans un style dessiné à la main plutôt qu'en châssis d'interface;
- portraits d'élèves illustrés, chaleureux et culturellement neutres;
- PNG autorisé pour une illustration ou une photo, jamais pour une capture d'interface;
- logo officiel `public/ui/logo-madrasa-quebec.png` dans l'en-tête;
- français et anglais : aucune page terminée dans une seule langue.

## États à implémenter

- salle non ouverte;
- lobby et règles avant entrée;
- attente de participants;
- session en cours sans tour attribué;
- tour attribué à un élève;
- main levée en attente;
- activité partagée modifiée;
- notes en cours de génération;
- notes en attente de validation;
- défi éclair lancé;
- élève signalé ou retiré;
- assistant IA indisponible;
- session terminée et résumé publié;
- reprise après déconnexion du tuteur.

## Première tranche de développement

1. données de session de démo;
2. lobby et entrée dans une classe;
3. grille de participants sans vidéo réelle;
4. état du tour de parole;
5. activité centrale et réponses;
6. panneau d'aide IA mock;
7. notes automatiques structurées;
8. quiz de sortie;
9. tests du parcours élève et du parcours tuteur.

## Périmètre de fichiers

Autorisé : `app/tutor/live`, `app/student/live`, `src/domain/live-*`, `components/live`.

Interdit : Parcours Québec, landing, génération IA parent.

Le prototype simule la présence et l'audio. L'adaptateur live réel pourra brancher WebRTC ensuite, seulement après validation UX.

## Critères d'acceptation

- le tuteur voit qui parle, qui attend la parole et où en est l'activité sans changer de page;
- chaque élève a une occasion de participer sans obligation de caméra;
- aucune note n'atteint le parent avant validation du tuteur;
- le résumé distingue les faits des suggestions de l'IA;
- un parent peut voir les prochaines actions sans lire toute la transcription;
- le jeu de fin mesure la compréhension, pas la popularité ni la vitesse de parole;
- le parcours `tuteur → donner la parole → corriger une note → publier le résumé` est testé;
- français et anglais testés, aucune erreur console.

## Limites MVP

Pas d'enregistrement par défaut, pas de message privé élève-élève, pas de classement public humiliant, pas de vrai fournisseur vidéo ni de vraie génération IA avant décision d'équipe.
