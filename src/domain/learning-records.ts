import type { Locale } from "@/src/i18n/locale";
import type { Level, QuestionType, Subject } from "@/src/domain/homework-options";

/**
 * Shared data contracts.
 *
 * docs/architecture/07-plan-maitre-pages-et-qa.md forbids each page inventing its own
 * shape for the same object. Everything below is read through an adapter — a mock today,
 * SQLite/PostgreSQL later — and never fetched directly from a component.
 */

export interface Family {
  id: string;
  name: string;
  locale: Locale;
  jurisdiction: "QC";
  schoolYear: string;
  /** Generation credits left for the family this month. */
  creditsAvailable: number;
}

export interface Child {
  id: string;
  familyId: string;
  displayName: string;
  ageBand: "under_13" | "13_plus";
  level: Level;
  /** What an AI agent is allowed to read about this child, granted by the parent. */
  permissions: {
    aiMayReadProgress: boolean;
    aiMayReadEvidence: boolean;
    voiceTutorEnabled: boolean;
  };
}

export interface LearningActivity {
  id: string;
  childId: string;
  subject: Subject;
  title: string;
  objectiveId: string;
  status: "planned" | "in_progress" | "done";
  minutes: number;
  dueAt: string;
}

export interface Evidence {
  id: string;
  childId: string;
  skillId: string;
  type: "photo" | "text" | "quiz" | "observation";
  summary: string;
  source: string;
  visibility: "family" | "tutor";
  createdAt: string;
}

export interface QuebecRequirement {
  id: string;
  schoolYear: string;
  titleFr: string;
  titleEn: string;
  dueDate: string;
  sourceUrl: string;
  status: "not_started" | "in_progress" | "submitted";
}

export interface ApprovedLesson {
  id: string;
  subject: Subject;
  level: Level;
  titleFr: string;
  titleEn: string;
  objectives: string[];
  approvedBy: string;
  approvedAt: string;
}

export interface LearningSnapshot {
  childId: string;
  /** Data window, so any statement can be dated. */
  fromDate: string;
  toDate: string;
  minutesLearned: number;
  activitiesCompleted: number;
  subjectsTouched: Subject[];
  /** Notions the child spent time on without completing; not a diagnosis. */
  notionsInProgress: string[];
  /** Empty when the family has recorded nothing: the agent must say so. */
  hasEnoughData: boolean;
}

export interface WeekPlan {
  childId: string;
  weekStart: string;
  activities: LearningActivity[];
  minutesPlanned: number;
  minutesAvailable: number;
}

/** One homework question as a student sees it, plus the help prepared for it. */
export interface HomeworkQuestionRecord {
  id: string;
  lessonId: string;
  index: number;
  type: QuestionType;
  prompt: string;
  choices: string[];
  hints: string[];
  objective: string;
}

export interface StudentLesson {
  id: string;
  childId: string;
  documentId: string;
  subject: Subject;
  title: string;
  goal: string;
  estimatedMinutes: number;
  locale: Locale;
  allowSolutionReveal: boolean;
  questions: HomeworkQuestionRecord[];
}
