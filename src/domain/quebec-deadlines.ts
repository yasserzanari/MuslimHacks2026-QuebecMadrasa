/**
 * Moteur d'échéances — fonction pure.
 *
 * Aucune date n'est codée ailleurs que dans ce fichier. Le moteur n'appelle
 * jamais `new Date()` sans argument : `now` est un paramètre, donc le calcul
 * est déterministe et testable. Toute l'arithmétique passe par UTC pour éviter
 * les décalages d'un jour.
 *
 * Chaque échéance calculée indique l'ancre qui l'a produite, afin que
 * l'interface puisse expliquer d'où vient la date.
 */

import {
  getRequirement as requirementById,
  getRequirementsInOrder,
  QUEBEC_CATALOGUE_VERSION as CATALOGUE_VERSION,
} from "./quebec-requirements";
import type {
  EvaluationMode,
  FamilySubmission,
  IsoDate,
  JointGroupId,
  LegalReference,
  RequirementDefinition,
  RequirementId,
  SchoolYear,
  SchoolYearId,
  DeadlineRuleId,
} from "./quebec-types";

export type { DeadlineRuleId };

export type DeadlineAnchorKind =
  | "schoolYear"
  | "schoolExitDate"
  | "projectImplementationDate"
  | "ministryResponseDate";

/**
 * L'art. 5 fait coïncider transmission et mise en œuvre du projet. Quand le
 * parent n'a pas saisi de date de mise en œuvre, l'échéance de l'art. 5 sert
 * donc d'ancre par défaut — et la dérivation est signalée.
 */
export type AnchorDerivation = "explicit" | "derived_from_art5" | "none";

export interface DeadlineAnchors {
  schoolYear: SchoolYearId;
  schoolExitDate?: IsoDate;
  projectImplementationDate?: IsoDate;
}

export type ExitClassification =
  | "none"
  | "before_school_year"
  | "autumn"
  | "winter"
  | "late"
  | "out_of_range";

export type DeadlineApplicability =
  | "required"
  | "optional"
  | "not_applicable"
  | "pending_input";

export type DeadlineUrgency =
  | "overdue"
  | "due_soon"
  | "window_open"
  | "upcoming"
  | "window_closed"
  | "not_scheduled";

export interface DeadlineWindow {
  opensOn: IsoDate;
  closesOn: IsoDate;
}

export interface SupersededRule {
  ruleId: DeadlineRuleId;
  wouldHaveBeenDueOn: IsoDate | null;
  supersededBy: DeadlineRuleId;
}

export type DeadlineReasonCode =
  | "exit_after_march_31_optional"
  | "ceased_attending_after_december_31_optional"
  | "no_school_exit_recorded"
  | "evaluation_mode_not_chosen"
  | "evaluation_mode_is_portfolio"
  | "evaluation_mode_is_not_portfolio"
  | "no_ministry_response_recorded"
  | "ministry_finding_not_deficient";

export type DeadlineIssueCode =
  | "invalid_school_year_id"
  | "invalid_iso_date"
  | "exit_date_after_school_year_end"
  | "implementation_before_exit";

export interface DeadlineIssue {
  code: DeadlineIssueCode;
  anchor: DeadlineAnchorKind;
  value: string | null;
}

export interface ResolvedDeadline {
  requirementId: RequirementId;
  requirementVersion: number;
  ruleId: DeadlineRuleId;
  applicability: DeadlineApplicability;
  dueOn: IsoDate | null;
  window: DeadlineWindow | null;
  anchor: DeadlineAnchorKind;
  anchorValue: IsoDate | null;
  anchorDerivation: AnchorDerivation;
  legal: LegalReference;
  uncertain: boolean;
  jointGroupId?: JointGroupId;
  effectiveDate: IsoDate | null;
  urgency: DeadlineUrgency;
  daysUntilEffectiveDate: number | null;
  supersededRules: readonly SupersededRule[];
  reasonCode: DeadlineReasonCode | null;
  /** Pour art. 17 : quel bilan a déclenché le délai de 30 jours. */
  reactiveSourceRequirementId?: RequirementId;
}

