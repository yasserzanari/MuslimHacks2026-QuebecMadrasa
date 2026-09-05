import { describe, expect, it } from "vitest";

import { computeQuebecDeadlines, parseSchoolYear } from "../quebec-deadlines";
import {
  DRAFT_WATERMARK,
  buildAvisDocuments,
  buildDraftExport,
  buildExportFilename,
  collectMissingFields,
  renderNoticeText,
  serializeDraftExportJson,
} from "../quebec-export";
import { getRequirement } from "../quebec-requirements";
import type { FieldValues } from "../quebec-export";

const NOW = "2026-11-15T12:00:00.000Z";

const COMPLETE: FieldValues = {
  childFullName: "Adam Ghorbel",
  childAddress: "12 rue des Érables, Montréal",
  childDateOfBirth: "2016-04-02",
  childPermanentCode: "GHOA16040212",
  parentOneFullName: "Amine Ghorbel",
  parentOneAddress: "12 rue des Érables, Montréal",
  parentTwoFullName: "Yasmine Ghorbel",
  parentTwoAddress: "12 rue des Érables, Montréal",
  schoolExitDate: "2026-11-14",
  schoolServiceCentreName: "Centre de services scolaire de Montréal",
};

describe("missing fields", () => {
  const fieldIds = getRequirement("avis-declaration").fieldIds;

  it("is empty when every art. 2 field is filled", () => {
    expect(collectMissingFields(COMPLETE, fieldIds)).toEqual([]);
  });

  it("names each blank field rather than dropping it", () => {
    const partial = { ...COMPLETE, childPermanentCode: "  " };
    expect(collectMissingFields(partial, fieldIds)).toEqual([
      "childPermanentCode",
    ]);
  });

  it("treats the second parent as required even when uninvolved", () => {
    const partial = { ...COMPLETE };
    delete partial.parentTwoAddress;
    expect(collectMissingFields(partial, fieldIds)).toContain(
      "parentTwoAddress",
    );
  });
});

describe("two-recipient notice (art. 3)", () => {
  it("produces two separately addressed drafts from one form", () => {
    const { minister, schoolServiceCentre } = buildAvisDocuments({
      fieldValues: COMPLETE,
      locale: "fr",
      now: NOW,
    });

    expect(minister.recipientId).toBe("ministre-dem");
    expect(schoolServiceCentre.recipientId).toBe("centre-de-services");
    expect(minister.addressee).not.toBe(schoolServiceCentre.addressee);
    expect(minister.channelNote).not.toBe(schoolServiceCentre.channelNote);
  });

  it("keeps the body identical across both recipients", () => {
    const { minister, schoolServiceCentre } = buildAvisDocuments({
      fieldValues: COMPLETE,
      locale: "fr",
      now: NOW,
    });
    expect(minister.bodyLines).toEqual(schoolServiceCentre.bodyLines);
  });

  it("cites art. 3 on both", () => {
    const { minister, schoolServiceCentre } = buildAvisDocuments({
      fieldValues: COMPLETE,
      locale: "fr",
      now: NOW,
    });
    expect(minister.legalCitation).toMatch(/art\. 2, 3/);
    expect(schoolServiceCentre.legalCitation).toBe(minister.legalCitation);
  });

  it("lists both parents", () => {
    const text = renderNoticeText(
      buildAvisDocuments({ fieldValues: COMPLETE, locale: "fr", now: NOW })
        .minister,
    );
    expect(text).toContain("Amine Ghorbel");
    expect(text).toContain("Yasmine Ghorbel");
  });

  it("reports missing fields on both drafts instead of silently omitting them", () => {
    const partial = { ...COMPLETE, childPermanentCode: "" };
    const { minister, schoolServiceCentre } = buildAvisDocuments({
      fieldValues: partial,
      locale: "fr",
      now: NOW,
    });
    expect(minister.missingFieldIds).toEqual(["childPermanentCode"]);
    expect(schoolServiceCentre.missingFieldIds).toEqual([
      "childPermanentCode",
    ]);
    expect(renderNoticeText(minister)).toContain("[à compléter]");
  });

  it("carries the draft watermark in both languages", () => {
    const fr = buildAvisDocuments({
      fieldValues: COMPLETE,
      locale: "fr",
      now: NOW,
    }).minister;
    const en = buildAvisDocuments({
      fieldValues: COMPLETE,
      locale: "en",
      now: NOW,
    }).minister;

    expect(fr.watermark).toBe(DRAFT_WATERMARK.fr);
    expect(en.watermark).toBe(DRAFT_WATERMARK.en);
    expect(fr.watermark).not.toBe(en.watermark);
    expect(renderNoticeText(fr).startsWith(DRAFT_WATERMARK.fr)).toBe(true);
  });
});

describe("draft export", () => {
  const schoolYear = parseSchoolYear("2026-2027")!;
  const { deadlines } = computeQuebecDeadlines({
    anchors: { schoolYear: "2026-2027", schoolExitDate: "2026-11-14" },
    now: "2026-11-15",
  });

  it("stamps the catalogue version and each requirement version", () => {
    const draft = buildDraftExport({
      schoolYear,
      deadlines,
      locale: "fr",
      now: NOW,
    });
    expect(draft.catalogueVersion).toBeTruthy();
    for (const entry of draft.deadlines) {
      expect(entry.requirementVersion).toBe(1);
    }
  });

  it("carries the source and verification date of every citation", () => {
    const draft = buildDraftExport({
      schoolYear,
      deadlines,
      locale: "fr",
      now: NOW,
    });
    for (const entry of draft.deadlines) {
      expect(entry.sourceUrl).toBeTruthy();
      expect(entry.legalVerifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(entry.primaryTextVerified).toBe(false);
    }
  });

  it("never claims the family is compliant", () => {
    for (const locale of ["fr", "en"] as const) {
      const json = serializeDraftExportJson(
        buildDraftExport({ schoolYear, deadlines, locale, now: NOW }),
      );
      expect(json).not.toMatch(/vous êtes conforme/i);
      expect(json).not.toMatch(/you are compliant/i);
      expect(json).not.toMatch(/\bconformité assurée\b/i);
    }
  });

  it("says plainly that nothing is filed for the parent", () => {
    const draft = buildDraftExport({
      schoolYear,
      deadlines,
      locale: "fr",
      now: NOW,
    });
    expect(draft.noFilingNotice).toMatch(/envoyer vous-même/);
    expect(draft.watermark).toBe(DRAFT_WATERMARK.fr);
  });

  it("names the file by school year and date", () => {
    expect(buildExportFilename("2026-2027", NOW)).toBe(
      "parcours-quebec-2026-2027-2026-11-15.json",
    );
  });
});
