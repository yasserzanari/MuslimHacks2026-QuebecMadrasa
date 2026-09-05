/**
 * Identité de la famille, résolue côté serveur.
 *
 * Ce module est une COUTURE, pas une authentification. Le projet n'a pas encore
 * de session ni de base de données. Ce qu'il apporte aujourd'hui est déjà le
 * point essentiel : l'identité vient du serveur et **jamais du corps de la
 * requête**, comme l'exige `docs/architecture/04-securite-et-donnees.md`
 * (« identifiants et permissions vérifiés côté serveur », « séparation stricte
 * des familles »).
 *
 * Quand une vraie authentification arrivera, seul `resolveFamilySession` change :
 * il lira le témoin de session et renverra `null` si personne n'est connecté.
 * Les routes traitent déjà ce cas et répondent 401.
 */

export interface FamilySession {
  parentId: string;
  /** Les enfants que ce parent est autorisé à consulter. */
  childIds: readonly string[];
}

/**
 * Famille de démonstration. Entièrement fictive, conformément à
 * `04-securite-et-donnees.md` (« aucun dossier réel d'enfant dans les
 * captures, les tests ou les jeux de données publics »).
 *
 * NOTE : les identifiants d'enfants ne sont pas cohérents d'une page à l'autre
 * dans les données de démonstration — `adam`, `sara`, `yasmine`, `amine` et le
 * défaut `demo-child` coexistent, alors qu'« Amine » est le prénom du parent
 * dans le tableau de bord. Ils sont tous acceptés ici pour ne casser aucune
 * page existante, mais cette liste devrait être ramenée à un seul jeu.
 */
const DEMO_FAMILY: FamilySession = {
  parentId: "demo-parent",
  childIds: ["adam", "sara", "yasmine", "amine", "demo-child"],
};

/**
 * Renvoie la famille associée à la requête, ou `null` si personne n'est
 * authentifié. Le paramètre `request` n'est pas encore lu : il est présent pour
 * que la signature n'ait pas à changer le jour où le témoin de session existe.
 */
export function resolveFamilySession(request: Request): FamilySession | null {
  void request;
  return DEMO_FAMILY;
}

/**
 * Vérifie qu'un enfant appartient bien à la famille de la session.
 *
 * `assertParentCanAccess` dans `parent-ai-tools.ts` compare les identifiants de
 * parent et refuse un `childId` vide, mais ne peut pas savoir si l'enfant
 * demandé relève réellement de ce parent. C'est ce contrôle-là qui manque, et
 * c'est exactement la première menace listée dans `04-securite-et-donnees.md` :
 * consulter les données d'une autre famille.
 */
export function assertChildInFamily(
  session: FamilySession,
  childId: string,
): void {
  if (!session.childIds.includes(childId)) {
    throw new Error("Forbidden family access");
  }
}

export function isChildInFamily(
  session: FamilySession,
  childId: string,
): boolean {
  return session.childIds.includes(childId);
}
