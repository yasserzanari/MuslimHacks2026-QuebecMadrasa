# Service 1 — Parcours Québec

## Besoin réel

Un parent peut savoir qu'il doit faire de l'enseignement à domicile sans savoir quelles étapes concernent son enfant, quel document préparer, quelle date respecter ou quel organisme contacter. Le risque n'est pas seulement l'oubli : une famille peut confondre une information générale avec une autorisation juridique.

## Utilisateur et résultat attendu

Le parent indique l'âge, le niveau, le centre de services scolaire, la date de début, la langue et le type de parcours. Il reçoit une timeline compréhensible, chaque tâche étant accompagnée de sa source officielle, de son statut et de la prochaine action.

## Pages concernées

- `Onboarding / Juridiction` : questions minimales et consentement;
- `Parcours Québec` : timeline annuelle;
- `Détail d'une obligation` : explication, source, document et échéance;
- `Mes documents` : brouillons, téléchargements et versions;
- `Centre d'aide` : réponses générales et escalade humaine;
- `Alertes` : échéances et éléments incomplets;
- `Paramètres` : centre scolaire, langue, notifications et suppression.

## Flux principal

1. Le parent crée le profil de l'enfant.
2. Le système identifie le parcours applicable selon les réponses.
3. Le parent confirme les hypothèses affichées.
4. La timeline crée les tâches et documents.
5. Le parent marque une tâche comme commencée ou envoyée.
6. Le système conserve la source et la date de consultation.
7. Une tâche ambiguë devient `à vérifier`, jamais `conforme`.

## Éléments de données

- enfant : âge, niveau, langue, année;
- juridiction : Québec, centre scolaire, date de mise à jour;
- obligation : titre, description, source, échéance, statut;
- document : type, version, date, propriétaire, partage;
- audit : qui a modifié quoi et quand.

## MVP

- une seule juridiction : Québec;
- timeline statique mais sourcée;
- checklist personnalisée;
- liens officiels;
- rappels;
- export d'un résumé;
- bannière visible : information générale, validation nécessaire.

## Ce que ce service doit résoudre

- réduire les recherches dans plusieurs sites;
- rendre visible la prochaine action;
- éviter la fausse impression de conseil juridique;
- permettre au parent de montrer son organisation à un éducateur.

## Attention pendant le développement

- versionner chaque règle et afficher sa date de mise à jour;
- ne jamais générer une affirmation juridique libre avec l'IA;
- citer le règlement et le gouvernement plutôt qu'un résumé non sourcé;
- ne pas demander de numéro ou document non nécessaire;
- faire relire les textes par une personne compétente;
- prévoir les cas particuliers et l'escalade vers la DEM ou un professionnel;
- tester les erreurs de fuseau, de date et d'année scolaire.

## Décisions critiques

- quelles données sont réellement nécessaires pour personnaliser la timeline;
- qui maintient les règles quand le Québec les modifie;
- quelles fonctions restent informatives et lesquelles nécessitent un humain;
- faut-il permettre l'export PDF dès le MVP.

## Critères de réussite

- un parent comprend sa prochaine action en moins de 30 secondes;
- chaque tâche possède une source visible;
- aucune page n'utilise le mot “garanti” ou “conforme automatiquement”;
- une modification de règle peut être publiée sans redéployer l'application.
