/**
 * Parcours Québec — entités et machine à états.
 *
 * Règle structurante : une `RequirementDefinition` est immuable et versionnée.
 * Elle ne porte jamais de statut, de date propre à une famille ni de saisie
 * parentale. Tout cela vit sur `FamilySubmission`. Un changement ministériel
 * met ainsi à jour une définition versionnée plutôt qu'une ligne par famille.
 */

/** Date civile, sans heure ni fuseau : "AAAA-MM-JJ". L'ordre lexicographique est chronologique. */
export type IsoDate = string;

/** Instant, pour les traces d'audit seulement : "AAAA-MM-JJTHH:mm:ss.sssZ". */
export type IsoInstant = string;

export type Locale = "fr" | "en";

export type Jurisdiction = "quebec";

/** "2026-2027" — l'année scolaire québécoise court du 1er juillet au 30 juin. */
export type SchoolYearId = string;

export interface SchoolYear {
  id: SchoolYearId;
  jurisdiction: Jurisdiction;
  startYear: number;
  endYear: number;
  startsOn: IsoDate;
  endsOn: IsoDate;
}

/* ------------------------------------------------------------------ *
 * Provenance légale.
 * ------------------------------------------------------------------ */

export type LegalBasisKind = "regulation" | "practice";

/**
 * Comment la citation a été vérifiée. LégisQuébec et CanLII bloquent l'accès
 * automatisé (403), donc la vérification s'appuie sur les publications
 * ministérielles. `primaryTextVerified` reste false tant qu'une personne n'a
 * pas lu le texte réglementaire lui-même.
 */
export type SourceProvenance =
  | "ministry_guide"
  | "ministry_echeancier"
  | "quebec_ca_procedure"
  | "primary_legislation";

export interface LegalReference {
  basis: LegalBasisKind;
  /** "Règlement sur l'enseignement à la maison (RLRQ, c. I-13.3, r. 6.01)" */
  instrument: string;
  /** "art. 3" — null si et seulement si basis === "practice". */
  article: string | null;
  sourceUrl: string;
  /** Date à laquelle la référence a été confrontée à la source. */
  legalVerifiedOn: IsoDate;
  sourceProvenance: readonly SourceProvenance[];
  /** false tant que le texte réglementaire lui-même n'a pas été lu. */
  primaryTextVerified: boolean;
}

/* ------------------------------------------------------------------ *
 * Définitions d'exigences — immuables et versionnées.
 * ------------------------------------------------------------------ */

export type RequirementId =
  | "avis-declaration"
  | "avis-ecole"
  | "projet-apprentissage"
  | "projet-revise"
  | "etat-de-situation"
  | "bilan-mi-parcours"
  | "rencontre-suivi"
  | "bilan-fin"
  | "portfolio-evaluation"
  | "evaluation-autre"
  | "bilan-revise";

export type RequirementPhase = "entry" | "planning" | "midyear" | "closing";

export type DeadlineRuleId =
  | "art3-annual-july-1"
  | "art3-exit-10-days"
  | "art5-annual-sept-30"
  | "art5-exit-30-days"
  | "art11-normal-window-3-5-months"
  | "art11-exit-jan-to-mar-june-15"
  | "art11-exit-after-mar-31-optional"
  | "art16-midterm-window-3-5-months"
  | "art16-midterm-optional-after-dec-31"
  | "art12-during-implementation"
  | "art16-final-june-15"
  | "art15-portfolio-june-15"
  | "art15-other-evaluation-june-30"
  | "art7-project-resubmission-30-days"
  | "art17-bilan-resubmission-30-days"
  | "practice-inform-school-on-exit"
  | "not-applicable";

export type JointGroupId = "suivi-annuel";

export type RecipientId = "ministre-dem" | "centre-de-services" | "ecole";

export type MinistryFinding = "none" | "accepted" | "deficient";

