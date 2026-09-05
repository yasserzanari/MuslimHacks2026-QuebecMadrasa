import { z } from "zod";
import { LOCALES } from "@/src/i18n/locale";
import {
  ACCOMMODATIONS,
  DIFFICULTIES,
  HOMEWORK_FORMATS,
  LEVELS,
  MAX_FREE_TEXT,
  MAX_MINUTES,
  MAX_QUESTIONS,
  MIN_MINUTES,
  MIN_QUESTIONS,
  QUESTION_TYPES,
  SUBJECTS,
  minimumMinutesFor,
} from "@/src/domain/homework-options";

/**
 * Homework specification — the contract behind the adult-facing tools.
 *
 * A parent, a tutor or a group educator never prompts the model directly. They fill
 * these fields, the server turns them into a `generation_job`, and the job carries the
 * spec to the AI provider. Everything the model is allowed to decide is a field here;
 * everything it is not allowed to decide (child data access, publication, grading)
 * lives outside this file.
 *
 * The option catalogs and the credit estimate live in `homework-options.ts`, which the
 * form imports directly; this file owns the validation the server runs on every request.
 *
 * See docs/plan/services/11-assistant-ia-parent.md.
 */

// Re-exported so server code has one import for the whole contract.
export * from "@/src/domain/homework-options";

const trimmedText = (max: number) => z.string().trim().max(max);

export const homeworkSpecSchema = z.object({
  /** Who the homework is for. The server re-checks that this child belongs to the family. */
  childId: z.string().trim().min(1),
  locale: z.enum(LOCALES),
  subject: z.enum(SUBJECTS),
  level: z.enum(LEVELS),
  format: z.enum(HOMEWORK_FORMATS),
  /** The notion actually being worked on, e.g. "comparer deux fractions". */
  topic: trimmedText(160).min(3),
  /** Learning objectives written by the adult; the model may not invent extra ones. */
  objectives: z.array(trimmedText(200).min(3)).min(1).max(5),
  questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1).max(QUESTION_TYPES.length),
  questionCount: z.number().int().min(MIN_QUESTIONS).max(MAX_QUESTIONS),
  difficulty: z.enum(DIFFICULTIES),
  estimatedMinutes: z.number().int().min(MIN_MINUTES).max(MAX_MINUTES),
  accommodations: z.array(z.enum(ACCOMMODATIONS)).max(ACCOMMODATIONS.length).default([]),
  /** Real-life framing asked for by the adult, e.g. "une recette de famille". */
  context: trimmedText(MAX_FREE_TEXT).default(""),
  mustInclude: trimmedText(MAX_FREE_TEXT).default(""),
  mustAvoid: trimmedText(MAX_FREE_TEXT).default(""),
  includeAnswerKey: z.boolean().default(true),
  /** Whether the student tutor may eventually reveal a full worked solution. */
  allowSolutionReveal: z.boolean().default(false),
  /** Restrict the draft to lessons already approved by the family. */
  approvedSourcesOnly: z.boolean().default(true),
});

export type HomeworkSpec = z.infer<typeof homeworkSpecSchema>;

export interface HomeworkSpecIssue {
  field: string;
  /** Dictionary key, so the message is rendered in the reader's language. */
  messageKey: string;
}

export interface HomeworkSpecResult {
  ok: boolean;
  spec?: HomeworkSpec;
  issues: HomeworkSpecIssue[];
}

/**
 * Parses an untrusted payload into a spec.
 *
 * Issues are returned as dictionary keys rather than sentences: the same validation runs
 * for a French parent and an English tutor, and neither may see the other's language.
 */
export function parseHomeworkSpec(input: unknown): HomeworkSpecResult {
  const parsed = homeworkSpecSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "spec",
        messageKey: issueKeyFor(issue.path.join(".")),
      })),
    };
  }

  const spec = parsed.data;
  const issues: HomeworkSpecIssue[] = [];

  // A written response takes far longer than a true/false item: refuse a plan the
  // student cannot finish in the time the adult announced.
  if (spec.estimatedMinutes < minimumMinutesFor(spec)) {
    issues.push({ field: "estimatedMinutes", messageKey: "issueDurationTooShort" });
  }

  if (issues.length > 0) return { ok: false, issues };
  return { ok: true, spec, issues: [] };
}

function issueKeyFor(field: string): string {
  switch (field) {
    case "topic":
      return "issueTopicRequired";
    case "objectives":
      return "issueObjectivesRequired";
    case "questionTypes":
      return "issueQuestionTypesRequired";
    case "questionCount":
      return "issueQuestionCountRange";
    case "estimatedMinutes":
      return "issueDurationRange";
    case "childId":
      return "issueChildRequired";
    default:
      return "issueInvalidField";
  }
}