export interface DeadlineComputation {
  schoolYear: SchoolYear | null;
  exitClassification: ExitClassification;
  effectiveImplementationDate: IsoDate | null;
  implementationDerivation: AnchorDerivation;
  deadlines: readonly ResolvedDeadline[];
  issues: readonly DeadlineIssue[];
  catalogueVersion: string;
}

export interface DeadlineEngineInput {
  anchors: DeadlineAnchors;
  /** Obligatoire. Le moteur ne lit jamais l'horloge lui-même. */
  now: IsoDate;
  evaluationMode?: EvaluationMode;
  submissions?: readonly FamilySubmission[];
  dueSoonWindowDays?: number;
}

export const DEFAULT_DUE_SOON_WINDOW_DAYS = 30;

/* ------------------------------------------------------------------ *
 * Arithmétique de dates, strictement UTC.
 * ------------------------------------------------------------------ */

const MS_PER_DAY = 86_400_000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= daysInMonth(year, month);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toUtcDayNumber(iso: IsoDate): number {
  const [year, month, day] = iso.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function fromUtcDayNumber(dayNumber: number): IsoDate {
  const date = new Date(dayNumber * MS_PER_DAY);
  const year = String(date.getUTCFullYear()).padStart(4, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return fromUtcDayNumber(toUtcDayNumber(iso) + days);
}

/**
 * Ajoute des mois en bornant au dernier jour du mois cible : le 31 août + 3
 * mois donne le 30 novembre. Le règlement ne tranche pas ce cas ; le choix est
 * documenté dans `docs/plan/services/01-parcours-quebec.md`.
 */
export function addMonths(iso: IsoDate, months: number): IsoDate {
  const [year, month, day] = iso.split("-").map(Number);
  const totalMonths = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = (totalMonths % 12) + 1;
  const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth));
  return `${String(targetYear).padStart(4, "0")}-${String(targetMonth).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
}

export function compareIso(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function differenceInDays(from: IsoDate, to: IsoDate): number {
  return toUtcDayNumber(to) - toUtcDayNumber(from);
}

/* ------------------------------------------------------------------ *
 * Année scolaire et classification de la sortie.
 * ------------------------------------------------------------------ */

const SCHOOL_YEAR_PATTERN = /^(\d{4})-(\d{4})$/;

export function parseSchoolYear(id: SchoolYearId): SchoolYear | null {
  const match = SCHOOL_YEAR_PATTERN.exec(id);
  if (!match) return null;
  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  if (endYear !== startYear + 1) return null;
  return {
    id,
    jurisdiction: "quebec",
    startYear,
    endYear,
    startsOn: `${startYear}-07-01`,
    endsOn: `${endYear}-06-30`,
  };
}

/**
 * Une seule classification, plusieurs consommateurs aux prédicats DIFFÉRENTS.
 * L'art. 11 traite « winter » à part ; l'art. 16 regroupe « winter » et
 * « late ». Les écrire comme un seul booléen partagé serait le bug.
 */
export function classifyExit(
  schoolYear: SchoolYear,
  exit: IsoDate | undefined,
): ExitClassification {
  if (exit === undefined) return "none";
  if (compareIso(exit, schoolYear.endsOn) > 0) return "out_of_range";
  if (compareIso(exit, schoolYear.startsOn) < 0) return "before_school_year";
  if (compareIso(exit, `${schoolYear.startYear}-12-31`) <= 0) return "autumn";
  if (compareIso(exit, `${schoolYear.endYear}-03-31`) <= 0) return "winter";
  return "late";
}

function hasExitDate(classification: ExitClassification): boolean {
  return (
    classification === "autumn" ||
    classification === "winter" ||
    classification === "late" ||
    classification === "out_of_range"
  );
}

/* ------------------------------------------------------------------ *
 * Urgence — le seul endroit où `now` est consommé.
 * ------------------------------------------------------------------ */

function classifyUrgency(
  deadline: Pick<
    ResolvedDeadline,
    "applicability" | "effectiveDate" | "window"
  >,
  now: IsoDate,
  dueSoonWindowDays: number,
): { urgency: DeadlineUrgency; daysUntil: number | null } {
  if (
    deadline.applicability === "not_applicable" ||
    deadline.effectiveDate === null
  ) {
    return { urgency: "not_scheduled", daysUntil: null };
  }

  const daysUntil = differenceInDays(now, deadline.effectiveDate);

  if (deadline.window !== null) {
    if (compareIso(now, deadline.window.opensOn) < 0) {
      const daysToOpen = differenceInDays(now, deadline.window.opensOn);
      return {
        urgency: daysToOpen <= dueSoonWindowDays ? "due_soon" : "upcoming",
        daysUntil,
      };
    }
    if (compareIso(now, deadline.window.closesOn) > 0) {
      return { urgency: "window_closed", daysUntil };
    }
    return { urgency: "window_open", daysUntil };
  }

  if (daysUntil < 0) return { urgency: "overdue", daysUntil };
  if (daysUntil <= dueSoonWindowDays) return { urgency: "due_soon", daysUntil };
  return { urgency: "upcoming", daysUntil };
}

/* ------------------------------------------------------------------ *
 * Assemblage d'une échéance.
 * ------------------------------------------------------------------ */

interface RuleOutcome {
  ruleId: DeadlineRuleId;
  applicability: DeadlineApplicability;
  dueOn: IsoDate | null;
  window: DeadlineWindow | null;
  anchor: DeadlineAnchorKind;
  anchorValue: IsoDate | null;
  anchorDerivation: AnchorDerivation;
  supersededRules?: readonly SupersededRule[];
  reasonCode?: DeadlineReasonCode | null;
  reactiveSourceRequirementId?: RequirementId;
}

function resolve(
  requirement: RequirementDefinition,
  outcome: RuleOutcome,
  now: IsoDate,
  dueSoonWindowDays: number,
): ResolvedDeadline {
  if (!requirement.possibleRules.includes(outcome.ruleId)) {
    throw new Error(
      `Rule ${outcome.ruleId} is not declared on requirement ${requirement.id}`,
    );
  }

  const effectiveDate = outcome.dueOn ?? outcome.window?.closesOn ?? null;
  const { urgency, daysUntil } = classifyUrgency(
    {
      applicability: outcome.applicability,
      effectiveDate,
      window: outcome.window,
    },
    now,
    dueSoonWindowDays,
  );

  return {
    requirementId: requirement.id,
    requirementVersion: requirement.version,
    ruleId: outcome.ruleId,
    applicability: outcome.applicability,
    dueOn: outcome.dueOn,
    window: outcome.window,
    anchor: outcome.anchor,
    anchorValue: outcome.anchorValue,
    anchorDerivation: outcome.anchorDerivation,
    legal: requirement.legal,
    uncertain: requirement.uncertain,
    jointGroupId: requirement.jointGroupId,
    effectiveDate,
    urgency,
    daysUntilEffectiveDate: daysUntil,
    supersededRules: outcome.supersededRules ?? [],
    reasonCode: outcome.reasonCode ?? null,
    reactiveSourceRequirementId: outcome.reactiveSourceRequirementId,
  };
}

/* ------------------------------------------------------------------ *
 * Règles réactives (art. 7 et art. 17).
 * ------------------------------------------------------------------ */

function resolveReactive(
  requirement: RequirementDefinition,
  ruleId: DeadlineRuleId,
  submissions: readonly FamilySubmission[],
): RuleOutcome {
  const sourceIds = requirement.reactiveTo?.requirementIds ?? [];
  const candidates = submissions.filter(
    (submission) =>
      sourceIds.includes(submission.requirementId) &&
      submission.ministryRespondedOn !== undefined,
  );

  if (candidates.length === 0) {
    return {
      ruleId: "not-applicable",
      applicability: "not_applicable",
      dueOn: null,
      window: null,
      anchor: "ministryResponseDate",
      anchorValue: null,
      anchorDerivation: "none",
      reasonCode: "no_ministry_response_recorded",
    };
  }

  // Plusieurs bilans peuvent avoir reçu une réponse : on retient la plus récente.
  const latest = candidates.reduce((newest, candidate) =>
    compareIso(
      candidate.ministryRespondedOn as IsoDate,
      newest.ministryRespondedOn as IsoDate,
    ) > 0
      ? candidate
      : newest,
  );

  if (latest.ministryFinding !== "deficient") {
    return {
      ruleId: "not-applicable",
      applicability: "not_applicable",
      dueOn: null,
      window: null,
      anchor: "ministryResponseDate",
      anchorValue: latest.ministryRespondedOn ?? null,
      anchorDerivation: "none",
      reasonCode: "ministry_finding_not_deficient",
      reactiveSourceRequirementId: latest.requirementId,
    };
  }

  const respondedOn = latest.ministryRespondedOn as IsoDate;
  return {
    ruleId,
    applicability: "required",
    dueOn: addDays(respondedOn, 30),
    window: null,
    anchor: "ministryResponseDate",
    anchorValue: respondedOn,
    anchorDerivation: "explicit",
    reactiveSourceRequirementId: latest.requirementId,
  };
}

/* ------------------------------------------------------------------ *
 * Point d'entrée.
 * ------------------------------------------------------------------ */

export function computeQuebecDeadlines(
  input: DeadlineEngineInput,
): DeadlineComputation {
  const {
    anchors,
    now,
    evaluationMode,
    submissions = [],
    dueSoonWindowDays = DEFAULT_DUE_SOON_WINDOW_DAYS,
  } = input;

  const issues: DeadlineIssue[] = [];
  const schoolYear = parseSchoolYear(anchors.schoolYear);

  if (!schoolYear) {
    return {
      schoolYear: null,
      exitClassification: "none",
      effectiveImplementationDate: null,
      implementationDerivation: "none",
      deadlines: [],
      issues: [
        {
          code: "invalid_school_year_id",
          anchor: "schoolYear",
          value: anchors.schoolYear,
        },
      ],
      catalogueVersion: CATALOGUE_VERSION,
    };
  }

  const exitDate =
    anchors.schoolExitDate && isValidIsoDate(anchors.schoolExitDate)
      ? anchors.schoolExitDate
      : undefined;

  if (anchors.schoolExitDate && !exitDate) {
    issues.push({
      code: "invalid_iso_date",
      anchor: "schoolExitDate",
      value: anchors.schoolExitDate,
    });
  }

  const exitClassification = classifyExit(schoolYear, exitDate);
  if (exitClassification === "out_of_range" && exitDate) {
    issues.push({
      code: "exit_date_after_school_year_end",
      anchor: "schoolExitDate",
      value: exitDate,
    });
  }

  const useExitClocks =
    exitDate !== undefined && hasExitDate(exitClassification);

  /* --- art. 3, avis --------------------------------------------- */

  const annualAvisDate = `${schoolYear.startYear}-07-01`;
  const avisOutcome: RuleOutcome = useExitClocks
    ? {
        ruleId: "art3-exit-10-days",
        applicability: "required",
        dueOn: addDays(exitDate as IsoDate, 10),
        window: null,
        anchor: "schoolExitDate",
        anchorValue: exitDate as IsoDate,
        anchorDerivation: "explicit",
        supersededRules: [
          {
            ruleId: "art3-annual-july-1",
            wouldHaveBeenDueOn: annualAvisDate,
            supersededBy: "art3-exit-10-days",
          },
        ],
      }
    : {
        ruleId: "art3-annual-july-1",
        applicability: "required",
        dueOn: annualAvisDate,
        window: null,
        anchor: "schoolYear",
        anchorValue: annualAvisDate,
        anchorDerivation: "explicit",
      };

  /* --- art. 5, projet d'apprentissage ---------------------------- */

  const annualProjectDate = `${schoolYear.startYear}-09-30`;
  const projectOutcome: RuleOutcome = useExitClocks
    ? {
        ruleId: "art5-exit-30-days",
        applicability: "required",
        dueOn: addDays(exitDate as IsoDate, 30),
        window: null,
        anchor: "schoolExitDate",
        anchorValue: exitDate as IsoDate,
        anchorDerivation: "explicit",
        supersededRules: [
          {
            ruleId: "art5-annual-sept-30",
            wouldHaveBeenDueOn: annualProjectDate,
            supersededBy: "art5-exit-30-days",
          },
        ],
      }
    : {
        ruleId: "art5-annual-sept-30",
        applicability: "required",
        dueOn: annualProjectDate,
        window: null,
        anchor: "schoolYear",
        anchorValue: annualProjectDate,
        anchorDerivation: "explicit",
      };

  /* --- ancre de mise en œuvre ------------------------------------ */

  const explicitImplementation =
    anchors.projectImplementationDate &&
    isValidIsoDate(anchors.projectImplementationDate)
      ? anchors.projectImplementationDate
      : undefined;

  if (anchors.projectImplementationDate && !explicitImplementation) {
    issues.push({
      code: "invalid_iso_date",
      anchor: "projectImplementationDate",
      value: anchors.projectImplementationDate,
    });
  }

  if (
    explicitImplementation &&
    exitDate &&
    compareIso(explicitImplementation, exitDate) < 0
  ) {
    issues.push({
      code: "implementation_before_exit",
      anchor: "projectImplementationDate",
      value: explicitImplementation,
    });
  }

  const effectiveImplementationDate =
    explicitImplementation ?? projectOutcome.dueOn;
  const implementationDerivation: AnchorDerivation = explicitImplementation
    ? "explicit"
    : "derived_from_art5";

  const midWindow = (): DeadlineWindow => ({
    opensOn: addMonths(effectiveImplementationDate as IsoDate, 3),
    closesOn: addMonths(effectiveImplementationDate as IsoDate, 5),
  });

  /* --- art. 11, état de situation — les trois branches ------------ */

  const juneFifteenth = `${schoolYear.endYear}-06-15`;

  let etatOutcome: RuleOutcome;
  if (exitClassification === "winter") {
    // (a) sortie du 1er janvier au 31 mars -> au plus tard le 15 juin.
    etatOutcome = {
      ruleId: "art11-exit-jan-to-mar-june-15",
      applicability: "required",
      dueOn: juneFifteenth,
      window: null,
      anchor: "schoolExitDate",
      anchorValue: exitDate as IsoDate,
      anchorDerivation: "explicit",
      supersededRules: [
        {
          ruleId: "art11-normal-window-3-5-months",
          wouldHaveBeenDueOn: midWindow().closesOn,
          supersededBy: "art11-exit-jan-to-mar-june-15",
        },
      ],
    };
  } else if (exitClassification === "late") {
    // (b) sortie après le 31 mars -> facultatif, aucune date.
    etatOutcome = {
      ruleId: "art11-exit-after-mar-31-optional",
      applicability: "optional",
      dueOn: null,
      window: null,
      anchor: "schoolExitDate",
      anchorValue: exitDate as IsoDate,
      anchorDerivation: "explicit",
      supersededRules: [
        {
          ruleId: "art11-normal-window-3-5-months",
          wouldHaveBeenDueOn: midWindow().closesOn,
          supersededBy: "art11-exit-after-mar-31-optional",
        },
      ],
      reasonCode: "exit_after_march_31_optional",
    };
  } else {
    // (c) cas normal -> fenêtre du 3e au 5e mois suivant la mise en œuvre.
    etatOutcome = {
      ruleId: "art11-normal-window-3-5-months",
      applicability: "required",
      dueOn: null,
      window: midWindow(),
      anchor: "projectImplementationDate",
      anchorValue: effectiveImplementationDate,
      anchorDerivation: implementationDerivation,
    };
  }

  /* --- art. 16, bilan de mi-parcours ------------------------------ *
   * Prédicat de dispense DIFFÉRENT de celui de l'art. 11 : ici « winter »
   * ET « late », c'est-à-dire toute cessation après le 31 décembre.
   * Pour une sortie hivernale, l'état de situation reste donc exigé au
   * 15 juin alors que le bilan de mi-parcours devient facultatif.
   * ---------------------------------------------------------------- */

  const midtermRelief =
    exitClassification === "winter" || exitClassification === "late";

  const midtermOutcome: RuleOutcome = midtermRelief
    ? {
        ruleId: "art16-midterm-optional-after-dec-31",
        applicability: "optional",
        dueOn: null,
        window: null,
        anchor: "schoolExitDate",
        anchorValue: exitDate as IsoDate,
        anchorDerivation: "explicit",
        supersededRules: [
          {
            ruleId: "art16-midterm-window-3-5-months",
            wouldHaveBeenDueOn: midWindow().closesOn,
            supersededBy: "art16-midterm-optional-after-dec-31",
          },
        ],
        reasonCode: "ceased_attending_after_december_31_optional",
      }
    : {
        ruleId: "art16-midterm-window-3-5-months",
        applicability: "required",
        dueOn: null,
        window: midWindow(),
        anchor: "projectImplementationDate",
        anchorValue: effectiveImplementationDate,
        anchorDerivation: implementationDerivation,
      };

  /* --- art. 12, rencontre de suivi -------------------------------- */

  const rencontreOutcome: RuleOutcome = {
    ruleId: "art12-during-implementation",
    applicability: "required",
    dueOn: null,
    window: {
      opensOn: effectiveImplementationDate as IsoDate,
      closesOn: schoolYear.endsOn,
    },
    anchor: "projectImplementationDate",
    anchorValue: effectiveImplementationDate,
    anchorDerivation: implementationDerivation,
  };

  /* --- art. 16, bilan de fin -------------------------------------- */

  const finalOutcome: RuleOutcome = {
    ruleId: "art16-final-june-15",
    applicability: "required",
    dueOn: juneFifteenth,
    window: null,
    anchor: "schoolYear",
    anchorValue: juneFifteenth,
    anchorDerivation: "explicit",
  };

  /* --- art. 15, conclusions d'évaluation -------------------------- */

  const portfolioOutcome: RuleOutcome = {
    ruleId: "art15-portfolio-june-15",
    applicability:
      evaluationMode === undefined
        ? "pending_input"
        : evaluationMode === "portfolio"
          ? "required"
          : "not_applicable",
    dueOn: juneFifteenth,
    window: null,
    anchor: "schoolYear",
    anchorValue: juneFifteenth,
    anchorDerivation: "explicit",
    reasonCode:
      evaluationMode === undefined
        ? "evaluation_mode_not_chosen"
        : evaluationMode === "portfolio"
          ? null
          : "evaluation_mode_is_not_portfolio",
  };

  const otherEvaluationOutcome: RuleOutcome = {
    ruleId: "art15-other-evaluation-june-30",
    applicability:
      evaluationMode === undefined
        ? "pending_input"
        : evaluationMode === "portfolio"
          ? "not_applicable"
          : "required",
    dueOn: `${schoolYear.endYear}-06-30`,
    window: null,
    anchor: "schoolYear",
    anchorValue: `${schoolYear.endYear}-06-30`,
    anchorDerivation: "explicit",
    reasonCode:
      evaluationMode === undefined
        ? "evaluation_mode_not_chosen"
        : evaluationMode === "portfolio"
          ? "evaluation_mode_is_portfolio"
          : null,
  };

  /* --- usage : prévenir l'école ----------------------------------- */

  const schoolNoticeOutcome: RuleOutcome = exitDate
    ? {
        ruleId: "practice-inform-school-on-exit",
        applicability: "optional",
        dueOn: exitDate,
        window: null,
        anchor: "schoolExitDate",
        anchorValue: exitDate,
        anchorDerivation: "explicit",
      }
    : {
        ruleId: "not-applicable",
        applicability: "not_applicable",
        dueOn: null,
        window: null,
        anchor: "schoolExitDate",
        anchorValue: null,
        anchorDerivation: "none",
        reasonCode: "no_school_exit_recorded",
      };

  /* --- assemblage -------------------------------------------------- */

  const outcomes: Record<RequirementId, RuleOutcome> = {
    "avis-declaration": avisOutcome,
    "avis-ecole": schoolNoticeOutcome,
    "projet-apprentissage": projectOutcome,
    "projet-revise": resolveReactive(
      requirementById("projet-revise"),
      "art7-project-resubmission-30-days",
      submissions,
    ),
    "rencontre-suivi": rencontreOutcome,
    "etat-de-situation": etatOutcome,
    "bilan-mi-parcours": midtermOutcome,
    "bilan-fin": finalOutcome,
    "bilan-revise": resolveReactive(
      requirementById("bilan-revise"),
      "art17-bilan-resubmission-30-days",
      submissions,
    ),
    "portfolio-evaluation": portfolioOutcome,
    "evaluation-autre": otherEvaluationOutcome,
  };

  const deadlines = getRequirementsInOrder().map((requirement) =>
    resolve(requirement, outcomes[requirement.id], now, dueSoonWindowDays),
  );

  return {
    schoolYear,
    exitClassification,
    effectiveImplementationDate,
    implementationDerivation,
    deadlines,
    issues,
    catalogueVersion: CATALOGUE_VERSION,
  };
}
