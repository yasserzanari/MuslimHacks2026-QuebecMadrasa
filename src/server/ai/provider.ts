import "server-only";

import type { Locale } from "@/src/i18n/locale";
import type { HomeworkSpec } from "@/src/domain/ai-homework-spec";
import type { LessonBlock, PracticeQuestion, AnswerKeyEntry } from "@/src/domain/ai-homework-document";
import type { ApprovedLesson, HomeworkQuestionRecord } from "@/src/domain/learning-records";
import type { HelpLevel, InteractionMode, TutorNextAction } from "@/src/domain/ai-tutor-session";
import type { ToolAudience } from "@/src/domain/ai-tool-registry";

/**
 * The seam between the product and whichever AI service is configured.
 *
 * `AI_PROVIDER=mock` runs a deterministic generator with no network and no key — the
 * default in docs/architecture/01-stack-local.md. `AI_PROVIDER=anthropic` calls the real
 * API. Both live behind this interface so screens, the queue and the guardrails never
 * change when the provider does.
 */

/** Executes one authorized tool call on behalf of an agent. Supplied by the caller. */
export type ToolExecutor = (
  name: string,
  input: Record<string, unknown>,
) => Promise<unknown>;

export interface HomeworkDraft {
  title: string;
  levelLabel: string;
  objectives: string[];
  estimatedMinutes: number;
  lessonBlocks: LessonBlock[];
  practiceQuestions: PracticeQuestion[];
  answerKey: AnswerKeyEntry[];
  sourceIds: string[];
}

export interface HomeworkGenerationRequest {
  spec: HomeworkSpec;
  /** Lessons the family already approved; the only content the draft may cite. */
  approvedLessons: ApprovedLesson[];
  audience: ToolAudience;
  runTool: ToolExecutor;
}

export interface HomeworkGenerationResult {
  draft: HomeworkDraft;
  modelVersion: string;
  promptVersion: string;
}

export interface TutorReplyRequest {
  /** The language the student is reading the interface in. */
  locale: Locale;
  /** The language the homework itself was written in; may differ from `locale`. */
  contentLocale: Locale;
  lessonGoal: string;
  question: HomeworkQuestionRecord;
  studentMessage: string;
  /** What the student already tried, so the tutor does not repeat itself. */
  attempts: string[];
  hintsAlreadyGiven: HelpLevel[];
  /** Decided by the server, not by the model. */
  helpLevel: HelpLevel;
  ceiling: HelpLevel;
  nextAction: TutorNextAction;
  interactionMode: InteractionMode;
  audience: ToolAudience;
  runTool: ToolExecutor;
}

export interface TutorReplyResult {
  reply: string;
  modelVersion: string;
  promptVersion: string;
  /** Set when the model called `escalate_to_adult`. */
  escalated: boolean;
}

export interface AiProvider {
  readonly id: string;
  generateHomework(request: HomeworkGenerationRequest): Promise<HomeworkGenerationResult>;
  replyAsTutor(request: TutorReplyRequest): Promise<TutorReplyResult>;
}

/** The provider did not answer. Retryable: the job goes back to the queue. */
export class ProviderUnavailableError extends Error {
  readonly code = "provider_unavailable";
  constructor(message = "AI provider unavailable", options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ProviderUnavailableError";
  }
}

/** The provider answered with something unusable. Also retryable, but distinct. */
export class ProviderInvalidOutputError extends Error {
  readonly code = "provider_invalid_output";
  constructor(message = "AI provider returned unusable output") {
    super(message);
    this.name = "ProviderInvalidOutputError";
  }
}

export type ProviderId = "mock" | "anthropic";

export function configuredProviderId(): ProviderId {
  const raw = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  // Falling back to the mock is deliberate: a missing key must never take the app down,
  // and a developer must never be surprised by a real billed call.
  if (raw === "anthropic") {
    return process.env.ANTHROPIC_API_KEY ? "anthropic" : "mock";
  }
  return "mock";
}
