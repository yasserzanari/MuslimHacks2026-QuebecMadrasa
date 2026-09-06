# Service — Classes collaboratives et table ronde

## Pourquoi

Certaines matières sont mieux comprises en discutant : langues, sciences, histoire, résolution de problèmes, présentation orale et projets. La plateforme doit donc compléter les leçons individuelles par des rencontres de petit groupe encadrées.

Le tableau de bord du tuteur qui anime ces sessions est spécifié dans `13-tableau-de-bord-tuteur.md`.

## Formats

- `Table ronde` : chaque élève se présente et répond à une question de départ;
- `Cours avec tuteur` : un éducateur anime, explique et distribue la parole;
- `Assistant IA de groupe` : l'IA propose des questions, résume et relance la discussion;
- `Atelier projet` : les élèves construisent une réponse ou un projet ensemble;
- `Défi révision` : mini-jeu coopératif avec questions, équipes et explication des réponses.

## Déroulement d'une session

1. Le système recommande une session selon le cours et l'objectif.
2. Le parent réserve une place ou accepte l'invitation.
3. Au début, chaque élève se présente avec un prénom affiché et répond à une question simple.
4. Le tuteur explique l'objectif et les règles de discussion.
5. Les élèves travaillent en équipe ou répondent à tour de rôle.
6. L'IA prend des notes structurées : idées, questions, notions à revoir et participation observable.
7. La session se termine par un mini-jeu ou un “ticket de sortie” de trois questions.
8. Le système génère un résumé pour l'élève et le parent, puis propose une activité individuelle.

## Fonctionnalités principales

- salle vidéo ou audio avec chat modéré;
- cercle de présentation chronométré;
- bouton “demander la parole”;
- tableau blanc ou espace de réponse partagé;
- sondages et questions rapides;
- groupes de travail limités;
- tuteur IA qui propose une question sans monopoliser la discussion;
- transcription optionnelle et notes automatiques;
- résumé avec notions comprises, à revoir et prochaines actions;
- jeu de fin : quiz coopératif, classement personnel ou défi sans classement public;
- signalement, blocage et sortie immédiate.

## Rôle du tuteur IA

L'IA ne remplace pas automatiquement un adulte. Elle peut :

- distribuer les tours de parole;
- repérer qu'une question reste sans réponse;
- reformuler sans humilier un élève;
- proposer un indice ou une analogie;
- produire un résumé basé uniquement sur la conversation autorisée;
- transformer les erreurs fréquentes en mini-jeu de révision.

Elle ne doit pas noter la personnalité, déduire une santé mentale ou publier une étiquette sur un élève.

## Notes automatiques

Le compte rendu doit séparer clairement :

- `dit pendant la session` : faits ou citations courtes;
- `notions travaillées` : objectif et concepts;
- `à vérifier` : éléments incertains;
- `prochaine activité` : exercice proposé;
- `validation du tuteur` : confirmation ou correction avant publication.

Les notes doivent être visibles par le parent et l'élève, corrigibles et supprimables. L'enregistrement audio/vidéo est désactivé par défaut.

## MVP réaliste

- session audio/vidéo de 4 à 8 élèves;
- tuteur humain ou animateur;
- chat, demande de parole et minuteur;
- assistant IA texte pour questions et résumé;
- ticket de sortie de trois questions;
- notes parent/élève après validation;
- mini-quiz généré à partir des notions réellement abordées.

## Sécurité et modération

- compte parent requis pour rejoindre une classe;
- prénom ou pseudonyme, jamais adresse ou contact privé;
- aucun message privé élève-élève au MVP;
- règles visibles avant l'entrée;
- adulte hôte identifié et possibilité de signaler;
- limite de taille, âge et capacité de la classe;
- logs d'accès minimaux et suppression des transcriptions configurable.

## Critères d'acceptation

- l'élève sait où parler, quoi faire et quelle est la prochaine étape;
- chaque élève a une occasion de participer sans obligation de caméra;
- le résumé distingue les faits des suggestions de l'IA;
- un parent peut voir les prochaines actions sans lire toute la transcription;
- le jeu de fin mesure la compréhension, pas la popularité ou la vitesse de parole.
