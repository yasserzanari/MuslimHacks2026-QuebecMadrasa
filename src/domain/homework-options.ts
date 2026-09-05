import type { Locale } from "@/src/i18n/locale";

/**
 * Homework option catalogs — the vocabulary of the adult-facing tools.
 *
 * Kept apart from the validation schema so the browser can render the form (and the same
 * credit estimate the server will charge) without loading a validation library.
 */

export const SUBJECTS = [
  "mathematics",
  "french",
  "english",
  "science",
  "history",
  "geography",
  "arts",
  "islamic_studies",
  "other",
] as const;
export type Subject = (typeof SUBJECTS)[number];

/** Quebec school levels, kept as data because the ministry structure is versioned. */
export const LEVELS = [
  "prescolaire",
  "primaire-1",
  "primaire-2",
  "primaire-3",
  "primaire-4",
  "primaire-5",
  "primaire-6",
  "secondaire-1",
  "secondaire-2",
  "secondaire-3",
  "secondaire-4",
  "secondaire-5",
] as const;
export type Level = (typeof LEVELS)[number];

export const QUESTION_TYPES = [
  "multiple_choice",
  "short_answer",
  "problem_solving",
  "true_false",
  "matching",
  "written_response",
  "oral_practice",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const DIFFICULTIES = ["gentle", "standard", "challenge", "mixed"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Support needs the adult can request. Never inferred by the AI from child data. */
export const ACCOMMODATIONS = [
  "short_sentences",
  "reading_support",
  "visual_support",
  "extra_time",
  "step_by_step",
  "vocabulary_glossary",
] as const;
export type Accommodation = (typeof ACCOMMODATIONS)[number];

export const HOMEWORK_FORMATS = ["worksheet", "practice_set", "project", "revision", "quiz"] as const;
export type HomeworkFormat = (typeof HOMEWORK_FORMATS)[number];

export const MIN_QUESTIONS = 1;
export const MAX_QUESTIONS = 20;
export const MIN_MINUTES = 5;
export const MAX_MINUTES = 120;
export const MAX_FREE_TEXT = 600;

const MINUTES_PER_QUESTION: Record<QuestionType, number> = {
  multiple_choice: 1,
  true_false: 1,
  matching: 2,
  short_answer: 2,
  oral_practice: 3,
  problem_solving: 4,
  written_response: 8,
};

/** Cheapest plausible reading of the spec: the fastest question type it allows. */
export function minimumMinutesFor(spec: CreditableSpec): number {
  const perQuestion = Math.min(...spec.questionTypes.map((type) => MINUTES_PER_QUESTION[type]));
  return Math.max(MIN_MINUTES, perQuestion * spec.questionCount);
}

/**
 * Credits reserved when the job is created, and refunded if it fails.
 * Deterministic so the adult sees the same estimate before and after submitting.
 */
export function estimateCredits(spec: CreditableSpec): number {
  const base = spec.format === "project" ? 3 : 1;
  const perQuestion = Math.ceil(spec.questionCount / 5);
  const answerKey = spec.includeAnswerKey ? 1 : 0;
  return base + perQuestion + answerKey;
}

/** The subset of a specification that the pure helpers above need. */
export interface CreditableSpec {
  locale: Locale;
  format: HomeworkFormat;
  questionTypes: QuestionType[];
  questionCount: number;
  estimatedMinutes: number;
  includeAnswerKey: boolean;
}
