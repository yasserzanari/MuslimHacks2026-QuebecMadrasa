# Brief agent — classe live et tuteur

## Problème

Certains apprentissages ont besoin de discussion, de présentation orale, de collaboration et d'un adulte ou assistant qui relance. Une simple leçon individuelle ne recrée pas ce contexte.

## Solution à construire

Un prototype local de classe en petit groupe : objectif au centre, participants visibles, tour de parole, activité commune, aide IA à droite, notes structurées et défi final.

## Deux vues obligatoires

- **élève** : activité, son prochain tour, bouton pour demander la parole, texte/voix, indice et défi;
- **tuteur** : présence, objectif, activité, modération, relances, génération de notes et validation du résumé.

La vue tuteur est spécifiée en détail dans `docs/plan/services/13-tableau-de-bord-tuteur.md` : layout, fonctions, contrats de données, états et critères d'acceptation.

## Première tranche de développement

1. données de session de démo;
2. lobby et entrée dans une classe;
3. grille de participants sans vidéo réelle;
4. état du tour de parole;
5. activité centrale et réponses;
6. panneau d'aide IA mock;
7. notes automatiques structurées;
8. quiz de sortie;
9. tests du parcours élève et du parcours tuteur.

## Limites

Pas d'enregistrement par défaut, pas de message privé élève-élève, pas de classement public humiliant et pas de vrai fournisseur vidéo ou IA avant décision d'équipe.
