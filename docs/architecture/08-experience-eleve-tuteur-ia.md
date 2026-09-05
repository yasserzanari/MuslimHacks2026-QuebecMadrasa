# Expérience élève et Tuteur IA — plan de conception

## Promesse

L'élève sait immédiatement quoi faire, peut essayer avant de demander de l'aide et reçoit un accompagnement qui développe son raisonnement. Le devoir reste toujours au centre; le Tuteur IA reste dans un panneau latéral droit.

## Différence selon l'âge

### 12 ans et moins

- une mission principale visible;
- gros boutons et peu de texte;
- illustrations, étoiles et feedback immédiat;
- aide IA formulée en questions très courtes;
- pas de planification complexe;
- un adulte peut reprendre la main facilement.

### 13 ans et plus

- objectifs, échéances et progression par matière;
- plusieurs étapes de cours visibles;
- possibilité d'écrire une réflexion et de consulter le portfolio;
- planifier une session de travail;
- tuteur IA plus socratique, mais toujours non-directif;
- autonomie accrue sans accès aux données parentales sensibles.

## Page espace élève

### Structure commune

1. sidebar élève simplifiée;
2. header avec nom, profil et aide;
3. carte `Mission du jour`;
4. prochaine classe ou activité;
5. progression lisible;
6. accès au tuteur IA;
7. état vide qui explique la prochaine action.

### Actions fonctionnelles

- commencer une activité;
- reprendre où l'élève s'est arrêté;
- ouvrir une leçon;
- rejoindre une classe collaborative;
- écrire au tuteur;
- lancer la voix si autorisée;
- consulter sa progression;
- terminer et envoyer une réponse.

## Page leçon + Tuteur IA

### Layout obligatoire

```text
┌──────────────────────────────────────────────────────────────┐
│ cours · objectif · progression                              │
├───────────────────────────────────────┬──────────────────────┤
│ DEVOIR / EXERCICE INTERACTIF          │ TUTEUR IA            │
│ explication, graphique, réponse       │ conversation         │
│ indices et bouton suivant             │ indice / question    │
│                                       │ micro + texte        │
└───────────────────────────────────────┴──────────────────────┘
```

Le panneau IA ne doit jamais recouvrir la question, devenir la page principale ou donner directement la réponse par défaut.

### Niveaux d'aide

1. `question` : faire expliquer l'idée de l'élève;
2. `hint_1` : rappeler la notion utile;
3. `hint_2` : proposer une étape intermédiaire;
4. `example` : montrer un exemple différent;
5. `explanation` : expliquer la solution après tentative ou demande justifiée.

Chaque réponse IA indique le niveau d'aide et propose une prochaine action claire.

## Contexte envoyé au Tuteur IA

```text
student_id autorisé
age_band
course_id
lesson_id
lesson_goal
current_question
student_attempt
previous_help_level
allowed_sources
locale
```

Le tuteur ne reçoit pas les notes privées du parent, les données financières, les exigences familiales non pertinentes ou les conversations d'une autre classe.

## Outils du tuteur

- `get_lesson_goal`;
- `get_current_activity`;
- `get_student_attempt`;
- `save_student_attempt`;
- `request_hint`;
- `explain_at_level`;
- `mark_activity_complete`;
- `report_help_needed`.

Les outils d'écriture sont limités à la tentative, à la progression et au signalement d'aide. Le tuteur ne modifie jamais le calendrier parent.

## Voix et texte

- texte disponible par défaut;
- microphone seulement après permission explicite;
- transcription visible avant envoi si la fonctionnalité est activée;
- bouton d'arrêt toujours visible;
- aucun enregistrement permanent au MVP;
- le texte de l'IA reste synchronisé avec la réponse vocale.

## Contrat de leçon

```text
Lesson { id, courseId, title, objective, ageBand, blocks[] }
LessonAttempt { id, lessonId, childId, answer, helpLevel, status, createdAt }
TutorMessage { id, attemptId, role, content, helpLevel, locale, createdAt }
```

## États à implémenter

- première ouverture;
- leçon en cours;
- réponse valide;
- réponse incorrecte mais exploitable;
- indice demandé;
- tuteur indisponible;
- microphone refusé;
- leçon terminée;
- reprise après fermeture;
- contenu non disponible dans la langue choisie.

## QA obligatoire

- l'élève trouve la mission en moins de 5 secondes;
- le devoir reste la zone dominante;
- le panneau IA est à droite sur desktop et devient une zone basse repliable sur mobile;
- l'IA pose une question avant de donner une solution;
- une tentative est conservée après rafraîchissement;
- français et anglais ne mélangent pas leurs textes;
- le parent voit une progression, pas une conversation privée complète par défaut;
- aucune erreur console dans les parcours texte, indice, réponse et fin de leçon.
