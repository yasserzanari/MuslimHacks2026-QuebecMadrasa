import { describe, expect, it } from "vitest";

import { computeQuebecDeadlines } from "../quebec-deadlines";
import {
  getRequirement,
  getRequirementsInOrder,
  quebecEvaluationModes,
  quebecFieldSpecs,
  quebecJointSatisfactionGroups,
  quebecRequirements,
} from "../quebec-requirements";
import {
  advanceSubmission,
  canAdvanceSubmission,
  isTerminalSubmissionStatus,
  submissionTransitions,
  type FamilySubmission,
  type SubmissionStatus,
} from "../quebec-types";

const ALL_STATUSES = Object.keys(submissionTransitions) as SubmissionStatus[];

describe("status machine", () => {
  it("derives terminality from the transition table alone", () => {
    for (const status of ALL_STATUSES) {
      expect(isTerminalSubmissionStatus(status)).toBe(
        submissionTransitions[status].length === 0,
      );
    }
  });

  it("has confirmé as its only terminal state", () => {
    expect(ALL_STATUSES.filter(isTerminalSubmissionStatus)).toEqual([
      "confirmed",
    ]);
  });

  it("walks the full six-state path", () => {
    const path: SubmissionStatus[] = [
      "todo",
      "draft",
      "parent_verified",
      "exported",
      "manually_submitted",
      "confirmed",
    ];
    for (let index = 0; index < path.length - 1; index += 1) {
      expect(canAdvanceSubmission(path[index], path[index + 1])).toBe(true);
    }
  });

  it("allows the parent to step back to redraft or re-verify", () => {
    expect(canAdvanceSubmission("parent_verified", "draft")).toBe(true);
    expect(canAdvanceSubmission("exported", "parent_verified")).toBe(true);
  });

  it("refuses an illegal jump", () => {
    expect(canAdvanceSubmission("todo", "exported")).toBe(false);
  });
});

