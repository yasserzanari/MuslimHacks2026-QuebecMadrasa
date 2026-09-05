 # Plan de la semaine — parent

## Décision produit

Le parent voit une semaine réaliste par enfant, avec des séances de cours, de révision et de classe collaborative. Chaque séance est sélectionnable et ouvre son cours lié. Elle peut être déplacée par glisser-déposer vers un autre jour et une autre heure.

## Frontend

- Route : `/parent/plan`.
- Grille lundi–dimanche, créneaux 08 h–17 h, sidebar parent verte et panneau latéral utile.
- HTML drag-and-drop natif : `dragstart`, `dragover`, `drop`.
- Le clic sur une séance ouvre ses objectifs, durée, format et le lien `/parent/cours/:courseId`.
- Le sélecteur Adam/Sara filtre les séances.
- Le panneau « Cours à faire cette semaine » liste les cours incomplets et ouvre leur fiche.
- « Ajuster avec l’IA » lance l’état de suggestion; en production, il devra envoyer objectifs, durées et indisponibilités à un job d’optimisation.
- Le mode « Bloquer des créneaux » permet de cliquer les cases libres pour les rendre indisponibles, puis de les libérer avec un second clic.

## Backend local

- Domaine : `src/domain/week-plan.ts`.
- API : `GET /api/week-plan?childId=adam` et `PATCH /api/week-plan`.
- Le PATCH reçoit `{ sessionId, date, startTime }` et renvoie la séance mise à jour.
- Le PATCH reçoit aussi `{ action: "block_slot", date, startTime, blocked }` pour gérer les indisponibilités.
- Le stockage est volontairement en mémoire pour le prototype local. En production, remplacer le tableau par PostgreSQL/Prisma et ajouter une vérification de propriété familiale.

## Prochaine étape production

Ajouter authentification, fuseau horaire par famille, conflits de créneaux, récurrence, édition de durée et persistance transactionnelle. Le drag-and-drop doit aussi être complété par un contrôle accessible « Déplacer vers » pour clavier et mobile. Le bouton IA devra appeler un worker réel qui retourne une proposition à valider par le parent, sans modifier automatiquement le calendrier.
