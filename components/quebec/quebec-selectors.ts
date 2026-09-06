/**
 * Sélecteurs purs sur le résultat du moteur d'échéances. Testés séparément de
 * l'interface, parce que le classement de l'obligation la plus urgente est une
 * décision produit, pas un détail d'affichage.
 */

import type {
  DeadlineApplicability,
  DeadlineComputation,
  DeadlineUrgency,
  ResolvedDeadline,
} from "../../src/domain/quebec-deadlines";
import {
  isTerminalSubmissionStatus,
  type FamilySubmission,
  type JointGroupId,
  type SubmissionStatus,
} from "../../src/domain/quebec-types";

const URGENCY_RANK: Record<DeadlineUrgency, number> = {
  overdue: 0,
  due_soon: 1,
  window_open: 2,
  upcoming: 3,
  window_closed: 4,
  not_scheduled: 5,
};

/**
 * Une obligation légale passe toujours avant un simple usage, même si la date
 * de l'usage est déjà dépassée. Sans ce classement, prévenir l'école — qui
 * n'est exigé par aucun article — masquerait l'avis de déclaration et son
 * délai de 10 jours.
 */
const APPLICABILITY_RANK: Record<DeadlineApplicability, number> = {
  required: 0,
  optional: 1,
  pending_input: 2,
  not_applicable: 3,
};

function statusOf(
  submissions: readonly FamilySubmission[],
  deadline: ResolvedDeadline,
): SubmissionStatus {
  const found = submissions.find(
    (submission) => submission.requirementId === deadline.requirementId,
  );
  return found?.status ?? "todo";
}

/**
 * Les obligations encore ouvertes, classées par urgence puis par date. Une
 * obligation déjà confirmée disparaît ; une obligation facultative reste dans
 * la liste mais passe après une obligation obligatoire à égalité d'urgence.
 */
export function selectOpenDeadlines(
  computation: DeadlineComputation,
  submissions: readonly FamilySubmission[],
): readonly ResolvedDeadline[] {
  return computation.deadlines
    .filter((deadline) => {
      if (deadline.applicability === "not_applicable") return false;
      if (isTerminalSubmissionStatus(statusOf(submissions, deadline))) {
        return false;
      }
      return deadline.effectiveDate !== null;
    })
    .sort((a, b) => {
      if (APPLICABILITY_RANK[a.applicability] !== APPLICABILITY_RANK[b.applicability]) {
        return (
          APPLICABILITY_RANK[a.applicability] -
          APPLICABILITY_RANK[b.applicability]
        );
      }
      if (URGENCY_RANK[a.urgency] !== URGENCY_RANK[b.urgency]) {
        return URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
      }
      const dateA = a.effectiveDate ?? "";
      const dateB = b.effectiveDate ?? "";
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    });
}

export function selectUrgentDeadline(
  computation: DeadlineComputation,
  submissions: readonly FamilySubmission[],
): ResolvedDeadline | null {
  return selectOpenDeadlines(computation, submissions)[0] ?? null;
}

/** La seconde horloge, affichée en retrait sous l'obligation la plus urgente. */
export function selectSecondDeadline(
  computation: DeadlineComputation,
  submissions: readonly FamilySubmission[],
): ResolvedDeadline | null {
  return selectOpenDeadlines(computation, submissions)[1] ?? null;
}

export function selectJointGroupDeadlines(
  computation: DeadlineComputation,
  groupId: JointGroupId,
): readonly ResolvedDeadline[] {
  return computation.deadlines.filter(
    (deadline) => deadline.jointGroupId === groupId,
  );
}

/**
 * Vrai quand les obligations d'un même point de suivi n'ont pas toutes le même
 * statut — le cas d'une sortie entre janvier et mars, où l'état de situation
 * reste exigé alors que le bilan de mi-parcours devient facultatif.
 */
export function hasJointGroupDivergence(
  computation: DeadlineComputation,
  groupId: JointGroupId,
): boolean {
  const applicabilities = new Set(
    selectJointGroupDeadlines(computation, groupId).map(
      (deadline) => deadline.applicability,
    ),
  );
  return applicabilities.size > 1;
}
