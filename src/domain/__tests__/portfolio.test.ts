import { beforeEach, describe, expect, it } from "vitest";
import { addEvidence, commentEvidence, listAccessLog, listEvidence, removeEvidence, resetPortfolio, setVisibility, skillProgress } from "../portfolio";

describe("portfolio", () => {
  beforeEach(() => resetPortfolio());

  it("only returns the evidence of the child asked for", () => {
    const rows = listEvidence("adam");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((item) => item.childId === "adam")).toBe(true);
  });

  it("keeps new evidence private to the family by default", () => {
    const item = addEvidence({ childId: "adam", skillId: "math-fractions", type: "text", titleFr: "Dictée réussie" });
    expect(item.visibility).toBe("family");
    expect(item.source).toBe("parent_upload");
  });

  it("refuses evidence without a title or with an unknown skill", () => {
    expect(() => addEvidence({ childId: "adam", skillId: "math-fractions", type: "text", titleFr: "  " })).toThrow("title_required");
    expect(() => addEvidence({ childId: "adam", skillId: "inconnue", type: "text", titleFr: "Titre" })).toThrow("unknown_skill");
  });

  it("counts evidence per skill without inventing a grade", () => {
    const before = skillProgress("adam").find((row) => row.skill.id === "math-fractions")!.count;
    addEvidence({ childId: "adam", skillId: "math-fractions", type: "quiz", titleFr: "Deuxième essai" });
    expect(skillProgress("adam").find((row) => row.skill.id === "math-fractions")!.count).toBe(before + 1);
  });

  it("logs every read and write on the evidence", () => {
    const item = addEvidence({ childId: "sara", skillId: "fr-lecture", type: "text", titleFr: "Résumé" });
    commentEvidence(item.id, "Bien argumenté.");
    setVisibility(item.id, "shared_link");
    removeEvidence(item.id);

    const actions = listAccessLog().map((entry) => entry.action);
    expect(actions).toContain("add_evidence");
    expect(actions).toContain("comment_evidence");
    expect(actions).toContain("set_visibility:shared_link");
    expect(actions).toContain("delete_evidence");
  });

  it("refuses an empty comment and an unknown target", () => {
    const item = listEvidence("adam")[0];
    expect(() => commentEvidence(item.id, "   ")).toThrow("comment_required");
    expect(() => commentEvidence("ev-inexistante", "Bravo")).toThrow("evidence_not_found");
  });

  it("removes evidence for good", () => {
    const item = listEvidence("adam")[0];
    removeEvidence(item.id);
    expect(listEvidence("adam").some((row) => row.id === item.id)).toBe(false);
    expect(() => removeEvidence(item.id)).toThrow("evidence_not_found");
  });
});
