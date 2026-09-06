# Service 10 — Authentification et sécurité enfants

## Besoin réel

La plateforme manipule des profils d'enfants, travaux, audio, horaires et contacts d'adultes. Une seule erreur de permission peut exposer une famille ou permettre un contact inapproprié.

## Promesse

Protéger les comptes et la communauté sans surveillance secrète ni collecte inutile.

## Pages concernées

- `Inscription parent`;
- `Vérification parent`;
- `Sous-comptes enfants`;
- `Consentements`;
- `Confidentialité`;
- `Sécurité du pod`;
- `Signalement`;
- `Exporter/supprimer mes données`;
- `Administration des accès`.

## Modèle d'accès

- le parent possède la famille;
- l'enfant possède uniquement son espace d'apprentissage;
- l'éducateur voit les enfants de son groupe autorisé;
- le coordinateur voit les informations opérationnelles minimales;
- l'administrateur accède seulement selon une raison et un journal;
- une famille ne voit jamais les données d'une autre par défaut.

## MVP

Compte parent, enfant sans email public, permissions côté serveur, consentement, données fictives et test d'accès entre deux familles.

## Attention

- ne jamais mettre la sécurité uniquement dans l'interface;
- ne pas utiliser de vrais enfants dans les données de démonstration;
- valider chaque upload;
- limiter caméra, microphone et géolocalisation;
- chiffrer en transit et au repos;
- supprimer réellement les données demandées;
- ne pas faire de publicité ciblée aux enfants;
- définir une procédure d'incident;
- tester le changement de rôle et la révocation du consentement;
- faire revoir la conformité avant un pilote réel.

## Critères de réussite

- un enfant ne peut pas ouvrir les pages parent;
- un éducateur ne voit que son groupe;
- un consentement retiré bloque immédiatement l'accès associé;
- aucune clé IA ou donnée sensible n'est exposée dans le navigateur.
