import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  addDays,
  addMonths,
  classifyExit,
  computeQuebecDeadlines,
  parseSchoolYear,
  type ResolvedDeadline,
} from "../quebec-deadlines";
import type { FamilySubmission, RequirementId } from "../quebec-types";

const YEAR = "2026-2027";

function find(
  deadlines: readonly ResolvedDeadline[],
  id: RequirementId,
): ResolvedDeadline {
  const found = deadlines.find((deadline) => deadline.requirementId === id);
  if (!found) throw new Error(`Missing deadline ${id}`);
  return found;
}

function compute(options: {
  exit?: string;
  implementation?: string;
  now?: string;
  mode?: Parameters<typeof computeQuebecDeadlines>[0]["evaluationMode"];
  submissions?: readonly FamilySubmission[];
}) {
  return computeQuebecDeadlines({
    anchors: {
      schoolYear: YEAR,
      schoolExitDate: options.exit,
      projectImplementationDate: options.implementation,
    },
    now: options.now ?? "2026-09-05",
    evaluationMode: options.mode,
    submissions: options.submissions,
  });
}

function submission(
  requirementId: RequirementId,
  respondedOn: string | undefined,
  finding: FamilySubmission["ministryFinding"],
): FamilySubmission {
  return {
    id: `sub-${requirementId}`,
    familyId: "demo-family",
    childId: "demo-child",
    jurisdiction: "quebec",
    schoolYearId: YEAR,
    requirementId,
    requirementDefinitionVersion: 1,
    status: "manually_submitted",
    recipientStates: [],
    fieldValues: {},
    evidenceIds: [],
    ministryRespondedOn: respondedOn,
    ministryFinding: finding,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}

/* ------------------------------------------------------------------ */

describe("purity", () => {
  it("never reads the clock itself", () => {
    const source = readFileSync(
      join(__dirname, "..", "quebec-deadlines.ts"),
      "utf8",
    );
    // Comments are allowed to name the forbidden calls; code is not.
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");

    expect(code).not.toMatch(/new Date\(\s*\)/);
    expect(code).not.toMatch(/Date\.now\s*\(/);
    expect(code).not.toMatch(/toLocale/);
  });

  it("is deterministic for identical input", () => {
    expect(compute({ exit: "2026-11-05" })).toEqual(
      compute({ exit: "2026-11-05" }),
    );
  });

  it("changes only urgency when now moves", () => {
    const early = compute({ exit: "2026-11-05", now: "2026-11-06" });
    const late = compute({ exit: "2026-11-05", now: "2026-12-20" });
    const earlyAvis = find(early.deadlines, "avis-declaration");
    const lateAvis = find(late.deadlines, "avis-declaration");

    expect(earlyAvis.dueOn).toBe(lateAvis.dueOn);
    expect(earlyAvis.urgency).toBe("due_soon");
    expect(lateAvis.urgency).toBe("overdue");
  });
});

describe("date arithmetic", () => {
  it("clamps month addition to the last day of the target month", () => {
    expect(addMonths("2026-08-31", 3)).toBe("2026-11-30");
    expect(addMonths("2026-11-30", 3)).toBe("2027-02-28");
    expect(addMonths("2027-11-30", 3)).toBe("2028-02-29");
  });

  it("adds days across a year boundary", () => {
    expect(addDays("2026-12-28", 10)).toBe("2027-01-07");
  });

  it("parses a school year into its July-to-June span", () => {
    expect(parseSchoolYear(YEAR)).toMatchObject({
      startsOn: "2026-07-01",
      endsOn: "2027-06-30",
    });
    expect(parseSchoolYear("2026-2028")).toBeNull();
    expect(parseSchoolYear("nope")).toBeNull();
  });
});

describe("exit classification", () => {
  const year = parseSchoolYear(YEAR)!;

  it("separates the windows the two relief predicates depend on", () => {
    expect(classifyExit(year, undefined)).toBe("none");
    expect(classifyExit(year, "2026-06-30")).toBe("before_school_year");
    expect(classifyExit(year, "2026-11-05")).toBe("autumn");
    expect(classifyExit(year, "2026-12-31")).toBe("autumn");
    expect(classifyExit(year, "2027-01-01")).toBe("winter");
    expect(classifyExit(year, "2027-03-31")).toBe("winter");
    expect(classifyExit(year, "2027-04-01")).toBe("late");
    expect(classifyExit(year, "2027-07-01")).toBe("out_of_range");
  });
});

describe("avis and projet", () => {
  it("uses the annual calendar with no exit date", () => {
    const { deadlines } = compute({});
    expect(find(deadlines, "avis-declaration")).toMatchObject({
      dueOn: "2026-07-01",
      ruleId: "art3-annual-july-1",
      anchor: "schoolYear",
    });
    expect(find(deadlines, "projet-apprentissage")).toMatchObject({
      dueOn: "2026-09-30",
      ruleId: "art5-annual-sept-30",
    });
  });

  it("switches to the 10-day and 30-day clocks on a mid-year exit", () => {
    const { deadlines } = compute({ exit: "2026-11-14" });
    expect(find(deadlines, "avis-declaration")).toMatchObject({
      dueOn: "2026-11-24",
      ruleId: "art3-exit-10-days",
      anchor: "schoolExitDate",
    });
    expect(find(deadlines, "projet-apprentissage")).toMatchObject({
      dueOn: "2026-12-14",
      ruleId: "art5-exit-30-days",
    });
  });

  it("reports the annual date it displaced rather than silently dropping it", () => {
    const { deadlines } = compute({ exit: "2026-11-14" });
    expect(find(deadlines, "avis-declaration").supersededRules).toEqual([
      {
        ruleId: "art3-annual-july-1",
        wouldHaveBeenDueOn: "2026-07-01",
        supersededBy: "art3-exit-10-days",
      },
    ]);
  });

  it("keeps the annual calendar for an exit before the school year starts", () => {
    const { deadlines, exitClassification } = compute({ exit: "2026-06-20" });
    expect(exitClassification).toBe("before_school_year");
    expect(find(deadlines, "avis-declaration").ruleId).toBe(
      "art3-annual-july-1",
    );
  });
});

describe("implementation anchor", () => {
  it("derives from the art. 5 deadline when the parent has not entered one", () => {
    const result = compute({});
    expect(result.effectiveImplementationDate).toBe("2026-09-30");
    expect(result.implementationDerivation).toBe("derived_from_art5");
  });

  it("prefers an explicit implementation date", () => {
    const result = compute({ implementation: "2026-09-08" });
    expect(result.effectiveImplementationDate).toBe("2026-09-08");
    expect(result.implementationDerivation).toBe("explicit");
  });

  it("gives every deadline a named anchor", () => {
    for (const deadline of compute({ exit: "2026-11-14" }).deadlines) {
      expect(deadline.anchor).toBeTruthy();
    }
  });
});

describe("art. 11 — état de situation, three branches", () => {
  it("(c) normal case uses the 3rd-to-5th month window", () => {
    const { deadlines } = compute({ implementation: "2026-09-30" });
    expect(find(deadlines, "etat-de-situation")).toMatchObject({
      ruleId: "art11-normal-window-3-5-months",
      applicability: "required",
      dueOn: null,
      window: { opensOn: "2026-12-30", closesOn: "2027-02-28" },
      anchor: "projectImplementationDate",
    });
  });

  it("(a) an exit between 1 January and 31 March is due 15 June, not the window", () => {
    const { deadlines } = compute({ exit: "2027-02-10" });
    const etat = find(deadlines, "etat-de-situation");
    expect(etat.ruleId).toBe("art11-exit-jan-to-mar-june-15");
    expect(etat.applicability).toBe("required");
    expect(etat.dueOn).toBe("2027-06-15");
    expect(etat.window).toBeNull();
    expect(etat.anchor).toBe("schoolExitDate");
    expect(etat.supersededRules[0].ruleId).toBe(
      "art11-normal-window-3-5-months",
    );
  });

  it("(a) covers both boundary days", () => {
    expect(find(compute({ exit: "2027-01-01" }).deadlines, "etat-de-situation").dueOn).toBe(
      "2027-06-15",
    );
    expect(find(compute({ exit: "2027-03-31" }).deadlines, "etat-de-situation").dueOn).toBe(
      "2027-06-15",
    );
  });

  it("(b) an exit after 31 March makes it optional with no date", () => {
    const etat = find(compute({ exit: "2027-04-15" }).deadlines, "etat-de-situation");
    expect(etat.ruleId).toBe("art11-exit-after-mar-31-optional");
    expect(etat.applicability).toBe("optional");
    expect(etat.dueOn).toBeNull();
    expect(etat.reasonCode).toBe("exit_after_march_31_optional");
  });

  it("(b) starts on 1 April, not 31 March", () => {
    expect(
      find(compute({ exit: "2027-04-01" }).deadlines, "etat-de-situation")
        .applicability,
    ).toBe("optional");
    expect(
      find(compute({ exit: "2027-03-31" }).deadlines, "etat-de-situation")
        .applicability,
    ).toBe("required");
  });

  it("treats 31 December as the normal branch", () => {
    expect(
      find(compute({ exit: "2026-12-31" }).deadlines, "etat-de-situation")
        .ruleId,
    ).toBe("art11-normal-window-3-5-months");
  });
});

describe("art. 16 — bilan de mi-parcours uses a different relief predicate", () => {
  it("is required in the normal case", () => {
    const bilan = find(
      compute({ implementation: "2026-09-30" }).deadlines,
      "bilan-mi-parcours",
    );
    expect(bilan.applicability).toBe("required");
    expect(bilan.window).toEqual({
      opensOn: "2026-12-30",
      closesOn: "2027-02-28",
    });
  });

  /**
   * The design's crux. A winter exit relieves the mid-course review but NOT the
   * status report — which instead moves to a hard 15 June date. Merging the two
   * obligations because they share a window would destroy exactly this.
   */
  it("diverges from the état de situation on a winter exit", () => {
    const { deadlines } = compute({ exit: "2027-02-10" });
    const etat = find(deadlines, "etat-de-situation");
    const bilan = find(deadlines, "bilan-mi-parcours");

    expect(etat.applicability).toBe("required");
    expect(etat.dueOn).toBe("2027-06-15");

    expect(bilan.applicability).toBe("optional");
    expect(bilan.dueOn).toBeNull();
    expect(bilan.reasonCode).toBe(
      "ceased_attending_after_december_31_optional",
    );
  });

  it("is optional for a late exit, alongside the état de situation", () => {
    const { deadlines } = compute({ exit: "2027-05-02" });
    expect(find(deadlines, "bilan-mi-parcours").applicability).toBe("optional");
    expect(find(deadlines, "etat-de-situation").applicability).toBe("optional");
  });

  it("is still required for an exit before 31 December", () => {
    expect(
      find(compute({ exit: "2026-12-15" }).deadlines, "bilan-mi-parcours")
        .applicability,
    ).toBe("required");
  });

  it("puts the bilan de fin on 15 June regardless of anchors", () => {
    for (const options of [{}, { exit: "2026-11-14" }, { exit: "2027-04-20" }]) {
      expect(find(compute(options).deadlines, "bilan-fin").dueOn).toBe(
        "2027-06-15",
      );
    }
  });
});

describe("art. 15 — evaluation conclusions", () => {
  it("requires the portfolio conclusion on 15 June when that mode is chosen", () => {
    const { deadlines } = compute({ mode: "portfolio" });
    expect(find(deadlines, "portfolio-evaluation")).toMatchObject({
      applicability: "required",
      dueOn: "2027-06-15",
    });
    expect(find(deadlines, "evaluation-autre").applicability).toBe(
      "not_applicable",
    );
  });

  it("requires the other-mode conclusion on 30 June otherwise", () => {
    const { deadlines } = compute({ mode: "epreuves-ministerielles" });
    expect(find(deadlines, "evaluation-autre")).toMatchObject({
      applicability: "required",
      dueOn: "2027-06-30",
    });
    expect(find(deadlines, "portfolio-evaluation").applicability).toBe(
      "not_applicable",
    );
  });

  it("waits for the parent to choose a mode", () => {
    const { deadlines } = compute({});
    expect(find(deadlines, "portfolio-evaluation").applicability).toBe(
      "pending_input",
    );
    expect(find(deadlines, "evaluation-autre").reasonCode).toBe(
      "evaluation_mode_not_chosen",
    );
  });

  it("flags the non-portfolio date as the only uncertain one", () => {
    const uncertain = compute({ mode: "evaluation-css" })
      .deadlines.filter((deadline) => deadline.uncertain)
      .map((deadline) => deadline.requirementId);
    expect(uncertain).toEqual(["evaluation-autre"]);
  });
});

describe("reactive deadlines (art. 7 and art. 17)", () => {
  it("are absent, not overdue, before a ministry response", () => {
    const { deadlines } = compute({});
    expect(find(deadlines, "projet-revise")).toMatchObject({
      applicability: "not_applicable",
      dueOn: null,
      reasonCode: "no_ministry_response_recorded",
    });
    expect(find(deadlines, "bilan-revise").applicability).toBe(
      "not_applicable",
    );
  });

  it("stay absent when the ministry accepted the document", () => {
    const { deadlines } = compute({
      submissions: [
        submission("projet-apprentissage", "2027-01-10", "accepted"),
      ],
    });
    expect(find(deadlines, "projet-revise").reasonCode).toBe(
      "ministry_finding_not_deficient",
    );
  });

  it("give 30 days from the response once a project is found deficient", () => {
    const { deadlines } = compute({
      submissions: [
        submission("projet-apprentissage", "2027-01-10", "deficient"),
      ],
    });
    expect(find(deadlines, "projet-revise")).toMatchObject({
      applicability: "required",
      dueOn: "2027-02-09",
      anchor: "ministryResponseDate",
      anchorValue: "2027-01-10",
    });
  });

  it("name which bilan started the art. 17 clock", () => {
    const { deadlines } = compute({
      submissions: [
        submission("bilan-mi-parcours", "2027-02-01", "deficient"),
        submission("bilan-fin", "2027-06-20", "deficient"),
      ],
    });
    const revise = find(deadlines, "bilan-revise");
    expect(revise.dueOn).toBe("2027-07-20");
    expect(revise.reactiveSourceRequirementId).toBe("bilan-fin");
  });
});

describe("practice, not regulation", () => {
  it("dates the school notification from the exit and cites no article", () => {
    const notice = find(compute({ exit: "2026-11-14" }).deadlines, "avis-ecole");
    expect(notice.applicability).toBe("optional");
    expect(notice.dueOn).toBe("2026-11-14");
    expect(notice.legal.basis).toBe("practice");
    expect(notice.legal.article).toBeNull();
  });

  it("does not apply without an exit date", () => {
    const notice = find(compute({}).deadlines, "avis-ecole");
    expect(notice.applicability).toBe("not_applicable");
    expect(notice.reasonCode).toBe("no_school_exit_recorded");
  });
});

describe("input issues", () => {
  it("rejects a malformed school year without inventing deadlines", () => {
    const result = computeQuebecDeadlines({
      anchors: { schoolYear: "not-a-year" },
      now: "2026-09-05",
    });
    expect(result.deadlines).toEqual([]);
    expect(result.issues[0].code).toBe("invalid_school_year_id");
  });

  it("flags an exit date past the end of the school year", () => {
    const result = compute({ exit: "2027-08-01" });
    expect(result.issues.map((issue) => issue.code)).toContain(
      "exit_date_after_school_year_end",
    );
  });

  it("flags an implementation date before the exit but still computes", () => {
    const result = compute({ exit: "2026-11-14", implementation: "2026-10-01" });
    expect(result.issues.map((issue) => issue.code)).toContain(
      "implementation_before_exit",
    );
    expect(result.deadlines.length).toBeGreaterThan(0);
  });

  it("flags a malformed date rather than throwing", () => {
    const result = compute({ exit: "2026-13-45" });
    expect(result.issues.map((issue) => issue.code)).toContain(
      "invalid_iso_date",
    );
  });
});
