# Dossiers de travail des coéquipiers

Le projet est séparé en deux missions autonomes. Chaque personne doit lire les documents listés avant de coder et livrer une démo locale sans clé externe.

## Démarrer sans chevaucher le travail existant

```bash
git clone https://github.com/yasserzanari/MuslimHacks2026-QuebecMadrasa.git
cd MuslimHacks2026-QuebecMadrasa
npm install
npm run dev
```

Choisir une seule mission. Ne pas modifier les fichiers interdits dans le brief choisi. La mission prioritaire actuellement disponible est `04-parcours-quebec-end-to-end.md`. Elle remplace l'ancien brief de simple traduction parent pour éviter de diviser le travail sur un trop petit périmètre.

## Mission A — Parcours Québec et documents

Objectif : transformer les exigences de l'enseignement à la maison en checklist, échéances, formulaires et exports vérifiables.

Lire :

- `docs/architecture/00-architecture-globale.md`
- `docs/architecture/01-stack-local.md`
- `docs/architecture/03-conformite-quebec.md`
- `docs/architecture/04-securite-et-donnees.md`
- `docs/plan/services/01-parcours-quebec.md` si présent

Livrable attendu : une page `Parcours Québec`, un moteur de dates par année scolaire, des données de démo, un export brouillon et des tests pour les échéances.

## Mission B — Classes live, tuteur et notes

Objectif : prototyper la classe collaborative selon les deux vues UI déjà produites : vue tuteur et vue élève.

Lire :

- `docs/architecture/00-architecture-globale.md`
- `docs/architecture/01-stack-local.md`
- `docs/architecture/02-queue-ia-et-live.md`
- `docs/architecture/04-securite-et-donnees.md`
- `docs/plan/services/04-tuteur-ia-eleve.md`
- `docs/plan/services/12-classes-collaboratives.md`
- `docs/plan/services/13-tableau-de-bord-tuteur.md`
- `assets/ui/12-classe-collaborative.png`
- `assets/ui/13-classe-collaborative-eleve.png`

Livrable attendu : lobby mock, classe live locale avec participants de démo, tour de parole, activité centrale, panneau d'aide IA simulé, notes automatiques simulées et mini-jeu de sortie.

## Règles communes

- ne pas ajouter de fournisseur externe sans décision d'équipe;
- ne pas mettre de clé dans le code;
- ne pas utiliser de vraies données d'enfants;
- garder les contrats dans `src/domain`;
- ajouter un test ou une preuve manuelle pour chaque parcours;
- documenter les hypothèses et les limites dans le même dossier que la fonctionnalité.
