# Plan d'exécution parallèle

## Règle

Chaque agent travaille dans son propre périmètre et livre une interface, un contrat de données, des tests et une courte note de décision. Aucun agent ne modifie les règles légales, le schéma de données central ou les secrets sans validation du responsable technique.

## Vague 0 — fondations

### Agent A — architecture

- initialiser l'app web/PWA;
- choisir structure des routes;
- documenter variables d'environnement;
- définir le schéma minimal;
- fournir données fictives sûres.

### Agent B — design system

- thème vert clair;
- composants bouton, carte, calendrier, badge, modal et barre de navigation;
- responsive PC/mobile;
- accessibilité clavier et contraste.

### Agent C — recherche/conformité

- vérifier les sources Québec;
- produire les textes avec liens;
- marquer ce qui exige une validation humaine;
- ne pas donner de conseil juridique.

## Vague 1 — travaux parallèles

### Agent D — onboarding et parent

Livre : inscription, famille, enfants, préférences et tableau de bord.

### Agent E — parcours Québec

Livre : timeline, tâches, sources et statut “à vérifier”.

### Agent F — planificateur

Livre : semaine, activités, multi-enfants et retard.

### Agent G — élève et jeux

Livre : mission du jour, une leçon, un mini-jeu et progression.

### Agent H — tuteur IA

Livre : tuteur limité, indices, quota de crédits et rapport parent. Utiliser uniquement des leçons de démonstration approuvées.

### Agent I — portfolio

Livre : ajout de preuve, compétence, commentaire et export.

### Agent J — pods et budget

Livre : pod fictif, capacité, coût, responsabilités et demande de rejoindre.

## Vague 2 — intégration

### Agent K — sécurité

- permissions parent/enfant;
- tests d'accès interdit;
- suppression des données;
- validation des uploads;
- limitation des logs;
- vérification qu'aucune clé IA n'est exposée au navigateur.

### Agent L — intégration et QA

- connecter les flux;
- remplir les données de démo;
- tester PC/mobile;
- tester le parcours complet;
- corriger les erreurs de navigation;
- préparer la démonstration.

## Flux de démo obligatoire

`Landing → Créer famille → Ajouter deux enfants → Parcours Québec → Plan semaine → Leçon → Tuteur IA → Preuve → Portfolio → Simulateur de pod`

## Contrat de livraison de chaque agent

- fichiers modifiés;
- capture ou description de l'écran;
- données nécessaires;
- événements/props/API utilisés;
- tests exécutés;
- risques ou décisions restantes;
- aucun placeholder présenté comme fonction terminée.

## Ordre de fusion

1. fondations et design system;
2. auth et schéma de données;
3. onboarding;
4. services parent;
5. services élève;
6. IA;
7. portfolio/pods;
8. sécurité;
9. QA et pitch.
