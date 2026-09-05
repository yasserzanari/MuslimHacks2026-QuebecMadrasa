# Communauté / Groupes EXTRA — implémentation MVP

> Vocabulaire produit : un « Groupe EXTRA » est simplement un petit groupe local de familles qui apprennent ensemble. Ce nom est utilisé dans toute l’interface pour rester clair pour les parents et les professeurs.

## Parcours parent

1. Le parent ouvre `/parent/communaute` depuis son espace connecté.
2. Il recherche un groupe EXTRA et filtre par arrondissement ou tranche d’âge.
3. `Voir le groupe` ouvre un panneau latéral avec le descriptif, les horaires, le budget et le responsable.
4. `Demander une place` crée une demande `pending_review` via `POST /api/communities`.
5. L’interface masque l’adresse exacte, affiche l’état de vérification et permet de quitter le groupe.
6. `Créer un groupe EXTRA` envoie une proposition `pending_review`; la publication reste soumise à une vérification humaine.

## API locale

- `GET /api/communities` : liste les groupes EXTRA; `?q=` recherche dans le nom, le quartier, la langue et les activités.
- `POST /api/communities` avec `action: join` : crée une demande d’adhésion.
- `POST /api/communities` avec `action: leave` : annule l’adhésion locale.
- `POST /api/communities` avec `action: create` : soumet un groupe EXTRA à vérifier.

Le catalogue actuel est volontairement seedé pour le prototype. En production, remplacer `src/domain/communities.ts` par des tables `communities`, `memberships`, `join_requests` et `moderation_reviews`. Ne jamais exposer l’adresse précise avant l’acceptation du parent hôte.

## Limites MVP à conserver

- compte parent requis;
- pseudonyme ou prénom, jamais coordonnées privées dans la fiche publique;
- validation humaine avant publication et avant partage du lieu exact;
- aucun message privé entre élèves;
- signalement, sortie immédiate et suppression des notes/transcriptions selon les règles de sécurité.
