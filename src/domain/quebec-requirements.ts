/**
 * Catalogue versionné des exigences québécoises d'enseignement à la maison.
 *
 * Vérification légale — 2026-09-05. LégisQuébec et CanLII refusent l'accès
 * automatisé (HTTP 403), y compris l'URL citée dans
 * `docs/architecture/03-conformite-quebec.md`. Le fond a donc été confronté au
 * Guide d'accompagnement ministériel (26-140-01-3-ACC, éd. 2023), à
 * l'Échéancier officiel et à la page de démarche de quebec.ca.
 * `primaryTextVerified: false` sur chaque référence tant qu'une personne n'a
 * pas lu le texte réglementaire lui-même.
 */

import type {
  EvaluationModeDefinition,
  JointSatisfactionGroup,
  LegalReference,
  QuebecFieldSpec,
  Recipient,
  RequirementDefinition,
  RequirementId,
} from "./quebec-types";

/** Estampillée dans chaque export : indique le millésime de règles utilisé. */
export const QUEBEC_CATALOGUE_VERSION = "2026-09-05.1";

export const LEGAL_VERIFIED_ON = "2026-09-05";

const REGULATION_URL =
  "https://www.legisquebec.gouv.qc.ca/fr/document/rc/I-13.3%2C%20r.%206.01";
const ECHEANCIER_URL =
  "https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Echeancier-enseignement-maison.pdf";
const PROCEDURE_URL =
  "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes";

const INSTRUMENT =
  "Règlement sur l'enseignement à la maison (RLRQ, c. I-13.3, r. 6.01)";

function regulation(
  article: string,
  sourceProvenance: LegalReference["sourceProvenance"],
): LegalReference {
  return {
    basis: "regulation",
    instrument: INSTRUMENT,
    article,
    sourceUrl: REGULATION_URL,
    legalVerifiedOn: LEGAL_VERIFIED_ON,
    sourceProvenance,
    primaryTextVerified: false,
  };
}

/** Usage attendu par les centres de services, exigé par aucun article. */
const schoolPractice: LegalReference = {
  basis: "practice",
  instrument: "Usage des centres de services scolaires",
  article: null,
  sourceUrl: PROCEDURE_URL,
  legalVerifiedOn: LEGAL_VERIFIED_ON,
  sourceProvenance: ["quebec_ca_procedure"],
  primaryTextVerified: false,
};

export const quebecRecipients: readonly Recipient[] = [
  { id: "ministre-dem", basis: "regulation", channelKind: "secure_space" },
  {
    id: "centre-de-services",
    basis: "regulation",
    channelKind: "mail_or_email",
  },
  { id: "ecole", basis: "practice", channelKind: "school_office" },
];

/** Contenu de l'avis (art. 2). Les deux parents figurent, même si l'un n'est pas impliqué. */
export const quebecFieldSpecs: readonly QuebecFieldSpec[] = [
  { id: "childFullName", required: true, inputKind: "text" },
  { id: "childAddress", required: true, inputKind: "address" },
  { id: "childDateOfBirth", required: true, inputKind: "date" },
  { id: "childPermanentCode", required: true, inputKind: "permanent_code" },
  { id: "parentOneFullName", required: true, inputKind: "text" },
  { id: "parentOneAddress", required: true, inputKind: "address" },
  { id: "parentTwoFullName", required: true, inputKind: "text" },
  { id: "parentTwoAddress", required: true, inputKind: "address" },
  { id: "schoolExitDate", required: true, inputKind: "date" },
  { id: "schoolServiceCentreName", required: true, inputKind: "text" },
];

const avisFieldIds = quebecFieldSpecs.map((field) => field.id);

export const quebecJointSatisfactionGroups: readonly JointSatisfactionGroup[] =
  [
    {
      id: "suivi-annuel",
      requirementIds: [
        "rencontre-suivi",
        "bilan-mi-parcours",
        "etat-de-situation",
      ],
      ministryRecordName: "Dossier de suivi annuel",
      legal: {
        basis: "practice",
        instrument:
          "Guide d'accompagnement — Exigences en contexte d'enseignement à la maison (26-140-01-3-ACC)",
        article: null,
        sourceUrl:
          "https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Guide-exigences-enseignement-maison.pdf",
        legalVerifiedOn: LEGAL_VERIFIED_ON,
        sourceProvenance: ["ministry_guide"],
        primaryTextVerified: false,
      },
    },
  ];

export const quebecEvaluationModes: readonly EvaluationModeDefinition[] = [
  {
    id: "portfolio",
    legal: regulation("art. 15", ["ministry_guide", "ministry_echeancier"]),
    doesNotGrantDesUnits: false,
    conclusionRequirementId: "portfolio-evaluation",
  },
  {
    id: "epreuves-ministerielles",
    legal: regulation("art. 15.1", ["ministry_guide"]),
    inForceSince: "2021-2022",
    doesNotGrantDesUnits: true,
    conclusionRequirementId: "evaluation-autre",
  },
  {
    id: "evaluation-css",
    legal: regulation("art. 15", ["ministry_guide"]),
    doesNotGrantDesUnits: false,
    conclusionRequirementId: "evaluation-autre",
  },
  {
    id: "evaluation-personne-competente",
    legal: regulation("art. 15", ["ministry_guide"]),
    doesNotGrantDesUnits: false,
    conclusionRequirementId: "evaluation-autre",
  },
  {
    id: "autre-modalite-convenue",
    legal: regulation("art. 15", ["ministry_guide"]),
    doesNotGrantDesUnits: false,
    conclusionRequirementId: "evaluation-autre",
  },
];

