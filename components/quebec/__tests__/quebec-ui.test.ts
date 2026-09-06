import { describe, expect, it } from "vitest";

import { computeQuebecDeadlines } from "../../../src/domain/quebec-deadlines";
import type { FamilySubmission } from "../../../src/domain/quebec-types";
import { quebecDictionaries } from "../quebec-dictionary";
import { formatIsoDate } from "../quebec-format";
import {
  hasJointGroupDivergence,
  selectJointGroupDeadlines,
  selectSecondDeadline,
  selectUrgentDeadline,
} from "../quebec-selectors";

function keyShape(value: unknown): unknown {
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [key, keyShape((value as Record<string, unknown>)[key])]),
    );
  }
  return typeof value;
}

describe("dictionary", () => {
  it("has the same keys and shapes in both languages", () => {
    expect(keyShape(quebecDictionaries.en)).toEqual(
      keyShape(quebecDictionaries.fr),
    );
  });

  it("never leaves a visible string empty or equal to its own key", () => {
    const walk = (node: unknown, path: string) => {
      if (typeof node === "string") {
        expect(node.trim()).not.toBe("");
        expect(node).not.toBe(path.split(".").pop());
        return;
      }
      if (node && typeof node === "object" && !Array.isArray(node)) {
        for (const [key, value] of Object.entries(
          node as Record<string, unknown>,
        )) {
          walk(value, `${path}.${key}`);
        }
      }
    };
    walk(quebecDictionaries.fr, "fr");
    walk(quebecDictionaries.en, "en");
  });

  it("never tells a family it is compliant", () => {
    const flat = JSON.stringify(quebecDictionaries);
    expect(flat).not.toMatch(/vous êtes conforme/i);
    expect(flat).not.toMatch(/you are compliant/i);
  });
});

describe("date formatting", () => {
  it("does not shift a date backwards for a Quebec reader", () => {
    expect(formatIsoDate("2027-06-15", "fr")).toContain("15");
    expect(formatIsoDate("2027-06-15", "en")).toContain("15");
  });

  it("renders a format-ambiguous date differently per locale", () => {
    // 2027-01-02 is 2 January, not 1 February, in both renderings.
    const fr = formatIsoDate("2027-01-02", "fr");
    const en = formatIsoDate("2027-01-02", "en");
    expect(fr).not.toBe(en);
    expect(fr).toContain("janvier");
    expect(en).toContain("January");
  });

  it("renders an empty string for an absent date", () => {
    expect(formatIsoDate(null, "fr")).toBe("");
  });
});

function computation(exit?: string, now = "2026-11-15") {
  return computeQuebecDeadlines({
    anchors: { schoolYear: "2026-2027", schoolExitDate: exit },
    now,
  });
}

function confirmed(requirementId: FamilySubmission["requirementId"]) {
  return {
    id: "sub-1",
    familyId: "demo-family",
    childId: "demo-child",
    jurisdiction: "quebec",
    schoolYearId: "2026-2027",
    requirementId,
    requirementDefinitionVersion: 1,
    status: "confirmed",
    recipientStates: [],
    fieldValues: {},
    evidenceIds: [],
    ministryFinding: "none",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  } satisfies FamilySubmission;
}

describe("urgent selection", () => {
  it("surfaces the 10-day clock ahead of the 30-day one", () => {
    const result = computation("2026-11-14");
    expect(selectUrgentDeadline(result, [])?.requirementId).toBe(
      "avis-declaration",
    );
    expect(selectSecondDeadline(result, [])?.requirementId).toBe(
      "projet-apprentissage",
    );
  });

  it("drops an obligation the parent has already confirmed", () => {
    const result = computation("2026-11-14");
    const urgent = selectUrgentDeadline(result, [confirmed("avis-declaration")]);
    expect(urgent?.requirementId).not.toBe("avis-declaration");
  });

  it("ranks overdue ahead of merely due soon", () => {
    const urgent = selectUrgentDeadline(computation("2026-11-14", "2026-12-01"), []);
    expect(urgent?.urgency).toBe("overdue");
  });

  /**
   * Telling the school is common practice, not a regulatory duty, and it is
   * dated on the exit day itself — so it goes overdue immediately. It must
   * never displace the statutory notice and its 10-day clock.
   */
  it("never lets an optional practice item displace a statutory one", () => {
    const result = computation("2026-11-14");
    const urgent = selectUrgentDeadline(result, []);
    expect(urgent?.applicability).toBe("required");
    expect(urgent?.legal.basis).toBe("regulation");
  });

  it("returns null when nothing applies", () => {
    const empty = computeQuebecDeadlines({
      anchors: { schoolYear: "bad" },
      now: "2026-11-15",
    });
    expect(selectUrgentDeadline(empty, [])).toBeNull();
  });
});

describe("joint follow-up group", () => {
  it("keeps the three obligations visible together", () => {
    expect(
      selectJointGroupDeadlines(computation(), "suivi-annuel"),
    ).toHaveLength(3);
  });

  it("detects the winter-exit divergence the UI has to warn about", () => {
    expect(hasJointGroupDivergence(computation("2027-02-10"), "suivi-annuel")).toBe(
      true,
    );
  });

  it("reports no divergence in the ordinary case", () => {
    expect(hasJointGroupDivergence(computation(), "suivi-annuel")).toBe(false);
  });
});
