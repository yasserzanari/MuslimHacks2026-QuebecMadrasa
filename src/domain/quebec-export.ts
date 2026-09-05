/**
 * Génération de brouillons — fonctions pures.
 *
 * Rien n'est transmis à un système gouvernemental. Chaque document produit ici
 * est un brouillon que le parent envoie lui-même, et porte la mention de
 * vérification parentale.
 */

import {
  QUEBEC_CATALOGUE_VERSION,
  getRequirement,
  quebecFieldSpecs,
} from "./quebec-requirements";
import type { ResolvedDeadline } from "./quebec-deadlines";
import type {
  IsoInstant,
  Locale,
  QuebecFieldId,
  RecipientId,
  SchoolYear,
} from "./quebec-types";

/** Mention obligatoire, présente à l'écran et dans le fichier exporté. */
export const DRAFT_WATERMARK: Record<Locale, string> = {
  fr: "Brouillon préparé avec l'aide de la plateforme — vérification parentale requise",
  en: "Draft prepared with the help of the platform — parental verification required",
};

/** Rappel que la plateforme n'atteste rien et ne dépose rien. */
export const NO_FILING_NOTICE: Record<Locale, string> = {
  fr: "Ce document n'est pas transmis au ministère. Vous devez l'envoyer vous-même.",
  en: "This document is not sent to the ministry. You must send it yourself.",
};

export type FieldValues = Partial<Record<QuebecFieldId, string>>;

export function collectMissingFields(
  values: FieldValues,
  fieldIds: readonly QuebecFieldId[],
): readonly QuebecFieldId[] {
  const required = new Set(
    quebecFieldSpecs
      .filter((field) => field.required)
      .map((field) => field.id),
  );
  return fieldIds.filter(
    (id) => required.has(id) && (values[id] ?? "").trim() === "",
  );
}

export interface NoticeDocument {
  recipientId: RecipientId;
  locale: Locale;
  subject: string;
  addressee: string;
  bodyLines: readonly string[];
  channelNote: string;
  legalCitation: string;
  watermark: string;
  noFilingNotice: string;
  generatedAt: IsoInstant;
  missingFieldIds: readonly QuebecFieldId[];
}

const ADDRESSEES: Record<Locale, Record<"ministre-dem" | "centre-de-services", string>> = {
  fr: {
    "ministre-dem":
      "Ministre de l'Éducation — Direction de l'enseignement à la maison",
    "centre-de-services":
      "Centre de services scolaire ou commission scolaire dont relève l'enfant",
  },
  en: {
    "ministre-dem":
      "Minister of Education — Homeschooling Directorate (DEM)",
    "centre-de-services":
      "The school service centre or school board the child belongs to",
  },
};

const CHANNEL_NOTES: Record<Locale, Record<"ministre-dem" | "centre-de-services", string>> = {
  fr: {
    "ministre-dem":
      "À déposer dans l'espace sécurisé de l'enseignement à la maison, sur Québec.ca.",
    "centre-de-services":
      "À transmettre directement au centre de services scolaire, par la voie qu'il indique.",
  },
  en: {
    "ministre-dem":
      "To be filed in the homeschooling secure space on Québec.ca.",
    "centre-de-services":
      "To be sent directly to the school service centre, by the channel it specifies.",
  },
};

const SUBJECTS: Record<Locale, string> = {
  fr: "Avis de déclaration — enseignement à la maison",
  en: "Notice of declaration — homeschooling",
};

const FIELD_LABELS: Record<Locale, Record<QuebecFieldId, string>> = {
  fr: {
    childFullName: "Nom de l'enfant",
    childAddress: "Adresse de l'enfant",
    childDateOfBirth: "Date de naissance",
    childPermanentCode: "Code permanent",
    parentOneFullName: "Nom du premier parent",
    parentOneAddress: "Adresse du premier parent",
    parentTwoFullName: "Nom du second parent",
    parentTwoAddress: "Adresse du second parent",
    schoolExitDate: "Date de cessation de fréquentation scolaire",
    schoolServiceCentreName: "Centre de services scolaire",
  },
  en: {
    childFullName: "Child's name",
    childAddress: "Child's address",
    childDateOfBirth: "Date of birth",
    childPermanentCode: "Permanent code",
    parentOneFullName: "First parent's name",
    parentOneAddress: "First parent's address",
    parentTwoFullName: "Second parent's name",
    parentTwoAddress: "Second parent's address",
    schoolExitDate: "Date attendance ceased",
    schoolServiceCentreName: "School service centre",
  },
};

const MISSING_PLACEHOLDER: Record<Locale, string> = {
  fr: "[à compléter]",
  en: "[to be completed]",
};

export function getFieldLabel(id: QuebecFieldId, locale: Locale): string {
  return FIELD_LABELS[locale][id];
}

function buildBodyLines(values: FieldValues, locale: Locale): readonly string[] {
  return quebecFieldSpecs.map((field) => {
    const value = (values[field.id] ?? "").trim();
    const shown = value === "" ? MISSING_PLACEHOLDER[locale] : value;
    return `${FIELD_LABELS[locale][field.id]} : ${shown}`;
  });
}

