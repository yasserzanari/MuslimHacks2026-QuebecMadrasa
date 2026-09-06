/**
 * Dictionnaire FR/EN du module Parcours Québec.
 *
 * Aucune chaîne visible n'est codée dans un composant, y compris les
 * `aria-label`, les textes alternatifs et les états vides. Le type est dérivé
 * du dictionnaire français : une clé manquante en anglais est une erreur de
 * compilation, pas un texte qui s'affiche dans la mauvaise langue.
 */

import type {
  DeadlineAnchorKind,
  DeadlineApplicability,
  DeadlineReasonCode,
  DeadlineRuleId,
  DeadlineUrgency,
} from "../../src/domain/quebec-deadlines";
import type {
  EvaluationMode,
  Locale,
  QuebecFieldId,
  RecipientId,
  RequirementId,
  SubmissionStatus,
} from "../../src/domain/quebec-types";

const fr = {
  pageEyebrow: "Parcours Québec",
  pageTitle: "Quitter l'école pour l'enseignement à la maison",
  pageLead:
    "Chaque obligation de l'année, sa date, l'article qui la prévoit et un brouillon prêt à vérifier.",
  languageSwitchLabel: "Choisir la langue",
  profileName: "Famille Ghorbel",

  disclaimer:
    "Information générale de préparation et de suivi. Ce n'est pas un avis juridique, et la plateforme ne transmet rien au ministère à votre place.",
  verifiedOn: (date: string) => `Règles vérifiées le ${date}`,
  catalogueVersion: (version: string) => `Version du catalogue : ${version}`,
  primaryTextPending:
    "Textes réglementaires confirmés à partir des publications ministérielles. Une relecture du règlement lui-même reste à faire.",

  anchorsTitle: "Votre situation",
  anchorsLead: "Ces réponses déterminent toutes les dates de la page.",
  exitQuestion: "Votre enfant a-t-il déjà quitté l'école ?",
  exitNo: "Non, pas encore",
  exitYes: "Oui, à cette date",
  exitDateLabel: "Date de cessation de fréquentation scolaire",
  schoolYearLabel: "Année scolaire",
  implementationLabel: "Date de mise en œuvre du projet d'apprentissage",
  implementationHelp:
    "Laissée vide, nous utilisons l'échéance de l'article 5 (30 septembre, ou 30 jours après la sortie).",
  evaluationLabel: "Mode d'évaluation retenu",
  evaluationUnset: "Pas encore choisi",
  examsNoDesUnits:
    "La réussite d'une épreuve ministérielle en 4e ou 5e secondaire ne donne pas droit aux unités du diplôme d'études secondaires.",

  urgentTitle: "À faire en premier",
  urgentEmpty: "Aucune échéance active pour l'instant.",
  urgentEmptyHelp:
    "Indiquez votre situation ci-dessous pour voir vos obligations.",
  urgentSecondClock: (label: string, date: string) =>
    `Ensuite : ${label}, au plus tard le ${date}.`,
  daysRemaining: (days: number) => `Dans ${days} jour${days > 1 ? "s" : ""}`,
  daysOverdue: (days: number) =>
    `En retard de ${days} jour${days > 1 ? "s" : ""}`,
  dueToday: "Aujourd'hui",
  openAction: "Préparer ce document",

  timelineTitle: "Toutes les obligations de l'année",
  jointTitle: "Un seul point de suivi, trois obligations",
  jointLead:
    "Le ministère combine désormais la rencontre de suivi, le bilan de mi-parcours et l'état de situation en un même échange, principalement à l'oral. Les trois obligations restent distinctes et leurs dispenses ne se ressemblent pas.",
  jointRecord: (name: string) => `Suivi au ministère : ${name}`,
  jointDivergence:
    "Attention : dans votre situation, ces obligations n'ont pas le même statut.",

  avisTitle: "Générer l'avis de déclaration",
  avisLead:
    "L'article 3 exige que l'avis parvienne au ministre et au centre de services scolaire. Un seul formulaire produit les deux versions.",
  avisMissing: "Champs à compléter avant de télécharger",
  avisReady: "Tous les champs requis sont remplis.",
  permanentCodeHelp:
    "Le code permanent figure sur le bulletin de votre enfant ou dans son dossier scolaire.",
  parentTwoHelp:
    "Les coordonnées des deux parents sont demandées, même si l'un n'est pas impliqué au quotidien.",
  copyDocument: "Copier le texte",
  copied: "Copié",
  downloadDocument: "Télécharger le brouillon",

  schoolNoticeTitle: "Prévenir l'école",
  schoolNoticeLead:
    "Les centres de services s'attendent à être prévenus, mais aucun article du règlement ne l'exige.",

  projectTitle: "Projet d'apprentissage",
  projectLead:
    "Les matières couvertes sont fixées par l'article 4. Les champs manquants restent visibles, ils ne bloquent pas l'enregistrement.",
  projectSave: "Enregistrer le brouillon",
  projectSaved: "Brouillon enregistré localement",
  projectSubjects: [
    "Langue d'enseignement",
    "Langue seconde",
    "Mathématique",
    "Science et technologie",
    "Univers social",
  ],
  projectApproach: "Approche éducative choisie",
  projectActivities: "Description sommaire des activités",
  projectResources: "Ressources éducatives utilisées",
  projectTime: "Temps approximatif alloué",

  exportTitle: "Exporter le parcours",
  exportLead:
    "Un brouillon lisible et un JSON qui conserve la version des règles utilisées.",
  exportButton: "Télécharger le parcours (JSON)",

  statusTitle: "Où en êtes-vous ?",
  statusAdvance: "Marquer comme",

  issuesTitle: "À corriger",
  sourceLink: "Source officielle",
  articleLabel: (article: string) => `Article : ${article}`,
  practiceLabel: "Usage, pas une obligation réglementaire",
  uncertainLabel: "Date à confirmer auprès de votre centre de services",
  windowLabel: (from: string, to: string) => `Entre le ${from} et le ${to}`,
  dueLabel: (date: string) => `Au plus tard le ${date}`,
  noDateLabel: "Aucune date applicable",

  anchorSentence: {
    schoolYear: (value: string) => `Date fixée par l'année scolaire (${value}).`,
    schoolExitDate: (value: string) =>
      `Calculée à partir de la sortie de l'école du ${value}.`,
    projectImplementationDate: (value: string) =>
      `Calculée à partir de la mise en œuvre du ${value}.`,
    ministryResponseDate: (value: string) =>
      `Calculée à partir de la réponse du ministère du ${value}.`,
  } satisfies Record<DeadlineAnchorKind, (value: string) => string>,

  derivedFromArt5:
    "Estimation fondée sur l'échéance de l'article 5. Saisissez votre date réelle de mise en œuvre pour la préciser.",

  supersededSentence: (date: string) =>
    `La date habituelle du ${date} ne s'applique pas à votre situation.`,
  supersededNoDate:
    "La règle habituelle ne s'applique pas à votre situation.",

  requirement: {
    "avis-declaration": "Avis de déclaration",
    "avis-ecole": "Informer l'école",
    "projet-apprentissage": "Projet d'apprentissage",
    "projet-revise": "Projet révisé",
    "etat-de-situation": "État de situation",
    "bilan-mi-parcours": "Bilan de mi-parcours",
    "rencontre-suivi": "Rencontre de suivi",
    "bilan-fin": "Bilan de fin de projet",
    "portfolio-evaluation": "Portfolio soumis au ministre",
    "evaluation-autre": "Conclusions de l'évaluation",
    "bilan-revise": "Bilan révisé",
  } satisfies Record<RequirementId, string>,

  status: {
    todo: "À faire",
    draft: "En brouillon",
    parent_verified: "Vérifié par le parent",
    exported: "Exporté",
    manually_submitted: "Transmis manuellement",
    confirmed: "Confirmé",
  } satisfies Record<SubmissionStatus, string>,

  applicability: {
    required: "Obligatoire",
    optional: "Facultatif",
    not_applicable: "Ne s'applique pas",
    pending_input: "En attente d'une réponse de votre part",
  } satisfies Record<DeadlineApplicability, string>,

  urgency: {
    overdue: "En retard",
    due_soon: "Bientôt dû",
    window_open: "Fenêtre ouverte",
    upcoming: "À venir",
    window_closed: "Fenêtre fermée",
    not_scheduled: "Non planifié",
  } satisfies Record<DeadlineUrgency, string>,

  reason: {
    exit_after_march_31_optional:
      "Sortie après le 31 mars : l'état de situation devient facultatif.",
    ceased_attending_after_december_31_optional:
      "Cessation après le 31 décembre : le bilan de mi-parcours devient facultatif.",
    no_school_exit_recorded: "Aucune date de sortie enregistrée.",
    evaluation_mode_not_chosen:
      "Choisissez un mode d'évaluation pour dater cette obligation.",
    evaluation_mode_is_portfolio:
      "Vous avez retenu le portfolio : cette échéance ne s'applique pas.",
    evaluation_mode_is_not_portfolio:
      "Vous n'avez pas retenu le portfolio : cette échéance ne s'applique pas.",
    no_ministry_response_recorded:
      "Aucune réponse du ministère enregistrée. Ce délai n'existe pas encore.",
    ministry_finding_not_deficient:
      "Le ministère n'a pas jugé le document non conforme.",
  } satisfies Record<DeadlineReasonCode, string>,

  rule: {
    "art3-annual-july-1": "Avis annuel, au plus tard le 1er juillet",
    "art3-exit-10-days": "Avis dans les 10 jours suivant la sortie",
    "art5-annual-sept-30": "Projet au plus tard le 30 septembre",
    "art5-exit-30-days": "Projet dans les 30 jours suivant la sortie",
    "art11-normal-window-3-5-months":
      "Du 3e au 5e mois suivant la mise en œuvre",
    "art11-exit-jan-to-mar-june-15":
      "Sortie entre le 1er janvier et le 31 mars : au plus tard le 15 juin",
    "art11-exit-after-mar-31-optional": "Sortie après le 31 mars : facultatif",
    "art16-midterm-window-3-5-months":
      "Du 3e au 5e mois suivant la mise en œuvre",
    "art16-midterm-optional-after-dec-31":
      "Cessation après le 31 décembre : facultatif",
    "art12-during-implementation": "Pendant la mise en œuvre du projet",
    "art16-final-june-15": "Au plus tard le 15 juin",
    "art15-portfolio-june-15": "Portfolio au plus tard le 15 juin",
    "art15-other-evaluation-june-30":
      "Conclusions au plus tard le 30 juin",
    "art7-project-resubmission-30-days":
      "30 jours pour transmettre un projet révisé",
    "art17-bilan-resubmission-30-days":
      "30 jours pour transmettre un bilan révisé",
    "practice-inform-school-on-exit": "À faire au moment du départ",
    "not-applicable": "Sans objet",
  } satisfies Record<DeadlineRuleId, string>,

  recipient: {
    "ministre-dem":
      "Ministre — Direction de l'enseignement à la maison",
    "centre-de-services": "Centre de services scolaire",
    ecole: "École fréquentée",
  } satisfies Record<RecipientId, string>,

  field: {
    childFullName: "Nom de l'enfant",
    childAddress: "Adresse de l'enfant",
    childDateOfBirth: "Date de naissance",
    childPermanentCode: "Code permanent",
    parentOneFullName: "Nom du premier parent",
    parentOneAddress: "Adresse du premier parent",
    parentTwoFullName: "Nom du second parent",
    parentTwoAddress: "Adresse du second parent",
    schoolExitDate: "Date de cessation de fréquentation",
    schoolServiceCentreName: "Centre de services scolaire",
  } satisfies Record<QuebecFieldId, string>,

  evaluationMode: {
    portfolio: "Portfolio soumis au ministre",
    "epreuves-ministerielles": "Épreuves imposées par le ministre",
    "evaluation-css": "Évaluation par le centre de services scolaire",
    "evaluation-personne-competente":
      "Évaluation par une personne titulaire d'une autorisation d'enseigner",
    "autre-modalite-convenue": "Autre modalité convenue",
  } satisfies Record<EvaluationMode, string>,

  issue: {
    invalid_school_year_id: "Année scolaire invalide.",
    invalid_iso_date: "Date invalide.",
    exit_date_after_school_year_end:
      "La date de sortie dépasse la fin de l'année scolaire choisie.",
    implementation_before_exit:
      "La mise en œuvre précède la sortie de l'école.",
  },

  sidebar: {
    section: "Famille",
    privacy:
      "Votre espace reste privé. Les contenus générés par l'IA nécessitent votre validation.",
    logoAlt: "Madrasa Québec Network",
  },
};

