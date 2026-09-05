# Catalogue de cours parent

## Flux livré

```text
/parent/cours
  → sélectionner un enfant
  → rechercher ou filtrer une matière
  → voir niveau, durée, objectif et progression
  → ouvrir /parent/cours/:courseId
  → assigner ou ajouter au plan
```

## Backend local

- `GET /api/courses` retourne le catalogue de démonstration;
- `POST /api/courses` reçoit `courseId` et `childId`;
- l'API vérifie que le cours existe;
- le MVP retourne une assignation `pending_parent_plan`;
- la base persistante et l'authentification seront branchées plus tard.

## Règles produit

- un parent choisit l'enfant avant d'assigner;
- un cours expose son objectif pédagogique avant l'action;
- le détail montre les modules et la progression;
- l'assignation n'invente pas une note et ne modifie pas encore le calendrier réel;
- les cours académiques, arabes et Coran restent clairement catégorisés;
- le futur contenu IA devra passer par la file de génération et la validation parent.
