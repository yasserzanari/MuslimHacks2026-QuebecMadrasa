# Assistant IA parent

**État : implémenté avec réponses mock et file de génération locale; IA réelle prévue.**

## Problème

Le parent a besoin d’une synthèse exploitable, pas d’un tableau de données. Il veut comprendre ce qui est observé et décider de la prochaine action sans perdre le contrôle.

## Fonctionnement

Le parent sélectionne un enfant, pose une question et voit les sources/contexte utilisés. Une demande de cours crée un job de génération et un brouillon à revoir; rien n’est ajouté au plan sans approbation.

## Valeur, démo et bénéfices

La démo montre une question sur la progression, le panneau de trace, puis « créer une révision » et l’état `review_required`. Cela peut réduire le temps de préparation tout en respectant l’autonomie parentale.

## Limites et suite

Les réponses sont simulées, les crédits et permissions ne sont pas une production multi-familles et la voix n’est qu’une intention d’interface. À prévoir : fournisseur choisi, contrôle des coûts, journal d’accès, sources approuvées, filtrage, consentement, suppression et évaluation humaine.

