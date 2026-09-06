# Inventaire des mocks et plan de réduction

## Définition utilisée

- **Fonctionnel local** : interaction réelle dans le navigateur, mais état gardé seulement dans la page ou en mémoire.
- **Mock** : réponse, contenu ou donnée fabriquée pour la démonstration.
- **Prévu** : décrit dans l'interface ou la documentation, mais non livré.

Le dépôt contient environ 7 500 lignes dans 72 fichiers applicatifs (`app`, `src`, `components`). Le nombre de lignes ne mesure pas la maturité : la persistance, la sécurité et la qualité des données comptent davantage.

## Ce qui est réellement mocké

### 1. Données utilisateurs et authentification

Les noms d'enfants, familles, tuteurs et responsables sont des données de démonstration. Il n'y a pas d'authentification complète, de gestion de session, de séparation serveur par famille ni de contrôle d'accès production.

**À dire aux juges :** « Nous avons construit le parcours UX; l'identité et les permissions réelles sont la prochaine couche de production. »

### 2. Base de données et persistance

Le health check indique `database: not-configured`. Plusieurs routes renvoient `mode: local`. Les changements de calendrier, de groupe, de progression ou de demande sont locaux ou calculés en mémoire et ne sont pas garantis après redémarrage.

**Conséquence :** le prototype montre le comportement, mais pas encore un service multi-famille durable.

### 3. Assistant IA parent

`app/api/parent-assistant` utilise `parent-ai-mocks`. Les réponses sont déterministes selon l'intention détectée. Il n'y a pas encore de vrai fournisseur LLM, de récupération de sources en production ou de contrôle de coûts.

### 4. Génération de cours/devoirs

`app/api/generation-jobs` produit un brouillon structuré localement : mise en route, pratique guidée et réflexion. Ce n'est pas encore une génération IA distante, un stockage de job, une file durable ou une publication contrôlée dans le catalogue.

### 5. Tuteur IA élève

Les indices de `app/api/student/tutor` sont des réponses écrites par avance par matière. L'interface et le flux sont démontrables; la compréhension libre, l'évaluation adaptative et la mémoire pédagogique ne sont pas encore réelles.

### 6. Parcours Québec

Les calculs de dates et la machine de statuts sont réels localement, mais `app/api/quebec` est volontairement sans état. Rien n'est transmis au gouvernement et aucun document officiel n'est déposé automatiquement.

### 7. Communauté et groupes

Les groupes sont issus d'un catalogue local. Rejoindre, créer ou quitter renvoie une confirmation de démonstration; il n'y a pas encore de comptes de responsables, de modération persistante, de vérification d'adresse ou de messagerie sécurisée.

### 8. Dashboard mosquée

`/mosquee` est un mock analytique interactif. Les élèves, notes, groupes, bénévoles, heures et indicateurs sont fictifs. Les filtres, tiroirs, estimations et notifications fonctionnent visuellement, mais ne calculent pas encore des données réelles d'une mosquée.

### 9. Impact et valeur financière

L'estimation du dashboard utilise une hypothèse éditable, par exemple `50 h × taux horaire`. Elle illustre une méthode de calcul; elle ne représente ni un revenu, ni une économie garantie, ni un paiement à une mosquée.

### 10. Calendrier de prière

Les blocs Fajr, Dhuhr, Asr, Maghrib et Isha sont des blocs configurables de démonstration. Ils ne remplacent pas un calculateur local fiable et ne doivent pas être présentés comme des horaires religieux universels.

### 11. Filtres de pudeur et validation islamique

Le filtrage IA de livres, images et vidéos est une fonctionnalité prévue, non implémentée. Une IA peut signaler ou classer; elle ne peut pas certifier seule la conformité islamique. Une validation humaine qualifiée reste obligatoire.

### 12. Correction d'examens

Le produit peut montrer du feedback et des réponses de démonstration, mais il ne corrige pas encore des examens officiels et ne produit pas de notes reconnues. Toute future correction devra rester assistée et révisée par un humain.

## Ce qui est fonctionnel malgré l'absence de backend

- navigation par routes;
- filtres du catalogue;
- réponses, erreurs, succès et indices dans les séances;
- jeux et objectifs young;
- boutons du calendrier parent;
- CTA landing et page services mosquées;
- graphiques et interactions du mock `/mosquee`;
- tests unitaires, Playwright et smoke tests disponibles.

## Plan réaliste pour réduire les mocks

Les estimations supposent une personne expérimentée à temps plein, une équipe déjà familière avec Next.js et un fournisseur d'hébergement choisi. Elles incluent tests de base, mais pas une certification légale ou une production à grande échelle.

| Phase | Livrable | Temps | Code nouveau estimé |
|---|---|---:|---:|
| 1 | Base de données persistante pour familles, élèves, cours, réponses et progression | 2–4 jours | 800–1 500 lignes |
| 2 | Authentification, rôles parent/élève/tuteur/mosquée et permissions | 3–5 jours | 1 000–2 000 lignes |
| 3 | Persistance du calendrier, prières configurables et synchronisation parent | 1–2 jours | 300–700 lignes |
| 4 | Remplacer les indices déterministes par un LLM contrôlé, logs, quotas et validation | 2–4 jours | 600–1 200 lignes |
| 5 | Jobs IA durables, stockage des brouillons et approbation parentale | 2–4 jours | 700–1 400 lignes |
| 6 | Progression réelle et analytics parent/mosquée depuis la base | 3–5 jours | 900–1 800 lignes |
| 7 | Communauté réelle : adhésion, modération, invitations et notifications | 3–6 jours | 900–1 800 lignes |
| 8 | Sécurité mineurs, audit logs, consentement et rétention | 4–8 jours | 800–1 600 lignes |
| 9 | Correction assistée avec rubriques et révision humaine | 3–6 jours | 800–1 600 lignes |

**Total pour un MVP beaucoup moins mocké : environ 23–44 jours-personnes et 6 800–13 600 lignes.** Les lignes sont une fourchette, pas une cible de qualité.

## Ce qu'il faut vraiment faire avant le hackathon

Ne pas essayer de supprimer tous les mocks. Pour une démo crédible, prioriser :

1. persister une session de démonstration;
2. faire fonctionner un seul tuteur IA réel ou documenter clairement le mock;
3. montrer les transitions parent → élève → progression;
4. garder les données mosquée explicitement fictives;
5. fournir une vidéo de secours et expliquer les limites.

