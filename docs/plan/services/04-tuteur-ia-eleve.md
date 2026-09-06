# Service — Tuteur IA élève

## Rôle

Le tuteur accompagne l'élève pendant une leçon interactive. Il connaît l'objectif pédagogique, observe les étapes de raisonnement autorisées et choisit entre question, indice, exemple ou explication adaptée.

## Règle d'interface obligatoire

- le devoir, l'exercice et les contrôles restent au centre;
- le tuteur IA est uniquement dans un panneau latéral droit d'environ 25 à 30 % de la largeur;
- l'élève peut écrire ou parler;
- le panneau ne doit jamais cacher la question ni devenir une page de chat séparée;
- le niveau d'aide est visible : question, indice 1, indice 2, exemple, puis solution expliquée seulement si le parcours l'autorise.

## Comportement pédagogique

Le tuteur reçoit l'objectif du cours, la notion travaillée, les tentatives de l'élève et les erreurs déjà observées. Il doit d'abord demander à l'élève d'expliquer son idée, puis donner un indice ciblé. Il ne révèle pas directement la réponse lorsque l'élève peut encore raisonner.

Exemple : au lieu de répondre à un problème de fractions, il demande « Quelle opération faut-il faire en premier et pourquoi ? » puis vérifie l'étape proposée.

## Fonctions MVP

- affichage de l'objectif du cours;
- devoir interactif au centre;
- chat texte dans le panneau droit;
- bouton microphone et transcription;
- bouton « Donne-moi un indice »;
- bouton « Pose-moi une question »;
- bouton « Explique autrement »;
- détection simple de la demande de réponse directe;
- journal des indices utilisés et de la tentative de l'élève;
- retour au parent sous forme de progression, sans exposer une conversation inutilement privée.

## Extension : aide en classe de groupe

Pour les cours qui nécessitent la discussion, le tuteur peut fonctionner dans une classe collaborative. Il pose une question commune, distribue les tours de parole, reformule les idées et prépare un résumé ou un mini-jeu après la session. La classe collaborative et ses règles de sécurité sont décrites dans `12-classes-collaboratives.md`, et le tableau de bord du tuteur qui l'anime dans `13-tableau-de-bord-tuteur.md`.

## Garde-fous

- ne pas faire le devoir à la place de l'élève;
- ne pas inventer une note ou déclarer un diagnostic;
- ne pas utiliser caméra, localisation ou données sensibles par défaut;
- limiter la longueur et le nombre de messages par leçon;
- permettre à l'élève de signaler une réponse incorrecte;
- prévoir une sortie vers un adulte lorsque le problème dépasse l'aide pédagogique;
- conserver les objectifs, sources et version du tuteur pour chaque session.

## Contrat logique minimal

```text
lesson_goal
current_question
student_attempt
help_level: question | hint_1 | hint_2 | example | explanation
interaction_mode: text | voice
response
next_action
```

Le serveur décide du niveau d'aide et filtre la réponse avant de l'envoyer à l'élève. Le navigateur ne doit jamais contenir la clé du fournisseur IA ni la logique de sécurité.
