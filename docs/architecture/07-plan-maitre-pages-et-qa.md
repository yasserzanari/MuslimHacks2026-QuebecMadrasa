# Plan maître — pages réellement fonctionnelles et QA navigateur

## But

Construire une plateforme bilingue français/anglais où chaque page reprend la maquette validée, fonctionne avec des données de démonstration réalistes et communique avec les autres modules par des contrats partagés. Une page n'est pas considérée comme terminée parce qu'elle s'affiche : ses boutons, états vides, erreurs, permissions, données et parcours navigateur doivent fonctionner.

## Règles visuelles non négociables

### Identité

- logo officiel : `public/ui/logo-madrasa-quebec.png`;
- vert profond, vert clair, crème, jaune doux et accents pastel;
- typographie de titres chaleureuse et serif; texte courant lisible sans surcharge;
- coins arrondis, cartes calmes, contraste accessible;
- image PNG autorisée uniquement lorsqu'elle représente une illustration ou une photo, jamais une capture complète d'interface.

### Navigation

- pages publiques : navbar horizontale en haut;
- parent connecté : sidebar à gauche;
- élève : sidebar simplifiée, contenu adapté à l'âge;
- mobile : sidebar réduite ou menu accessible, jamais une navigation qui disparaît sans alternative;
- toute page doit afficher son état actif, son titre et la prochaine action évidente.

### Langues

- français par défaut au Québec;
- switcher Français/English dans les espaces publics et connectés;
- aucun texte important codé en une seule langue;
- dates, nombres, erreurs, états vides, emails, IA et exports suivent la locale;
- tester chaque page dans les deux langues avant validation.

## Inventaire des pages et contrat de fin

| ID | Page | Public | Données principales | Actions réelles | Maquette de référence |
|---|---|---|---|---|---|
| P01 | Landing publique | visiteur | contenu marketing, locale | langue, ancres, CTA parent/élève | `07-landing-page-publique.png` |
| P02 | Onboarding famille | parent | famille, enfants, langue, juridiction | créer famille, ajouter enfant, consentir | `02-onboarding.png` |
| P03 | Dashboard parent | parent | enfants, tâches, alertes, progression | ouvrir tâche, filtrer enfant, changer langue | `06-tableau-bord-parent.png` |
| P04 | Plan de la semaine | parent | activités, temps, enfants, classes | créer, déplacer, terminer, valider | à produire selon règles existantes |
| P05 | Cours parent | parent | catalogue, leçons, objectifs | assigner, prévisualiser, demander IA | `03-parent-cours.png` |
| P06 | Assistant IA parent | parent | snapshots, preuves, jobs IA | demander analyse, créer job, approuver/rejeter | `08-assistant-ia-parent.png` |
| P07 | File de génération | parent | generation_jobs, crédits, résultats | annuler, relancer, ouvrir brouillon | incluse dans P06 |
| P08 | Parcours Québec | parent | exigences, échéances, formulaires, sources | remplir, sauvegarder, vérifier, exporter | `04-parcours-quebec.png` |
| P09 | Portfolio | parent/élève | preuves, compétences, permissions | ajouter, commenter, partager, supprimer | à produire selon service 06 |
| P10 | Communauté / Pods | parent | pods, lieux approximatifs, membres, règles | rechercher, demander, créer, signaler | `05-communaute-pods.png` |
| P11 | Budget / bourses | parent | plan, coûts, bourses, historique | simuler, demander, voir statut | service 09 |
| P12 | Espace élève ≤12 | élève | mission, cours, progression, aide | commencer, jouer, demander aide | `09-espace-eleve-12-ans.png` |
| P13 | Espace élève 13+ | élève | objectifs, échéances, portfolio, aide | continuer, planifier, demander aide | `10-espace-eleve-13-plus.png` |
| P14 | Leçon + Tuteur IA | élève | objectif, exercice, tentatives, indices | écrire, parler, demander indice, répondre | `11-tuteur-ia-eleve.png` |
| P15 | Classe collaborative élève | élève | session, participants, tour, activité | demander parole, répondre, mini-jeu | `13-classe-collaborative-eleve.png` |
| P16 | Classe collaborative tuteur | tuteur | présence, activité, modération, notes | ouvrir salle, donner parole, valider notes | `12-classe-collaborative.png`, service 13 |
| P17 | Paramètres / sécurité | parent | permissions, consentements, rétention | modifier, exporter, supprimer, signaler | service 10 |

## Interconnexion des pages

```text
Landing
  → Onboarding famille
  → Dashboard parent
       ├→ Plan de la semaine
       ├→ Cours
       │    ├→ Leçon élève
       │    └→ Assistant IA → File de génération → Validation parent
       ├→ Parcours Québec → Portfolio → Export brouillon
       ├→ Communauté / Pods → Classe collaborative
       ├→ Budget / bourses
       └→ Paramètres / sécurité

Espace élève
  ├→ Mission du jour → Leçon + Tuteur IA
  ├→ Classe collaborative élève
  └→ Portfolio personnel
```

## Contrats de données partagés

