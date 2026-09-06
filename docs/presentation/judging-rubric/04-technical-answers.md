# Réponses techniques

## Format de livraison

Application web responsive Next.js avec App Router, accessible depuis un navigateur. Le prototype peut être lancé localement; les routes parent, student, young, services mosquées et mosquée sont séparées.

## Technologies

- Next.js 14 et React 18;
- TypeScript;
- CSS/Tailwind existant pour le design;
- API routes Next.js pour les flux locaux;
- Vitest pour les tests unitaires;
- Playwright pour les tests de parcours navigateur.

## Architecture

Les pages sont organisées par domaine (`app/parent`, `app/student`, `app/services`, `app/mosquee`). Les composants client gèrent les interactions locales; les routes API isolent les données de démonstration et les mocks IA. Cette architecture est appropriée pour un vertical slice et permet de remplacer progressivement les mocks par une base de données, une authentification et des services sécurisés.

## Fonctionnement derrière les scènes

Le parent sélectionne un enfant et une étape. La page de cours affiche une activité adaptée au niveau; le tuteur fournit un indice gradué. Les actions mettent à jour l'état local de la démonstration. Le dashboard parent agrège ensuite des indicateurs de progression simulés. En production, ces états doivent être persistés côté serveur avec autorisation par rôle.

## Ce qui a été construit pendant le hackathon et compromis

Le prototype privilégie le parcours démontrable et la clarté visuelle. Les compromis sont : données locales ou mockées, authentification non complète, persistance cloud non complète, correction IA non officielle et calendrier de prière configurable plutôt qu'une autorité religieuse. Ces compromis évitent de simuler une conformité ou une décision à haut risque.

## Qualité et performance

Les vérifications disponibles rapportent un typecheck réussi, 89 tests unitaires, des tests Playwright ciblés et des smoke tests MVP. Il faut encore publier une mesure de couverture de code et un audit de performance complet. Les pages restent légères et utilisent des assets locaux pour la démo.

## Confidentialité et éthique

Les données d'enfants sont sensibles. Une version réelle doit appliquer minimisation des données, consentement parental, séparation des rôles, journaux d'accès, chiffrement, suppression et modération. L'IA ne doit ni corriger seule une évaluation officielle, ni trancher une question religieuse, ni profiler un enfant pour de la publicité.