/** Champs de l'avis (art. 2). */
export type QuebecFieldId =
  | "childFullName"
  | "childAddress"
  | "childDateOfBirth"
  | "childPermanentCode"
  | "parentOneFullName"
  | "parentOneAddress"
  | "parentTwoFullName"
  | "parentTwoAddress"
  | "schoolExitDate"
  | "schoolServiceCentreName";

export interface RequirementDefinition {
  id: RequirementId;
  jurisdiction: Jurisdiction;
  /** Incrémentée dès que le libellé, la règle ou la référence légale change. */
  version: number;
  phase: RequirementPhase;
  /** Ordre d'affichage, indépendant des dates calculées. */
  order: number;
  legal: LegalReference;
  /**
   * Vrai quand la plateforme n'est pas certaine de l'échéance exacte et que
   * l'interface doit afficher une réserve explicite.
   */
  uncertain: boolean;
  /** Branches possibles. Le moteur vérifie que la règle déclenchée y figure. */
  possibleRules: readonly DeadlineRuleId[];
  /**
   * La rencontre de suivi, le bilan de mi-parcours et l'état de situation
   * restent trois obligations distinctes, avec des prédicats de dispense
   * différents. Le guide ministériel indique qu'ils sont « désormais
   * combinés » en un seul point de suivi. Le regroupement est présentationnel :
   * il ne fusionne jamais les échéances ni les statuts.
   */
  jointGroupId?: JointGroupId;
  recipients: readonly RecipientId[];
  fieldIds: readonly QuebecFieldId[];
  /** Ne se déclenche qu'après une réponse ministérielle enregistrée. */
  reactiveTo?: {
    requirementIds: readonly RequirementId[];
    finding: MinistryFinding;
  };
}

export interface Recipient {
  id: RecipientId;
  basis: LegalBasisKind;
  channelKind: "secure_space" | "mail_or_email" | "school_office";
}

export interface QuebecFieldSpec {
  id: QuebecFieldId;
  required: boolean;
  inputKind: "text" | "date" | "address" | "permanent_code";
}

export interface JointSatisfactionGroup {
  id: JointGroupId;
  requirementIds: readonly RequirementId[];
  /** « Dossier de suivi annuel », tenu dans l'espace sécurisé du ministère. */
  ministryRecordName: string;
  legal: LegalReference;
}

/* ------------------------------------------------------------------ *
 * Modes d'évaluation (art. 15) et épreuves ministérielles (art. 15.1).
 * ------------------------------------------------------------------ */

export type EvaluationMode =
  | "portfolio"
  | "epreuves-ministerielles"
  | "evaluation-css"
  | "evaluation-personne-competente"
  | "autre-modalite-convenue";

export interface EvaluationModeDefinition {
  id: EvaluationMode;
  legal: LegalReference;
  /** art. 15.1 : en vigueur depuis 2021-2022. */
  inForceSince?: string;
  /**
   * art. 15.1 : la réussite d'une épreuve ministérielle en 4e ou 5e secondaire
   * ne donne pas droit aux unités du DES. Affiché tel quel, jamais adouci.
   */
  doesNotGrantDesUnits: boolean;
  conclusionRequirementId: Extract<
    RequirementId,
    "portfolio-evaluation" | "evaluation-autre"
  >;
}

/* ------------------------------------------------------------------ *
 * État mutable de la famille. Le statut vit ici, et seulement ici.
 * ------------------------------------------------------------------ */

export type SubmissionStatus =
  | "todo" // à faire
  | "draft" // en brouillon
  | "parent_verified" // vérifié par le parent
  | "exported" // exporté
  | "manually_submitted" // transmis manuellement
  | "confirmed"; // confirmé

/**
 * Source unique de vérité de la machine à états. La terminalité est DÉRIVÉE de
 * cette table (liste de successeurs vide), jamais déclarée ailleurs.
 */
export const submissionTransitions: Record<
  SubmissionStatus,
  readonly SubmissionStatus[]
