import type { Locale } from "@/src/i18n/locale";
import type { HomeworkSpec, QuestionType } from "@/src/domain/ai-homework-spec";

/**
 * The generated draft.
 *
 * Shape follows docs/plan/services/11-assistant-ia-parent.md. It is a *draft*: it always
 * carries its objectives, its sources, the model version and `requiresParentReview`, and
 * nothing publishes it to a plan without a human decision.
 */

export interface LessonBlock {
  heading: string;
  body: string;
}

export interface PracticeQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  /** Only for multiple choice / matching; empty otherwise. */
  choices: string[];
  /** Progressive help, used by the student tutor before any answer is revealed. */
  hints: string[];
}

export interface AnswerKeyEntry {
  questionId: string;
  answer: string;
  reasoning: string;
}

/** Machine-checkable problems found in a draft, rendered in the reader's language. */
export interface DocumentWarning {
  code: string;
  /** Extra values interpolated into the localized message, e.g. counts. */
  values?: Record<string, string | number>;
}

export interface HomeworkDocument {
  id: string;
  jobId: string;
  locale: Locale;
  title: string;
  audience: "child";
  levelLabel: string;
  subject: string;
  objectives: string[];
  estimatedMinutes: number;
  lessonBlocks: LessonBlock[];
  practiceQuestions: PracticeQuestion[];
  answerKey: AnswerKeyEntry[];
  sourceIds: string[];
  warnings: DocumentWarning[];
  requiresParentReview: true;
  modelVersion: string;
  promptVersion: string;
  generatedAt: string;
}

/** Phrases a homework draft must never contain: they are decisions only a human makes. */
const FORBIDDEN_CLAIM_PATTERNS: Array<{ code: string; pattern: RegExp }> = [
  { code: "warningDiagnosisLanguage", pattern: /\b(dyslexi|dysorthograph|tdah|adhd|autis|diagnostic|diagnosis|trouble d'apprentissage|learning disorder)\w*/i },
  { code: "warningGradeClaim", pattern: /\b(a échoué|has failed|note finale|final grade|échec scolaire|failing grade)\b/i },
  { code: "warningLegalClaim", pattern: /\b(fatwa|obligation légale|legally required|le ministère exige|the ministry requires)\b/i },
];

/**
 * Checks a draft against the spec the adult submitted.
 *
 * This runs on the server after every generation, mock or real. It never rewrites the
 * draft: it attaches warnings so the reviewing adult sees exactly what is off before
 * approving. An empty list does not mean the content is correct — only that nothing
 * mechanically checkable is wrong.
 */
export function validateHomeworkDocument(
  document: Omit<HomeworkDocument, "warnings">,
  spec: HomeworkSpec,
): DocumentWarning[] {
  const warnings: DocumentWarning[] = [];

  if (document.practiceQuestions.length !== spec.questionCount) {
    warnings.push({
      code: "warningQuestionCountMismatch",
      values: { expected: spec.questionCount, actual: document.practiceQuestions.length },
    });
  }

  const unrequestedTypes = new Set(
    document.practiceQuestions
      .map((question) => question.type)
      .filter((type) => !spec.questionTypes.includes(type)),
  );
  if (unrequestedTypes.size > 0) {
    warnings.push({
      code: "warningUnrequestedQuestionType",
      values: { types: Array.from(unrequestedTypes).join(", ") },
    });
  }

  if (spec.includeAnswerKey) {
    const answered = new Set(document.answerKey.map((entry) => entry.questionId));
    const missing = document.practiceQuestions.filter((question) => !answered.has(question.id));
    if (missing.length > 0) {
      warnings.push({ code: "warningAnswerKeyIncomplete", values: { missing: missing.length } });
    }
  }

  if (document.objectives.length === 0) {
    warnings.push({ code: "warningNoObjective" });
  }

  if (document.sourceIds.length === 0) {
    warnings.push({ code: "warningNoSource" });
  }

  if (document.locale !== spec.locale) {
    warnings.push({ code: "warningLocaleMismatch", values: { expected: spec.locale } });
  }

  const emptyPrompts = document.practiceQuestions.filter((question) => !question.prompt.trim());
  if (emptyPrompts.length > 0) {
    warnings.push({ code: "warningEmptyQuestion", values: { count: emptyPrompts.length } });
  }

  const choiceless = document.practiceQuestions.filter(
    (question) =>
      (question.type === "multiple_choice" || question.type === "matching") &&
      question.choices.length < 2,
  );
  if (choiceless.length > 0) {
    warnings.push({ code: "warningMissingChoices", values: { count: choiceless.length } });
  }

  const haystack = [
    document.title,
    ...document.objectives,
    ...document.lessonBlocks.flatMap((block) => [block.heading, block.body]),
    ...document.practiceQuestions.map((question) => question.prompt),
    ...document.answerKey.map((entry) => `${entry.answer} ${entry.reasoning}`),
  ].join("\n");

  for (const { code, pattern } of FORBIDDEN_CLAIM_PATTERNS) {
    if (pattern.test(haystack)) warnings.push({ code });
  }

  return warnings;
}
