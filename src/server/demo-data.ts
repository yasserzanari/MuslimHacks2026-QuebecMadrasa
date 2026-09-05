import "server-only";

import type {
  ApprovedLesson,
  Child,
  Evidence,
  Family,
  LearningActivity,
  QuebecRequirement,
  StudentLesson,
} from "@/src/domain/learning-records";

/**
 * Demonstration data for the local slice.
 *
 * docs/architecture/04-securite-et-donnees.md: no real child record ever lands in a
 * fixture, a screenshot or a test. These families are invented, and the whole file is
 * `server-only` so nothing here can be imported into a browser bundle by accident.
 */

export const DEMO_FAMILY: Family = {
  id: "family-ghorbel",
  name: "Famille Ghorbel",
  locale: "fr",
  jurisdiction: "QC",
  schoolYear: "2026-2027",
  creditsAvailable: 40,
};

export const DEMO_PARENT_ID = "parent-amine";

export const DEMO_CHILDREN: Child[] = [
  {
    id: "child-adam",
    familyId: DEMO_FAMILY.id,
    displayName: "Adam",
    ageBand: "under_13",
    level: "primaire-5",
    permissions: { aiMayReadProgress: true, aiMayReadEvidence: true, voiceTutorEnabled: true },
  },
  {
    id: "child-sara",
    familyId: DEMO_FAMILY.id,
    displayName: "Sara",
    ageBand: "13_plus",
    level: "secondaire-3",
    permissions: { aiMayReadProgress: true, aiMayReadEvidence: false, voiceTutorEnabled: true },
  },
];

export const DEMO_ACTIVITIES: LearningActivity[] = [
  {
    id: "activity-1",
    childId: "child-adam",
    subject: "mathematics",
    title: "Fractions équivalentes",
    objectiveId: "obj-math-fractions",
    status: "done",
    minutes: 30,
    dueAt: "2026-09-02T13:00:00.000Z",
  },
  {
    id: "activity-2",
    childId: "child-adam",
    subject: "mathematics",
    title: "Comparer deux fractions",
    objectiveId: "obj-math-fractions",
    status: "in_progress",
    minutes: 25,
    dueAt: "2026-09-08T13:00:00.000Z",
  },
  {
    id: "activity-3",
    childId: "child-adam",
    subject: "french",
    title: "Lecture guidée",
    objectiveId: "obj-fr-lecture",
    status: "done",
    minutes: 40,
    dueAt: "2026-09-04T13:00:00.000Z",
  },
  {
    id: "activity-4",
    childId: "child-sara",
    subject: "science",
    title: "Projet — cycle de l'eau",
    objectiveId: "obj-sci-eau",
    status: "in_progress",
    minutes: 60,
    dueAt: "2026-09-11T13:00:00.000Z",
  },
];

export const DEMO_EVIDENCE: Evidence[] = [
  {
    id: "evidence-1",
    childId: "child-adam",
    skillId: "obj-math-fractions",
    type: "quiz",
    summary: "8 bonnes réponses sur 10 en fractions équivalentes.",
    source: "activity-1",
    visibility: "family",
    createdAt: "2026-09-02T14:00:00.000Z",
  },
  {
    id: "evidence-2",
    childId: "child-adam",
    skillId: "obj-fr-lecture",
    type: "observation",
    summary: "Lecture fluide, hésitation sur les mots longs.",
    source: "activity-3",
    visibility: "family",
    createdAt: "2026-09-04T14:00:00.000Z",
  },
];

export const DEMO_QUEBEC_REQUIREMENTS: QuebecRequirement[] = [
  {
    id: "qc-projet-apprentissage",
    schoolYear: "2026-2027",
    titleFr: "Projet d'apprentissage à transmettre",
    titleEn: "Learning project to submit",
    dueDate: "2026-09-30",
    sourceUrl: "https://www.quebec.ca/education/enseignement-a-la-maison",
    status: "in_progress",
  },
  {
    id: "qc-bilan-mi-parcours",
    schoolYear: "2026-2027",
    titleFr: "Bilan de mi-parcours",
    titleEn: "Mid-year progress report",
    dueDate: "2027-02-15",
    sourceUrl: "https://www.quebec.ca/education/enseignement-a-la-maison",
    status: "not_started",
  },
];

