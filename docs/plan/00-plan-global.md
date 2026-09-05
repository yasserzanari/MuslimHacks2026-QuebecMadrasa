# Plan global — Québec Madrasa

## 1. Décision de produit

Construire d'abord une **plateforme web responsive installable comme PWA**, utilisable sur PC et mobile. Le produit principal est un service hybride : parcours québécois, organisation familiale, ressources, communauté et accompagnement humain. Le tuteur IA est un service contrôlé, pas le cœur légal du produit.

## 2. Promesse

> En quelques minutes, une famille musulmane du Québec obtient un parcours organisé, un plan de semaine, des ressources adaptées, un portfolio et une façon sécuritaire de rejoindre un groupe local.

## 3. Utilisateurs prioritaires

### Phase 1

- parents éducateurs du Grand Montréal;
- enfants de 6 à 12 ans;
- familles avec un ou plusieurs enfants;
- français, anglais et arabe pour l'interface;
- une famille peut commencer seule, sans attendre la création d'un pod.

### Phase 2

- éducateurs/tuteurs;
- coordinateurs de pods;
- mosquées et organismes;
- enfants de 13 à 15 ans;
- autres régions du Québec.

## 4. Problèmes à résoudre dans l'ordre

1. Le parent ne sait pas quoi faire ni quand le faire.
2. Le parent ne sait pas comment organiser plusieurs matières et enfants.
3. Les ressources académiques et islamiques sont dispersées.
4. L'enfant manque de motivation et de feedback abordable.
5. La famille manque de socialisation et d'aide locale.
6. Les preuves de progression sont dispersées.
7. Le coût et la disponibilité des ressources sont difficiles à prévoir.

## 5. Services du MVP

| Priorité | Service | Résultat à démontrer |
|---:|---|---|
| P0 | Onboarding famille | Profil de famille créé en moins de 5 minutes. |
| P0 | Parcours Québec | Échéances et documents avec sources officielles visibles. |
| P0 | Planificateur | Une semaine générée pour deux enfants de niveaux différents. |
| P0 | Bibliothèque de leçons | Trois leçons validées avec compétence, durée et matériel. |
| P0 | Interface élève | Mission, exercice, indice et progression. |
| P0 | Tuteur IA limité | Une session contrôlée texte/voix sur une leçon approuvée. |
| P0 | Portfolio | Une preuve ajoutée et exportée. |
| P1 | Pods | Un groupe fictif créé avec coût et responsabilités. |
| P1 | Activités locales | Ressources et événements vérifiés, sans marketplace ouverte. |
| P1 | Budget | Coût par enfant calculé. |

## 6. Architecture fonctionnelle

`Compte parent → Enfants → Objectifs → Parcours Québec → Plan → Leçons → Session élève → Preuve → Portfolio → Rapport parent`

En parallèle :

`Famille → Recherche de pod → Demande → Consentements → Calendrier → Présences → Rapport du pod`

## 7. Pages essentielles

### Publiques

- Accueil;
- Comment ça marche;
- Familles;
- Pods et mosquées;
- Educateurs;
- Tarifs;
- Sécurité des enfants;
- Sources Québec;
- Connexion/inscription.

### Parent

- Tableau de bord;
- Mes enfants;
- Parcours Québec;
- Plan de la semaine;
- Bibliothèque;
- Arabe et Coran;
- Communauté/pods;
- Portfolio;
- Budget;
- Paramètres et consentements.

### Élève

- Aujourd'hui;
- Leçons;
- Jeux;
- Tuteur;
- Projets;
- Progrès;
- Demander de l'aide.

## 8. Décisions techniques provisoires

- web responsive/PWA avant les apps natives;
- authentification parent obligatoire;
- compte enfant lié au parent, sans inscription autonome au MVP;
- base de données relationnelle;
- stockage chiffré des portfolios;
- leçons versionnées et approuvées;
- IA appelée uniquement depuis le serveur;
- aucun accès caméra obligatoire;
- aucune conversation enfant conservée par défaut;
- journal d'accès aux données sensibles.

## 9. Modèle économique de test

- gratuit : parcours de base, une famille, quota IA limité;
- premier mois premium gratuit;
- Essentiel : 39 $/mois par enfant;
- Complet : 49 $/mois par enfant;
- Premium : 59 $/mois par enfant;
- plafond familial à tester;
- pods, tutorat humain et locaux séparés.

## 10. Critères de sortie du MVP

- un parent crée une famille;
- deux profils enfants sont configurés;
- un plan hebdomadaire est produit;
- trois leçons sont disponibles;
- l'enfant termine une session;
- le parent voit une progression;
- une preuve est ajoutée au portfolio;
- les sources et limites légales sont visibles;
- aucune donnée enfant n'est exposée dans les tests;
- la démo fonctionne sur PC et écran mobile.

## 11. Ce qui est volontairement exclu

- école accréditée;
- curriculum complet de tous les niveaux;
- chat IA ouvert;
- diagnostic ou évaluation officielle;
- conseil juridique ou fatwa;
- marketplace publique non modérée;
- paiement réel dans le MVP;
- app native iOS/Android;
- avatar vidéo réaliste illimité.
