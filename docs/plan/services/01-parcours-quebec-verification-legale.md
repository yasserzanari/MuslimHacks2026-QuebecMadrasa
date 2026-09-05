# Vérification légale — liste de contrôle

**But** : confirmer, article par article, que le catalogue dit ce que dit le règlement. Une personne, un navigateur, une seule passe.

**Pourquoi cette liste existe** : LégisQuébec et CanLII refusent l'accès automatisé (HTTP 403). Le contenu du module a été confronté aux publications ministérielles, mais **personne n'a encore lu le texte réglementaire lui-même**. Tant que ce n'est pas fait, chaque citation porte `primaryTextVerified: false`.

## Source à ouvrir

<https://www.legisquebec.gouv.qc.ca/fr/document/rc/I-13.3%2C%20r.%206.01>

*Règlement sur l'enseignement à la maison*, RLRQ c. I-13.3, r. 6.01.

Garder aussi sous la main, en cas de doute sur une date plutôt que sur un article :

- Échéancier : <https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Echeancier-enseignement-maison.pdf>
- Guide d'accompagnement : <https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Guide-exigences-enseignement-maison.pdf>

## Comment procéder

Pour chaque ligne : ouvrir l'article, lire, cocher si l'affirmation tient. **Si elle ne tient pas, écrire ce que dit réellement l'article dans la colonne « Écart constaté » — ne pas corriger le code dans la foulée.** Les écarts se traitent ensemble à la fin, parce qu'un numéro d'article qui a bougé en déplace souvent d'autres.

## Les affirmations à vérifier

| # | Article | Ce que le catalogue affirme | ✓ | Écart constaté |
|---|---|---|---|---|
| 1 | **art. 2** | L'avis doit indiquer : nom, adresse et date de naissance de l'enfant; noms **et adresses des deux parents**; date à laquelle l'enfant a cessé ou cessera de fréquenter l'école; **code permanent**; centre de services scolaire ou commission scolaire dont relève l'enfant. | ☐ | |
| 2 | **art. 3** | L'avis est transmis **au ministre ET au centre de services scolaire (ou à la commission scolaire) compétent** — deux destinataires, pas un. | ☐ | |
| 3 | **art. 3** | Échéance : **au plus tard le 1er juillet** de chaque année. | ☐ | |
| 4 | **art. 3** | Départ en cours d'année : **dans les 10 jours** suivant la cessation de fréquentation. | ☐ | |
| 5 | **art. 3** | Le ministre **accuse réception par écrit dans les 15 jours**. | ☐ | |
| 6 | **art. 4** | Le projet d'apprentissage couvre soit le programme ministériel complet, soit des activités variées couvrant **langue d'enseignement, langue seconde, mathématique, science et technologie, univers social**. | ☐ | |
| 7 | **art. 5** | Le projet est **transmis ET mis en œuvre au plus tard le 30 septembre**. *(Le fait que transmission et mise en œuvre partagent la même échéance est ce qui justifie l'ancre de mise en œuvre par défaut — à confirmer précisément.)* | ☐ | |
| 8 | **art. 5** | Départ en cours d'année : **dans les 30 jours** suivant la fin de la fréquentation. | ☐ | |
| 9 | **art. 7** | Projet jugé non conforme : le parent dispose de **30 jours** à compter de l'avis du ministre pour le retransmettre. | ☐ | |
| 10 | **art. 11** | État de situation : transmis **entre le 3e et le 5e mois suivant le début de la mise en œuvre**. | ☐ | |
| 11 | **art. 11** | Cessation **entre le 1er janvier et le 31 mars** : l'état de situation est dû **au plus tard le 15 juin** — et non dans la fenêtre du 3e au 5e mois. *(Branche corrigée par rapport à la brief de mission. La confirmer est le point le plus important de cette liste.)* | ☐ | |
| 12 | **art. 11** | Cessation **après le 31 mars** : l'état de situation devient **facultatif**. | ☐ | |
| 13 | **art. 12** | Rencontre de suivi : **une fois pendant la mise en œuvre**, le ministre donnant un **préavis de 15 jours**. | ☐ | |
| 14 | **art. 15** | Il existe **cinq** modes d'évaluation. Vérifier lesquels : le catalogue retient portfolio soumis au ministre, épreuves imposées par le ministre, évaluation par le centre de services scolaire, évaluation par une personne titulaire d'une autorisation d'enseigner, autre modalité convenue. | ☐ | |
| 15 | **art. 15.1** | **Cet article existe** et impose des épreuves ministérielles. En vigueur depuis l'année scolaire **2021-2022**. | ☐ | |
| 16 | **art. 15.1** | La réussite en **4e ou 5e secondaire ne donne pas droit aux unités du DES**. *(Affirmation reprise d'une source secondaire — la vérifier avec soin, elle est affichée telle quelle au parent.)* | ☐ | |
| 17 | **art. 16** | Bilan de mi-parcours : **entre le 3e et le 5e mois** suivant le début de la mise en œuvre. | ☐ | |
| 18 | **art. 16** | Cessation **après le 31 décembre** : le bilan de mi-parcours devient **facultatif**. *(Prédicat volontairement différent de celui de l'art. 11 — vérifier que les deux dates diffèrent bien.)* | ☐ | |
| 19 | **art. 16** | Bilan de fin de projet : **au plus tard le 15 juin**. | ☐ | |
| 20 | **art. 17** | Bilan jugé non conforme : **30 jours** pour le retransmettre. | ☐ | |

## Trois points qui ne se règlent pas sur LégisQuébec

| Question | À qui la poser |
|---|---|
| Les conclusions d'évaluation hors portfolio sont-elles dues le 30 juin pour tous les modes, ou la date varie-t-elle jusqu'en juillet selon le mode ? | Centre de services scolaire de la famille, ou la DEM. Marqué `uncertain: true` en attendant. |
| « Entre le 3e et le 5e mois » à partir du 31 août : la fenêtre se ferme-t-elle le 30 novembre ou le 1er décembre ? | La DEM. Le règlement ne tranche pas. Choix actuel : bornage au 30 novembre, jamais d'allongement. |
| Prévenir l'école du départ : usage ou obligation ? | Centre de services scolaire. Modélisé comme `basis: "practice"`, sans citation d'article. |

## Une fois la liste remplie

1. Si **aucun écart** : dans `src/domain/quebec-requirements.ts`, passer `primaryTextVerified` à `true` dans le constructeur `regulation()`, mettre `LEGAL_VERIFIED_ON` à la date du jour, et incrémenter `QUEBEC_CATALOGUE_VERSION`.
2. Si **des écarts** : corriger les numéros d'article et, s'il y a lieu, les règles du moteur. Toute règle modifiée doit avoir son test mis à jour dans `src/domain/__tests__/quebec-deadlines.test.ts` — les échéances ne changent jamais sans qu'un test change avec elles.
3. Incrémenter la `version` de chaque `RequirementDefinition` touchée. Les dossiers déjà préparés épinglent l'ancienne version : c'est voulu, un parent ne doit pas voir son brouillon changer sous ses yeux.
4. Noter la date de vérification dans ce fichier.

**Dernière vérification effectuée** : aucune. Sources ministérielles seulement, 5 septembre 2026.
