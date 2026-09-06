# Filtrage de contenu, âge et pudeur

**État : idée prévue, non implémentée dans le dépôt.** Les écrans actuels montrent des cours et des ressources de démonstration, mais aucun moteur de classification ou workflow de validation religieuse n’est livré.

## Problème utilisateur

Les parents veulent choisir des livres, images et vidéos adaptés à l’âge, au contexte familial et à leurs sensibilités de pudeur. Un contenu éducatif peut être pertinent sur le fond tout en nécessitant un avertissement, une adaptation ou une vérification humaine.

## Fonctionnement proposé

1. La ressource est analysée pour l’âge, le type de média et des signaux de contenu potentiellement sensible.
2. L’IA signale les passages, images ou scènes à vérifier au lieu de les déclarer conformes ou non conformes.
3. Chaque signal reçoit une catégorie et un niveau de confiance : faible, moyen ou élevé.
4. Un éducateur musulman ou référent qualifié examine le signal et publie une décision contextualisée.
5. Le parent peut accepter, masquer, adapter ou exclure la ressource pour sa famille.

## Contrôle parental

Les filtres doivent être configurables par âge, matière, média et préférence familiale. Le parent peut désactiver un filtre, demander une vérification manuelle, consulter la justification et revenir sur sa décision. Les réglages doivent être explicites et ne pas pénaliser une famille qui choisit une configuration différente.

## Principe de confiance

L’IA ne peut pas décider seule de la conformité religieuse : les interprétations varient selon les familles, les écoles de pensée et le contexte pédagogique. La plateforme doit éviter les promesses absolues comme « 100 % halal », « sans contenu problématique » ou « certifié religieusement » sans processus et autorité clairement définis.

## Démo à présenter

Ne pas simuler une fonctionnalité livrée. Présenter une maquette conceptuelle : une ressource reçoit un signal « à vérifier », le référent ajoute une note, puis le parent choisit de l’autoriser ou de la masquer. Étiqueter la séquence **prévue**.

## Limites et prochaines étapes

Il faut définir les rôles et qualifications des référents, la procédure d’appel, les langues supportées, la conservation des extraits, les biais du modèle et les règles de retrait. Un pilote devrait mesurer faux positifs, faux négatifs, délai de revue, accord entre référents et satisfaction des parents avant toute promesse commerciale.

