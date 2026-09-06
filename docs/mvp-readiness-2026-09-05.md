# MVP readiness — Madrasa Québec Network

## Objectif pour la présentation

Présenter un vertical slice crédible pour une famille musulmane qui fait l’école à la maison au Québec. Le parcours de démonstration doit montrer une décision parentale, une activité pour l’enfant et un contrôle humain avant toute publication.

## État actuel

### Parcours déjà disponibles

- `/` : landing publique.
- `/parent` : dashboard parent avec priorité, activité en direct et prochaines étapes.
- `/parent/cours` : catalogue, recherche, filtre, progression et assignation locale.
- `/parent/cours/[courseId]` : détail d’une leçon avec modules, objectif et tuteur IA élève.
- `/parent/plan` : plan de la semaine avec sessions et créneaux bloqués.
- `/parent/parcours-quebec` : échéances, exigences, sources et export de brouillon.
- `/parent/budget` : estimation des aides et services à vérifier.
- `/parent/communaute` : pods et classes communautaires.
- `/parent/settings` : langue et rappel de confidentialité.
- `/student` : espace élève.
- `/student/cours/[courseId]` : leçon guidée avec progression.
- `/student/jeux` : révision ludique.
- `/student/live/[id]` et `/tutor/live/[id]` : prototype de classe collaborative.

### Livré pour cette itération

- `/parent/assistant` : assistant IA parent avec questions rapides, contexte autorisé, réponse mockée, outils visibles et file de génération.
- Création d’un brouillon de devoir via `POST /api/generation-jobs`.
- Actions locales de révision parentale : approuver, rejeter ou ajouter au plan.
- Prompts mockés séparés des composants UI.

## Démonstration recommandée

1. Ouvrir le dashboard parent.
2. Cliquer sur `Assistant IA`.
3. Sélectionner Sara ou Amine.
4. Demander : « Que devrait-il travailler cette semaine ? ».
5. Montrer les trois sources lues : progression, preuves et plan de semaine.
6. Cliquer sur `Créer une révision`.
7. Montrer le job `En attente de validation` et le contenu généré.
8. Approuver le brouillon.
9. Cliquer sur `Ajouter au plan`.

## Prompts mockés du MVP

### Résumer la progression

```text
Tu es l’assistant pédagogique du parent. Résume uniquement les données autorisées de l’enfant sélectionné. Cite les sources utilisées. Sépare les faits, les points à revoir et les limites. Ne pose aucun diagnostic.
```

### Proposer la semaine

```text
À partir de la progression, des preuves et du plan actuel, propose au maximum trois actions réalisables cette semaine. Respecte le temps disponible. Chaque action doit avoir un objectif, une durée et une prochaine étape.
```

### Créer un devoir

```text
Crée un brouillon de révision de 20 à 30 minutes pour l’objectif sélectionné. Inclus une mise en route, une pratique guidée, une question de réflexion et une clé de vérification. Le parent doit valider avant publication. N’invente ni note, ni exigence ministérielle.
```

## Outils autorisés

L’interface affiche les outils, mais le serveur doit rester la seule couche qui les appelle :

- `get_child_learning_snapshot` : progression récente;
- `get_skill_evidence` : preuves liées à une compétence;
- `get_week_plan` : temps et activités prévues;
- `get_quebec_requirement_status` : état du parcours Québec;
- `search_approved_lessons` : contenu déjà approuvé;
- `create_generation_job` : dépôt d’un devoir dans la file;
- `approve_generated_content` : validation parentale;
- `cancel_generation_job` : annulation avant publication.

## Garde-fous visibles dans le MVP

- L’IA ne diagnostique pas un enfant.
- L’IA ne modifie jamais directement le calendrier.
- Tout devoir généré porte la mention `Validation parentale requise`.
- Les sources et la date du contexte sont visibles.
- Le parent choisit l’enfant avant toute création.
- La voix, l’avatar et la vraie génération externe restent hors MVP de demain.

## Ce qui reste après la présentation

1. Remplacer les réponses mockées par un fournisseur IA côté serveur.
2. Ajouter une authentification et vérifier `parentId` côté serveur.
3. Persister les jobs dans SQLite/PostgreSQL.
4. Ajouter les endpoints d’approbation et d’annulation persistants.
5. Connecter l’ajout au vrai plan de la semaine.
6. Tester les permissions parent/élève et la suppression des données.
7. Finaliser le bilingue sur toutes les routes.
8. Ajouter les tests navigateur pour les parcours principaux.

## Limite à dire pendant le pitch

Le MVP présenté est un prototype local fonctionnel. Il ne remplace pas une école, un enseignant autorisé, le ministère de l’Éducation ou un avis juridique. Les données et la génération IA sont simulées jusqu’à la connexion d’un backend sécurisé.
