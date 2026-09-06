# Architecture IA, file de génération et classe live

## File IA

Une réponse courte peut être immédiate. Tout cours, rapport, quiz, transcription ou résumé est un `generation_job` asynchrone.

```text
POST /api/generation-jobs
  → queued
worker local
  → running
générateur mock ou fournisseur IA
  → review_required
parent
  → approved / rejected
```

Le calendrier n'est jamais modifié directement par l'IA.

## Outils contrôlés

Les outils documentés dans `src/domain/parent-ai-tools.ts` sont les seuls contrats autorisés : snapshot d'apprentissage, preuves, plan de semaine, exigences Québec, cours approuvés, création/lecture/approbation/annulation d'un job. Toute implémentation serveur vérifie le `parentId`, le `childId` et les permissions.

## Assistant parent — flux de démonstration MVP

La page `/parent/assistant` suit un flux visible et compréhensible :

1. Une suggestion remplit le champ de message sans l'envoyer.
2. À l'envoi, l'interface affiche les étapes : compréhension, lecture des données, analyse, réponse.
3. Chaque demande affiche l'outil simulé utilisé : `Progression de l’enfant`, `Cours approuvés`, `Plan de la semaine`, `Calendrier familial` ou `Analyse de séance`.
4. Une réponse courte cite ses sources. Une demande de cours peut créer un `generation_job`.
5. Le brouillon apparaît dans la file avec les actions `Approuver`, `Rejeter` puis `Ajouter au plan`; aucune action ne modifie le calendrier sans validation parentale.

Le prototype utilise des délais locaux pour rendre la séquence observable pendant une présentation. En production, ces étapes seront alimentées par les événements du worker et chaque outil sera exécuté côté serveur avec le contexte de la famille.

## Classe live

Le prototype doit simuler :

- lobby;
- présence par pseudonyme;
- objectif du cours;
- tour de parole;
- activité partagée;
- aide IA par question ou indice;
- notes structurées;
- ticket de sortie et mini-jeu.

L'adaptateur live réel pourra ensuite brancher WebRTC. Le tuteur IA de groupe doit être un participant auxiliaire : il relance, résume et propose une activité, mais ne parle pas à la place des élèves.

## Contenu généré

Chaque résultat garde : objectif, sources, version du modèle, avertissements, date et validation humaine. Les transcriptions et notes sont optionnelles, supprimables et visibles par le parent selon les règles de confidentialité.