> = {
  todo: ["draft"],
  draft: ["parent_verified"],
  parent_verified: ["draft", "exported"],
  exported: ["parent_verified", "manually_submitted"],
  manually_submitted: ["confirmed"],
  confirmed: [],
};

export function isTerminalSubmissionStatus(status: SubmissionStatus): boolean {
  return submissionTransitions[status].length === 0;
}

export function canAdvanceSubmission(
  from: SubmissionStatus,
  to: SubmissionStatus,
): boolean {
  return submissionTransitions[from].includes(to);
}

export interface RecipientSubmissionState {
  recipientId: RecipientId;
  status: SubmissionStatus;
  sentOn?: IsoDate;
  acknowledgementNote?: string;
}

export interface FamilySubmission {
  id: string;
  familyId: string;
  childId: string;
  jurisdiction: Jurisdiction;
  schoolYearId: SchoolYearId;
  requirementId: RequirementId;
  /** Épingle la version de la définition utilisée pour préparer ce dossier. */
  requirementDefinitionVersion: number;
  status: SubmissionStatus;
  /** L'avis est un seul dossier avec deux destinataires (art. 3). */
  recipientStates: readonly RecipientSubmissionState[];
  fieldValues: Partial<Record<QuebecFieldId, string>>;
  evidenceIds: readonly string[];
  parentVerifiedAt?: IsoInstant;
  exportedAt?: IsoInstant;
  completedAt?: IsoInstant;
  /** Présent seulement après réponse du ministre. Alimente art. 7 et art. 17. */
  ministryRespondedOn?: IsoDate;
  ministryFinding: MinistryFinding;
  /** Renseigné sur chacune des obligations couvertes, jamais fusionné. */
  satisfiedByJointEventId?: string;
  createdAt: IsoInstant;
  updatedAt: IsoInstant;
}

/** Un point de suivi unique qui satisfait plusieurs obligations distinctes. */
export interface JointSuiviEvent {
  id: string;
  familyId: string;
  childId: string;
  schoolYearId: SchoolYearId;
  heldOn: IsoDate;
  coversRequirementIds: readonly RequirementId[];
  /** art. 12 : le ministre donne un préavis de 15 jours. */
  noticeReceivedOn?: IsoDate;
  notes: string;
}

export type EvidenceKind =
  | "activity"
  | "portfolio_item"
  | "evaluation"
  | "document"
  | "meeting_note";

export interface Evidence {
  id: string;
  familyId: string;
  childId: string;
  kind: EvidenceKind;
  title: string;
  occurredOn: IsoDate;
  supportsRequirementIds: readonly RequirementId[];
  /** Jamais un vrai fichier d'enfant dans le prototype. */
  storageRef: string | null;
  createdAt: IsoInstant;
}

/**
 * Fait avancer un dossier. Immuable : retourne une nouvelle valeur.
 * La terminalité passe par `isTerminalSubmissionStatus`, donc elle n'est
 * exprimée qu'à un seul endroit dans tout le module.
 */
export function advanceSubmission(
  submission: FamilySubmission,
  nextStatus: SubmissionStatus,
  now: IsoInstant,
): FamilySubmission {
  if (isTerminalSubmissionStatus(submission.status)) {
    throw new Error(`Submission ${submission.id} is final`);
  }
  if (!canAdvanceSubmission(submission.status, nextStatus)) {
    throw new Error(`Invalid transition: ${submission.status} -> ${nextStatus}`);
  }

  return {
    ...submission,
    status: nextStatus,
    parentVerifiedAt:
      nextStatus === "parent_verified" ? now : submission.parentVerifiedAt,
    exportedAt: nextStatus === "exported" ? now : submission.exportedAt,
    completedAt: isTerminalSubmissionStatus(nextStatus)
      ? now
      : submission.completedAt,
    updatedAt: now,
  };
}