export const quebecRequirements: readonly RequirementDefinition[] = [
  {
    id: "avis-declaration",
    jurisdiction: "quebec",
    version: 1,
    phase: "entry",
    order: 10,
    legal: regulation("art. 2, 3", [
      "quebec_ca_procedure",
      "ministry_echeancier",
      "ministry_guide",
    ]),
    uncertain: false,
    possibleRules: ["art3-annual-july-1", "art3-exit-10-days"],
    recipients: ["ministre-dem", "centre-de-services"],
    fieldIds: avisFieldIds,
  },
  {
    id: "avis-ecole",
    jurisdiction: "quebec",
    version: 1,
    phase: "entry",
    order: 20,
    legal: schoolPractice,
    uncertain: false,
    possibleRules: ["practice-inform-school-on-exit", "not-applicable"],
    recipients: ["ecole"],
    fieldIds: ["childFullName", "schoolExitDate", "schoolServiceCentreName"],
  },
  {
    id: "projet-apprentissage",
    jurisdiction: "quebec",
    version: 1,
    phase: "planning",
    order: 30,
    legal: regulation("art. 4, 5", [
      "quebec_ca_procedure",
      "ministry_echeancier",
    ]),
    uncertain: false,
    possibleRules: ["art5-annual-sept-30", "art5-exit-30-days"],
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
  {
    id: "projet-revise",
    jurisdiction: "quebec",
    version: 1,
    phase: "planning",
    order: 40,
    legal: regulation("art. 7", ["ministry_guide"]),
    uncertain: false,
    possibleRules: ["art7-project-resubmission-30-days", "not-applicable"],
    recipients: ["ministre-dem"],
    fieldIds: [],
    reactiveTo: {
      requirementIds: ["projet-apprentissage"],
      finding: "deficient",
    },
  },
  {
    id: "rencontre-suivi",
    jurisdiction: "quebec",
    version: 1,
    phase: "midyear",
    order: 50,
    legal: regulation("art. 12", ["ministry_guide", "ministry_echeancier"]),
    uncertain: false,
    possibleRules: ["art12-during-implementation"],
    jointGroupId: "suivi-annuel",
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
  {
    id: "etat-de-situation",
    jurisdiction: "quebec",
    version: 1,
    phase: "midyear",
    order: 60,
    legal: regulation("art. 11", ["ministry_echeancier", "ministry_guide"]),
    uncertain: false,
    possibleRules: [
      "art11-normal-window-3-5-months",
      "art11-exit-jan-to-mar-june-15",
      "art11-exit-after-mar-31-optional",
    ],
    jointGroupId: "suivi-annuel",
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
  {
    id: "bilan-mi-parcours",
    jurisdiction: "quebec",
    version: 1,
    phase: "midyear",
    order: 70,
    legal: regulation("art. 16", ["ministry_echeancier", "ministry_guide"]),
    uncertain: false,
    possibleRules: [
      "art16-midterm-window-3-5-months",
      "art16-midterm-optional-after-dec-31",
    ],
    jointGroupId: "suivi-annuel",
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
  {
    id: "bilan-fin",
    jurisdiction: "quebec",
    version: 1,
    phase: "closing",
    order: 80,
    legal: regulation("art. 16", ["ministry_echeancier", "ministry_guide"]),
    uncertain: false,
    possibleRules: ["art16-final-june-15"],
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
  {
    id: "bilan-revise",
    jurisdiction: "quebec",
    version: 1,
    phase: "closing",
    order: 90,
    legal: regulation("art. 17", ["ministry_guide"]),
    uncertain: false,
    possibleRules: ["art17-bilan-resubmission-30-days", "not-applicable"],
    recipients: ["ministre-dem"],
    fieldIds: [],
    reactiveTo: {
      requirementIds: ["bilan-mi-parcours", "bilan-fin"],
      finding: "deficient",
    },
  },
  {
    id: "portfolio-evaluation",
    jurisdiction: "quebec",
    version: 1,
    phase: "closing",
    order: 100,
    legal: regulation("art. 15", ["ministry_echeancier", "ministry_guide"]),
    uncertain: false,
    possibleRules: ["art15-portfolio-june-15", "not-applicable"],
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
  {
    id: "evaluation-autre",
    jurisdiction: "quebec",
    version: 1,
    phase: "closing",
    order: 110,
    legal: regulation("art. 15", ["ministry_echeancier"]),
    /**
     * Les sources divergent sur l'échéance des modes autres que le portfolio
     * (fin juin, parfois juillet selon le mode). L'interface affiche la date la
     * plus hâtive avec une réserve visible.
     */
    uncertain: true,
    possibleRules: ["art15-other-evaluation-june-30", "not-applicable"],
    recipients: ["ministre-dem"],
    fieldIds: [],
  },
];

const requirementsById = new Map<RequirementId, RequirementDefinition>(
  quebecRequirements.map((requirement) => [requirement.id, requirement]),
);

export function getRequirement(id: RequirementId): RequirementDefinition {
  const requirement = requirementsById.get(id);
  if (!requirement) throw new Error(`Unknown Quebec requirement: ${id}`);
  return requirement;
}

export function getRequirementsInOrder(): readonly RequirementDefinition[] {
  return [...quebecRequirements].sort((a, b) => a.order - b.order);
}