export type QuebecDictionary = typeof fr;

const en: QuebecDictionary = {
  pageEyebrow: "Quebec pathway",
  pageTitle: "Leaving school for homeschooling",
  pageLead:
    "Every obligation for the year, its date, the article behind it, and a draft ready for you to check.",
  languageSwitchLabel: "Choose language",
  profileName: "Ghorbel family",

  disclaimer:
    "General preparation and tracking information. This is not legal advice, and the platform never files anything with the ministry on your behalf.",
  verifiedOn: (date: string) => `Rules verified on ${date}`,
  catalogueVersion: (version: string) => `Catalogue version: ${version}`,
  primaryTextPending:
    "Regulatory text confirmed from ministry publications. A reading of the regulation itself is still outstanding.",

  anchorsTitle: "Your situation",
  anchorsLead: "These answers determine every date on this page.",
  exitQuestion: "Has your child already left school?",
  exitNo: "No, not yet",
  exitYes: "Yes, on this date",
  exitDateLabel: "Date attendance ceased",
  schoolYearLabel: "School year",
  implementationLabel: "Date the learning project was implemented",
  implementationHelp:
    "Left blank, we use the article 5 deadline (30 September, or 30 days after leaving).",
  evaluationLabel: "Chosen evaluation mode",
  evaluationUnset: "Not chosen yet",
  examsNoDesUnits:
    "Passing a ministerial examination in Secondary 4 or 5 does not grant units toward the secondary school diploma.",

  urgentTitle: "Do this first",
  urgentEmpty: "No active deadline right now.",
  urgentEmptyHelp: "Tell us your situation below to see your obligations.",
  urgentSecondClock: (label: string, date: string) =>
    `Next: ${label}, due ${date}.`,
  daysRemaining: (days: number) => `In ${days} day${days > 1 ? "s" : ""}`,
  daysOverdue: (days: number) => `${days} day${days > 1 ? "s" : ""} overdue`,
  dueToday: "Today",
  openAction: "Prepare this document",

  timelineTitle: "Every obligation this year",
  jointTitle: "One checkpoint, three obligations",
  jointLead:
    "The ministry now combines the follow-up meeting, the mid-course review and the status report into a single, mainly oral exchange. The three obligations stay distinct, and their exemptions do not match.",
  jointRecord: (name: string) => `Ministry record: ${name}`,
  jointDivergence:
    "Careful: in your situation these obligations do not share the same status.",

  avisTitle: "Generate the notice of declaration",
  avisLead:
    "Article 3 requires the notice to reach both the Minister and the school service centre. One form produces both versions.",
  avisMissing: "Fields to complete before downloading",
  avisReady: "Every required field is filled in.",
  permanentCodeHelp:
    "The permanent code appears on your child's report card or in their school record.",
  parentTwoHelp:
    "Both parents' details are required, even if one is not involved day to day.",
  copyDocument: "Copy the text",
  copied: "Copied",
  downloadDocument: "Download the draft",

  schoolNoticeTitle: "Tell the school",
  schoolNoticeLead:
    "School service centres expect to be told, but no article of the regulation requires it.",

  projectTitle: "Learning project",
  projectLead:
    "The subjects covered are set by article 4. Missing fields stay visible; they do not block saving.",
  projectSave: "Save the draft",
  projectSaved: "Draft saved locally",
  projectSubjects: [
    "Language of instruction",
    "Second language",
    "Mathematics",
    "Science and technology",
    "Social sciences",
  ],
  projectApproach: "Chosen educational approach",
  projectActivities: "Summary of the activities",
  projectResources: "Educational resources used",
  projectTime: "Approximate time allotted",

  exportTitle: "Export the pathway",
  exportLead:
    "A readable draft and a JSON file that records which version of the rules produced it.",
  exportButton: "Download the pathway (JSON)",

  statusTitle: "Where do you stand?",
  statusAdvance: "Mark as",

  issuesTitle: "To correct",
  sourceLink: "Official source",
  articleLabel: (article: string) => `Article: ${article}`,
  practiceLabel: "Common practice, not a regulatory obligation",
  uncertainLabel: "Date to confirm with your school service centre",
  windowLabel: (from: string, to: string) => `Between ${from} and ${to}`,
  dueLabel: (date: string) => `No later than ${date}`,
  noDateLabel: "No applicable date",

  anchorSentence: {
    schoolYear: (value: string) => `Date set by the school year (${value}).`,
    schoolExitDate: (value: string) =>
      `Calculated from leaving school on ${value}.`,
    projectImplementationDate: (value: string) =>
      `Calculated from implementation on ${value}.`,
    ministryResponseDate: (value: string) =>
      `Calculated from the ministry's response on ${value}.`,
  },

  derivedFromArt5:
    "Estimated from the article 5 deadline. Enter your real implementation date to firm it up.",

  supersededSentence: (date: string) =>
    `The usual ${date} date does not apply to your situation.`,
  supersededNoDate: "The usual rule does not apply to your situation.",

  requirement: {
    "avis-declaration": "Notice of declaration",
    "avis-ecole": "Tell the school",
    "projet-apprentissage": "Learning project",
    "projet-revise": "Revised project",
    "etat-de-situation": "Status report",
    "bilan-mi-parcours": "Mid-course review",
    "rencontre-suivi": "Follow-up meeting",
    "bilan-fin": "End-of-project review",
    "portfolio-evaluation": "Portfolio submitted to the Minister",
    "evaluation-autre": "Evaluation conclusions",
    "bilan-revise": "Revised review",
  },

  status: {
    todo: "To do",
    draft: "Draft",
    parent_verified: "Verified by the parent",
    exported: "Exported",
    manually_submitted: "Sent manually",
    confirmed: "Confirmed",
  },

  applicability: {
    required: "Required",
    optional: "Optional",
    not_applicable: "Does not apply",
    pending_input: "Waiting on an answer from you",
  },

  urgency: {
    overdue: "Overdue",
    due_soon: "Due soon",
    window_open: "Window open",
    upcoming: "Upcoming",
    window_closed: "Window closed",
    not_scheduled: "Not scheduled",
  },

  reason: {
    exit_after_march_31_optional:
      "Left after 31 March: the status report becomes optional.",
    ceased_attending_after_december_31_optional:
      "Ceased attending after 31 December: the mid-course review becomes optional.",
    no_school_exit_recorded: "No exit date recorded.",
    evaluation_mode_not_chosen:
      "Choose an evaluation mode to date this obligation.",
    evaluation_mode_is_portfolio:
      "You chose the portfolio: this deadline does not apply.",
    evaluation_mode_is_not_portfolio:
      "You did not choose the portfolio: this deadline does not apply.",
    no_ministry_response_recorded:
      "No ministry response recorded. This deadline does not exist yet.",
    ministry_finding_not_deficient:
      "The ministry did not find the document deficient.",
  },

  rule: {
    "art3-annual-july-1": "Annual notice, no later than 1 July",
    "art3-exit-10-days": "Notice within 10 days of leaving",
    "art5-annual-sept-30": "Project no later than 30 September",
    "art5-exit-30-days": "Project within 30 days of leaving",
    "art11-normal-window-3-5-months":
      "Between the 3rd and 5th month after implementation",
    "art11-exit-jan-to-mar-june-15":
      "Left between 1 January and 31 March: no later than 15 June",
    "art11-exit-after-mar-31-optional": "Left after 31 March: optional",
    "art16-midterm-window-3-5-months":
      "Between the 3rd and 5th month after implementation",
    "art16-midterm-optional-after-dec-31":
      "Ceased attending after 31 December: optional",
    "art12-during-implementation": "During the project's implementation",
    "art16-final-june-15": "No later than 15 June",
    "art15-portfolio-june-15": "Portfolio no later than 15 June",
    "art15-other-evaluation-june-30": "Conclusions no later than 30 June",
    "art7-project-resubmission-30-days":
      "30 days to send a revised project",
    "art17-bilan-resubmission-30-days": "30 days to send a revised review",
    "practice-inform-school-on-exit": "To do when the child leaves",
    "not-applicable": "Not applicable",
  },

  recipient: {
    "ministre-dem": "Minister — Homeschooling Directorate",
    "centre-de-services": "School service centre",
    ecole: "The school attended",
  },

  field: {
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

  evaluationMode: {
    portfolio: "Portfolio submitted to the Minister",
    "epreuves-ministerielles": "Examinations set by the Minister",
    "evaluation-css": "Evaluation by the school service centre",
    "evaluation-personne-competente":
      "Evaluation by a holder of a teaching authorization",
    "autre-modalite-convenue": "Another agreed arrangement",
  },

  issue: {
    invalid_school_year_id: "Invalid school year.",
    invalid_iso_date: "Invalid date.",
    exit_date_after_school_year_end:
      "The exit date falls after the end of the selected school year.",
    implementation_before_exit:
      "Implementation comes before leaving school.",
  },

  sidebar: {
    section: "Family",
    privacy:
      "Your space stays private. AI-generated content needs your approval.",
    logoAlt: "Madrasa Québec Network",
  },
};

export const quebecDictionaries: Record<Locale, QuebecDictionary> = { fr, en };

export function getQuebecDictionary(locale: Locale): QuebecDictionary {
  return quebecDictionaries[locale];
}
