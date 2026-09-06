# Parcours Québec

**État : implémenté localement.** Route `/parent/parcours-quebec`, composants `components/quebec/*`, domaine et tests d’échéances présents. Aucun dépôt gouvernemental réel.

## Problème utilisateur

Une famille qui commence l’enseignement à la maison doit comprendre des obligations, dates et documents dispersés. Une date manquée peut créer du stress et un faux sentiment de sécurité.

## Fonctionnement démontrable

Le parent choisit l’enfant et l’année scolaire, indique un départ d’école éventuel, consulte la timeline, remplit les champs du projet d’apprentissage, voit les éléments manquants et génère un export brouillon. Les statuts séparent à faire, brouillon, vérifié par le parent et exporté. L’interface avertit que le parent doit vérifier et transmettre manuellement.

## Valeur pour une famille musulmane au Québec

Un même espace relie planification familiale, apprentissage en français/anglais et choix d’activités personnalisables. La plateforme peut aider à documenter des activités religieuses, linguistiques ou communautaires comme contexte éducatif, sans prétendre qu’elles satisfont automatiquement une exigence ministérielle.

## Parcours de démo

1. Ouvrir « Parcours Québec » depuis le dashboard parent.
2. Montrer l’échéance urgente et sa source.
3. Activer le scénario « départ en cours d’année » pour montrer les délais relatifs.
4. Remplir une matière, constater les champs manquants.
5. Générer l’export et lire l’avertissement de vérification manuelle.

## Bénéfices

- réduit la charge mentale et rend la prochaine action visible;
- garde les dates dans un moteur de domaine testé;
- rend l’incertitude explicite;
- fournit une base de discussion avec le ministère ou le centre de services scolaire.

## Limites et prochaines améliorations

Le stockage est local/mock, l’identité familiale n’est pas réelle, l’export n’est pas un dépôt et certaines références d’articles doivent être revérifiées sur le texte primaire. Prochaines étapes : authentification et isolation par famille, coffre documentaire chiffré, validation humaine des sources, rappels opt-in et intégration officielle seulement après autorisation.

