# Service 4 — Tuteur IA élève

## Besoin réel

Le parent ne peut pas être disponible pour expliquer chaque exercice. Un tuteur IA peut fournir de la pratique abordable, mais un enfant ne doit pas recevoir un chatbot libre qui invente des réponses, collecte des informations ou devient un compagnon sans supervision.

## Promesse

Donner à l'enfant un accompagnement court et motivant entre deux interventions humaines : question, indice, tentative, feedback et transfert au parent si nécessaire.

## Pages concernées

- `Espace élève / Tuteur`;
- `Démarrer une session`;
- `Avatar et voix`;
- `Aide parent`;
- `Rapport parent`;
- `Crédits et limites`;
- `Paramètres de consentement`.

## Flux sécurisé

1. L'enfant ouvre une leçon déjà approuvée.
2. Le tuteur explique l'objectif en langage adapté.
3. L'enfant répond.
4. L'IA donne un indice avant de donner une explication.
5. Après plusieurs erreurs, elle propose une activité plus simple.
6. Si la question sort du sujet, elle demande de consulter le parent.
7. Le parent reçoit la compétence travaillée et les difficultés générales.

## Architecture pédagogique

- banque de leçons approuvées;
- objectifs et niveau transmis au modèle;
- outils limités : question, indice, reformulation, exemple;
- réponses vérifiées quand c'est possible;
- validation de sortie;
- quotas de texte/voix/avatar;
- aucun accès direct du modèle aux autres enfants.

## Interface

L'avatar doit être un personnage 2D chaleureux, clairement marqué `Tutoriel IA`. Il doit pouvoir être désactivé. La voix est facultative et le texte reste disponible.

## MVP

- une leçon académique;
- une leçon arabe ou Coran;
- tuteur texte;
- avatar animé simple;
- trois types de réponses;
- rapport parent;
- limite de session;
- bouton de sortie.

## Attention

- ne pas appeler l'IA “vrai professeur”;
- ne pas autoriser un chat général au MVP;
- ne pas conserver une transcription complète par défaut;
- ne pas demander nom complet, adresse, école ou situation familiale;
- ne pas faire de diagnostic ou d'évaluation officielle;
- tester les mauvaises réponses, le jailbreak et les questions sensibles;
- ne pas laisser l'avatar créer une dépendance émotionnelle;
- tester l'accessibilité, la latence et la compréhension vocale;
- mesurer le coût réel par session avant de fixer les crédits.

## Critères de réussite

- 90 % des réponses de démonstration restent dans la leçon;
- le tuteur donne un indice avant la solution;
- l'enfant peut arrêter la session;
- le parent comprend ce qui a été travaillé sans accéder à des données inutiles;
- aucune clé API n'est visible dans le navigateur.