export const DEMO_APPROVED_LESSONS: ApprovedLesson[] = [
  {
    id: "lesson-fractions-base",
    subject: "mathematics",
    level: "primaire-5",
    titleFr: "Fractions : dénominateur commun",
    titleEn: "Fractions: common denominator",
    objectives: ["Trouver un dénominateur commun", "Comparer deux fractions"],
    approvedBy: DEMO_PARENT_ID,
    approvedAt: "2026-08-20T12:00:00.000Z",
  },
  {
    id: "lesson-lecture-argumentee",
    subject: "french",
    level: "secondaire-3",
    titleFr: "Lecture argumentée",
    titleEn: "Argumentative reading",
    objectives: ["Repérer une thèse", "Distinguer fait et opinion"],
    approvedBy: DEMO_PARENT_ID,
    approvedAt: "2026-08-22T12:00:00.000Z",
  },
  {
    id: "lesson-cycle-eau",
    subject: "science",
    level: "secondaire-3",
    titleFr: "Le cycle de l'eau",
    titleEn: "The water cycle",
    objectives: ["Nommer les étapes du cycle", "Expliquer l'évaporation"],
    approvedBy: DEMO_PARENT_ID,
    approvedAt: "2026-08-25T12:00:00.000Z",
  },
];

export function findChild(childId: string): Child | undefined {
  return DEMO_CHILDREN.find((child) => child.id === childId);
}

export function childrenOfFamily(familyId: string): Child[] {
  return DEMO_CHILDREN.filter((child) => child.familyId === familyId);
}

/**
 * One lesson that always exists, so the student experience and the browser QA scripts can
 * run before a parent has approved anything. Approved drafts add their own lessons.
 */
export const DEMO_LESSON: StudentLesson = {
  id: "demo-fractions",
  childId: "child-adam",
  documentId: "demo-document-fractions",
  subject: "mathematics",
  title: "Mathématiques — comparer deux fractions",
  goal: "Comparer deux fractions qui n'ont pas le même dénominateur.",
  estimatedMinutes: 25,
  locale: "fr",
  allowSolutionReveal: false,
  questions: [
    {
      id: "q1",
      lessonId: "demo-fractions",
      index: 0,
      type: "short_answer",
      prompt:
        "Question 1 — Laquelle est la plus grande : 3/4 ou 5/8 ? Explique comment tu le sais.",
      choices: [],
      hints: [
        "Regarde d'abord les dénominateurs : sont-ils les mêmes ?",
        "Quelle fraction équivalente à 3/4 a 8 comme dénominateur ?",
        "Avec 1/2 et 3/4, on met les deux sur 4 avant de comparer. Fais pareil ici.",
      ],
      objective: "Comparer deux fractions de dénominateurs différents",
    },
    {
      id: "q2",
      lessonId: "demo-fractions",
      index: 1,
      type: "multiple_choice",
      prompt: "Question 2 — Quelle fraction est équivalente à 2/3 ?",
      choices: ["4/6", "3/4", "2/6"],
      hints: [
        "Une fraction équivalente garde la même valeur.",
        "Que se passe-t-il si tu multiplies le haut et le bas par le même nombre ?",
        "Pour 1/2, multiplier par 3 en haut et en bas donne 3/6. Essaie la même idée.",
      ],
      objective: "Reconnaître des fractions équivalentes",
    },
    {
      id: "q3",
      lessonId: "demo-fractions",
      index: 2,
      type: "problem_solving",
      prompt:
        "Question 3 — Adam a mangé 2/5 d'une pizza, Sara en a mangé 3/10. Qui en a mangé le plus ?",
      choices: [],
      hints: [
        "Note ce que la question te donne : deux fractions et deux personnes.",
        "Peux-tu écrire 2/5 avec 10 comme dénominateur ?",
        "Sur un même dénominateur, comparer devient une comparaison de numérateurs.",
      ],
      objective: "Utiliser un dénominateur commun dans un problème",
    },
  ],
};