function makeSubmission(status: SubmissionStatus): FamilySubmission {
  return {
    id: "sub-1",
    familyId: "demo-family",
    childId: "demo-child",
    jurisdiction: "quebec",
    schoolYearId: "2026-2027",
    requirementId: "avis-declaration",
    requirementDefinitionVersion: 1,
    status,
    recipientStates: [],
    fieldValues: {},
    evidenceIds: [],
    ministryFinding: "none",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}

describe("advanceSubmission", () => {
  const now = "2026-09-05T12:00:00.000Z";

  it("returns a new object and leaves the original untouched", () => {
    const before = makeSubmission("todo");
    const after = advanceSubmission(before, "draft", now);
    expect(before.status).toBe("todo");
    expect(after.status).toBe("draft");
    expect(after).not.toBe(before);
  });

  it("stamps completedAt only on the terminal transition", () => {
    expect(
      advanceSubmission(makeSubmission("exported"), "manually_submitted", now)
        .completedAt,
    ).toBeUndefined();
    expect(
      advanceSubmission(makeSubmission("manually_submitted"), "confirmed", now)
        .completedAt,
    ).toBe(now);
  });

  it("stamps parentVerifiedAt and exportedAt on their own transitions", () => {
    expect(
      advanceSubmission(makeSubmission("draft"), "parent_verified", now)
        .parentVerifiedAt,
    ).toBe(now);
    expect(
      advanceSubmission(makeSubmission("parent_verified"), "exported", now)
        .exportedAt,
    ).toBe(now);
  });

  it("refuses to move a confirmed submission", () => {
    expect(() =>
      advanceSubmission(makeSubmission("confirmed"), "draft", now),
    ).toThrow(/is final/);
  });

  it("refuses an illegal transition", () => {
    expect(() =>
      advanceSubmission(makeSubmission("todo"), "exported", now),
    ).toThrow(/Invalid transition/);
  });
});

describe("catalogue", () => {
  it("never hangs status on a requirement definition", () => {
    for (const requirement of quebecRequirements) {
      expect(requirement).not.toHaveProperty("status");
    }
  });

  it("cites an article for every regulatory requirement and none for practice", () => {
    for (const requirement of quebecRequirements) {
      const { basis, article, sourceUrl, legalVerifiedOn } = requirement.legal;
      expect(sourceUrl).toBeTruthy();
      expect(legalVerifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (basis === "regulation") {
        expect(article).toBeTruthy();
      } else {
        expect(article).toBeNull();
      }
    }
  });

  it("records source provenance and does not claim primary-text verification", () => {
    for (const requirement of quebecRequirements) {
      expect(requirement.legal.sourceProvenance.length).toBeGreaterThan(0);
      expect(requirement.legal.primaryTextVerified).toBe(false);
    }
  });

  it("treats informing the school as the only practice-based obligation", () => {
    const practice = quebecRequirements
      .filter((requirement) => requirement.legal.basis === "practice")
      .map((requirement) => requirement.id);
    expect(practice).toEqual(["avis-ecole"]);
  });

  it("sends the avis to both statutory recipients", () => {
    expect(getRequirement("avis-declaration").recipients).toEqual([
      "ministre-dem",
      "centre-de-services",
    ]);
  });

  it("covers the art. 2 fields, including both parents", () => {
    const ids = quebecFieldSpecs.map((field) => field.id);
    expect(ids).toContain("childPermanentCode");
    expect(ids).toContain("parentTwoFullName");
    expect(ids).toContain("parentTwoAddress");
    for (const field of quebecFieldSpecs) {
      expect(field.required).toBe(true);
    }
  });

  it("keeps unique ids and unique ordering", () => {
    const ids = quebecRequirements.map((requirement) => requirement.id);
    const orders = quebecRequirements.map((requirement) => requirement.order);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("records that ministerial exams grant no DES units", () => {
    const exams = quebecEvaluationModes.find(
      (mode) => mode.id === "epreuves-ministerielles",
    );
    expect(exams?.doesNotGrantDesUnits).toBe(true);
    expect(exams?.inForceSince).toBe("2021-2022");
  });

  it("only fires rules a requirement declares", () => {
    const { deadlines } = computeQuebecDeadlines({
      anchors: { schoolYear: "2026-2027", schoolExitDate: "2027-02-10" },
      now: "2027-02-11",
    });
    for (const deadline of deadlines) {
      expect(
        getRequirement(deadline.requirementId).possibleRules,
      ).toContain(deadline.ruleId);
    }
  });

  it("orders requirements deterministically", () => {
    const orders = getRequirementsInOrder().map(
      (requirement) => requirement.order,
    );
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });
});

describe("joint satisfaction group", () => {
  it("groups exactly the three obligations the ministry combines", () => {
    const group = quebecJointSatisfactionGroups[0];
    expect(group.id).toBe("suivi-annuel");
    expect([...group.requirementIds].sort()).toEqual([
      "bilan-mi-parcours",
      "etat-de-situation",
      "rencontre-suivi",
    ]);
    expect(
      quebecRequirements
        .filter((requirement) => requirement.jointGroupId === "suivi-annuel")
        .map((requirement) => requirement.id)
        .sort(),
    ).toEqual([
      "bilan-mi-parcours",
      "etat-de-situation",
      "rencontre-suivi",
    ]);
  });

  /**
   * Grouping is presentational. If a future refactor merges these three because
   * they usually share a window, this test fails: a winter exit makes them
   * diverge into three different outcomes.
   */
  it("never collapses the three into one outcome", () => {
    const { deadlines } = computeQuebecDeadlines({
      anchors: { schoolYear: "2026-2027", schoolExitDate: "2027-02-10" },
      now: "2027-02-11",
    });
    const grouped = deadlines.filter(
      (deadline) => deadline.jointGroupId === "suivi-annuel",
    );
    expect(grouped).toHaveLength(3);

    const signatures = grouped.map(
      (deadline) => `${deadline.ruleId}:${deadline.applicability}`,
    );
    expect(new Set(signatures).size).toBe(3);
  });
});
