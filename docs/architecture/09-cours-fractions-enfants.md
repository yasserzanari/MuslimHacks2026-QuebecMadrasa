# Cours de mathématiques — Fractions (8–12 ans)

## Objectif

Comprendre qu’une fraction représente des parts égales d’un tout, puis comparer des fractions simples ayant le même dénominateur.

## Séquence MVP

1. Compter les parts colorées d’une pizza divisée en quatre.
2. Comprendre ce qui reste après avoir retiré une part.
3. Comparer `1/4`, `2/4` et `3/4`.
4. Relier une fraction à une situation de recette.

Chaque question propose quatre choix, un indice progressif et une prochaine action. Une réponse incorrecte ne révèle pas la solution; le tuteur demande à l’enfant d’expliquer ce qu’il observe.

## Visuels

`public/ui/fractions-pizza-realistic.png` est une photo réaliste utilisée pour l’activité d’introduction et `public/ui/fractions-apple-realistic.png` prépare l’exercice en huitièmes. Les visuels d’exercices doivent rester concrets, culturellement neutres et pédagogiquement lisibles : nourriture partagée, bandes fractionnées, objets de classe et recettes.

## Tuteur vocal

Le panneau de droite reste secondaire à la mission. L’avatar CSS léger utilise uniquement des animations transform/opacity : flottement, clignement, bouche et anneaux de voix. Le bouton micro est explicitement actionné par l’enfant; aucune écoute permanente et aucun enregistrement automatique au MVP.

## Route et états

- Route : `/student/cours/fractions`.
- États : question initiale, indice, réponse correcte, réponse incorrecte, question suivante, mode vocal actif, saisie texte secondaire.
- Le dashboard `/student` expose la mission du jour et le bouton « Continuer le cours ».