/**
 * L'art. 3 exige que l'avis soit transmis au ministre ET au centre de services
 * scolaire compétent. Un seul formulaire produit donc deux documents adressés
 * séparément — le corps est identique, seuls l'adresse et le canal changent.
 */
export function buildAvisDocuments(input: {
  fieldValues: FieldValues;
  locale: Locale;
  now: IsoInstant;
}): { minister: NoticeDocument; schoolServiceCentre: NoticeDocument } {
  const requirement = getRequirement("avis-declaration");
  const { locale, fieldValues, now } = input;
  const bodyLines = buildBodyLines(fieldValues, locale);
  const missingFieldIds = collectMissingFields(
    fieldValues,
    requirement.fieldIds,
  );
  const legalCitation = `${requirement.legal.instrument}, ${requirement.legal.article}`;

  const base = {
    locale,
    subject: SUBJECTS[locale],
    bodyLines,
    legalCitation,
    watermark: DRAFT_WATERMARK[locale],
    noFilingNotice: NO_FILING_NOTICE[locale],
    generatedAt: now,
    missingFieldIds,
  };

  return {
    minister: {
      ...base,
      recipientId: "ministre-dem",
      addressee: ADDRESSEES[locale]["ministre-dem"],
      channelNote: CHANNEL_NOTES[locale]["ministre-dem"],
    },
    schoolServiceCentre: {
      ...base,
      recipientId: "centre-de-services",
      addressee: ADDRESSEES[locale]["centre-de-services"],
      channelNote: CHANNEL_NOTES[locale]["centre-de-services"],
    },
  };
}

export function renderNoticeText(document: NoticeDocument): string {
  return [
    document.watermark,
    "",
    document.subject,
    document.addressee,
    "",
    ...document.bodyLines,
    "",
    document.channelNote,
    document.noFilingNotice,
    "",
    document.legalCitation,
  ].join("\n");
}

/* ------------------------------------------------------------------ *
 * Export du parcours complet.
 * ------------------------------------------------------------------ */

export interface DraftExport {
  kind: "quebec-parcours-draft";
  catalogueVersion: string;
  locale: Locale;
  generatedAt: IsoInstant;
  schoolYearId: string;
  watermark: string;
  noFilingNotice: string;
  /** La plateforme n'atteste jamais la conformité. */
  disclaimer: string;
  deadlines: readonly {
    requirementId: string;
    requirementVersion: number;
    ruleId: string;
    applicability: string;
    dueOn: string | null;
    window: { opensOn: string; closesOn: string } | null;
    anchor: string;
    anchorValue: string | null;
    anchorDerivation: string;
    legalInstrument: string;
    legalArticle: string | null;
    sourceUrl: string;
    legalVerifiedOn: string;
    primaryTextVerified: boolean;
    uncertain: boolean;
  }[];
}

const DISCLAIMER: Record<Locale, string> = {
  fr: "Information générale de préparation et de suivi. Ce document n'est pas un avis juridique et n'atteste rien auprès du ministère. Vérifiez toujours votre situation auprès des sources officielles.",
  en: "General preparation and tracking information. This document is not legal advice and certifies nothing to the ministry. Always verify your situation with the official sources.",
};

export function buildDraftExport(input: {
  schoolYear: SchoolYear;
  deadlines: readonly ResolvedDeadline[];
  locale: Locale;
  now: IsoInstant;
}): DraftExport {
  const { schoolYear, deadlines, locale, now } = input;
  return {
    kind: "quebec-parcours-draft",
    catalogueVersion: QUEBEC_CATALOGUE_VERSION,
    locale,
    generatedAt: now,
    schoolYearId: schoolYear.id,
    watermark: DRAFT_WATERMARK[locale],
    noFilingNotice: NO_FILING_NOTICE[locale],
    disclaimer: DISCLAIMER[locale],
    deadlines: deadlines.map((deadline) => ({
      requirementId: deadline.requirementId,
      requirementVersion: deadline.requirementVersion,
      ruleId: deadline.ruleId,
      applicability: deadline.applicability,
      dueOn: deadline.dueOn,
      window: deadline.window,
      anchor: deadline.anchor,
      anchorValue: deadline.anchorValue,
      anchorDerivation: deadline.anchorDerivation,
      legalInstrument: deadline.legal.instrument,
      legalArticle: deadline.legal.article,
      sourceUrl: deadline.legal.sourceUrl,
      legalVerifiedOn: deadline.legal.legalVerifiedOn,
      primaryTextVerified: deadline.legal.primaryTextVerified,
      uncertain: deadline.uncertain,
    })),
  };
}

export function serializeDraftExportJson(draft: DraftExport): string {
  return JSON.stringify(draft, null, 2);
}

export function buildExportFilename(
  schoolYearId: string,
  now: IsoInstant,
): string {
  return `parcours-quebec-${schoolYearId}-${now.slice(0, 10)}.json`;
}