Les pages ne doivent pas inventer des données locales différentes pour le même objet.

```text
Family { id, name, locale, jurisdiction, schoolYear }
Child { id, familyId, displayName, ageBand, level, permissions }
LearningActivity { id, childId, courseId, objectiveId, status, dueAt }
Evidence { id, childId, skillId, type, source, visibility, createdAt }
QuebecRequirement { id, schoolYear, titleFr, titleEn, dueDate, window, sourceUrl, status }
GenerationJob { id, parentId, childId, type, status, sourceSnapshotIds, outputDocumentId }
LiveSession { id, courseId, hostId, participants, objective, status, notesStatus }
```

Chaque page doit lire ces contrats via un adaptateur mock aujourd'hui et un adaptateur SQLite/PostgreSQL demain. Les composants ne doivent pas appeler directement un fournisseur externe.

## Architecture des routes locales

```text
/                         landing publique
/parent                   dashboard parent
/parent/onboarding        création de famille et enfant
/parent/plan              semaine et calendrier
/parent/cours             catalogue parent
/parent/assistant         IA et demandes
/parent/generation        file et validation
/parent/parcours-quebec   échéances, formulaire, export
/parent/portfolio         preuves et compétences
/parent/pods              communauté et pods
/parent/budget            coût et bourses
/student                  espace élève selon tranche d'âge
/student/lesson/:id       leçon interactive + tuteur IA
/student/live/:id         vue élève classe live
/tutor/live/:id           vue tuteur classe live
/parent/settings          sécurité, permissions, langue
```

## Ordre de développement rapide

### Phase 0 — fondation

- tokens de design et logo;
- locale `fr/en`;
- layout public, parent et élève;
- fixtures partagées;
- API `/api/health` et adaptateur mock;
- test navigateur de navigation.

### Phase 1 — vertical slice famille

- onboarding minimal;
- dashboard parent;
- un enfant;
- une activité;
- une leçon élève;
- parent qui voit la progression après la leçon.

### Phase 2 — Parcours Québec

- moteur d'échéances versionné;
- page parent Parcours Québec;
- formulaire, checklist et export;
- tests français/anglais;

### Phase 3 — IA contrôlée

- chat parent;
- création de `generation_job`;
- worker mock;
- validation parent;
- ajout manuel au plan.

### Phase 4 — collaboration

- lobby;
- vue élève;
- vue tuteur;
- activité partagée;
- notes et mini-jeu;
- remplacement du mock live par WebRTC seulement après validation UX.

### Phase 5 — durcissement

- SQLite/Prisma;
- authentification réelle;
- permissions serveur;
- stockage privé;
- exports PDF réels;
- tests de suppression, isolation et erreurs.

## Découpage sans chevauchement des développeurs

| Mission | Fichiers autorisés | Fichiers interdits |
|---|---|---|
| Parcours Québec | `app/parent/parcours-quebec`, `src/domain/quebec-*`, `app/api/quebec`, `components/quebec` | landing, élève, IA, live |
| Classes live | `app/student/live`, `app/tutor/live`, `src/domain/live-*`, `components/live` | Parcours Québec, landing, génération IA |
| Tuteur IA | `app/student/lesson`, `app/parent/assistant`, `src/domain/ai-*`, `app/api/generation-jobs` | live réel, exigences Québec |
| i18n parent | `app/parent` et dictionnaire parent | landing, élève, API |
| Design system | tokens et composants partagés approuvés | logique métier et données |

Chaque développeur travaille sur une branche séparée et ouvre une PR limitée à une mission. Toute dépendance manquante doit être documentée plutôt que corrigée dans le domaine d'un autre développeur.

## QA navigateur obligatoire

### Pour chaque page

1. ouvrir la route sans cache obsolète;
2. vérifier que le titre, logo, nav et langue sont visibles;
3. tester tous les CTA;
4. vérifier les états vide, chargement, succès et erreur;
5. tester français puis anglais;
6. rafraîchir la page et vérifier que l'état attendu persiste;
7. tester une largeur desktop et une largeur mobile;
8. vérifier qu'aucune image de maquette complète n'est utilisée;
9. consulter la console et vérifier l'absence d'erreur runtime;
10. comparer la hiérarchie visuelle à la maquette correspondante.

### Parcours critiques à automatiser

```text
Visiteur → landing → English → parent
Parent → enfant → Parcours Québec → formulaire → export brouillon
Parent → Assistant IA → créer job → file → approuver → plan
Élève → mission → leçon → indice → réponse → progression
Élève → classe live → demander parole → activité → quiz final
Tuteur → classe live → donner parole → corriger note → publier résumé
```

## Definition of done globale

- la page ressemble à sa maquette par structure, couleurs, densité et hiérarchie;
- chaque action importante a un résultat visible;
- les données se retrouvent dans les pages qui en dépendent;
- français et anglais sont testés;
- permissions parent/élève respectées;
- aucune clé ou vraie donnée d'enfant dans le navigateur;
- `npm run typecheck`, `npm run build` et les tests navigateur passent;
- une capture avant/après et une liste d'écarts sont incluses dans la PR.
