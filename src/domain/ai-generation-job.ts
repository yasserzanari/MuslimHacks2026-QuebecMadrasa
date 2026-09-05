import type { Locale } from "@/src/i18n/locale";
import type { HomeworkSpec } from "@/src/domain/ai-homework-spec";

/**
 * Generation job — the controlled queue between an adult's request and any AI output.
 *
 * Rules from docs/plan/services/11-assistant-ia-parent.md:
 *   - one request creates one job, made idempotent by `requestId`;
 *   - credits are reserved on creation and refunded when the job fails;
 *   - three attempts maximum, then `failed` with a code the adult can understand;
 *   - nothing reaches a child's plan without a human approval.
 */

export type GenerationJobType = "lesson" | "exercises" | "weekly_report" | "explanation";

export type GenerationJobStatus =
  | "queued"
  | "running"
  | "review_required"
  | "approved"
  | "rejected"
  | "failed"
  | "cancelled";

export type GenerationJobPriority = "normal" | "low";

export const MAX_ATTEMPTS = 3;

export interface GenerationJob {
  id: string;
  requestId: string;
  parentId: string;
  childId?: string;
  /** Which adult asked: a parent, a private tutor or a group educator. */
  requestedByRole: "parent" | "tutor" | "educator";
  type: GenerationJobType;
  locale: Locale;
  requestText: string;
  /** Present for homework-shaped jobs; absent for a free-text explanation. */
  spec?: HomeworkSpec;
  status: GenerationJobStatus;
  priority: GenerationJobPriority;
  sourceSnapshotIds: string[];
  creditsReserved: number;
  creditsRefunded: number;
  attemptCount: number;
  outputDocumentId?: string;
  errorCode?: string;
  modelVersion?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  approvedBy?: string;
  decisionNote?: string;
}

const TERMINAL_STATUSES = new Set<GenerationJobStatus>([
  "approved",
  "rejected",
  "failed",
  "cancelled",
]);

const TRANSITIONS: Record<GenerationJobStatus, GenerationJobStatus[]> = {
  // `running -> queued` is the retry path: an attempt failed but budget remains.
  queued: ["running", "cancelled"],
  running: ["review_required", "failed", "cancelled", "queued"],
  review_required: ["approved", "rejected"],
  approved: [],
  rejected: [],
  failed: [],
  cancelled: [],
};

export function isTerminal(status: GenerationJobStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function canTransition(from: GenerationJobStatus, to: GenerationJobStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function transitionJob(
  job: GenerationJob,
  nextStatus: GenerationJobStatus,
  now = new Date().toISOString(),
): GenerationJob {
  if (isTerminal(job.status)) {
    throw new Error(`Job ${job.id} is already final`);
  }
  if (!canTransition(job.status, nextStatus)) {
    throw new Error(`Invalid transition: ${job.status} -> ${nextStatus}`);
  }

  return {
    ...job,
    status: nextStatus,
    startedAt: nextStatus === "running" ? now : job.startedAt,
    completedAt: isTerminal(nextStatus) ? now : job.completedAt,
    // A failed or cancelled job must not keep the family's credits.
    creditsRefunded:
      nextStatus === "failed" || nextStatus === "cancelled"
        ? job.creditsReserved
        : job.creditsRefunded,
  };
}

export function createGenerationJob(input: {
  id: string;
  requestId: string;
  parentId: string;
  childId?: string;
  requestedByRole?: GenerationJob["requestedByRole"];
  type: GenerationJobType;
  locale: Locale;
  requestText: string;
  spec?: HomeworkSpec;
  priority?: GenerationJobPriority;
  sourceSnapshotIds?: string[];
  creditsReserved: number;
  now?: string;
}): GenerationJob {
  if (!input.requestText.trim()) throw new Error("Request text is required");
  if (input.creditsReserved <= 0) throw new Error("Credits must be positive");

  return {
    id: input.id,
    requestId: input.requestId,
    parentId: input.parentId,
    childId: input.childId,
    requestedByRole: input.requestedByRole ?? "parent",
    type: input.type,
    locale: input.locale,
    requestText: input.requestText.trim(),
    spec: input.spec,
    status: "queued",
    // A weekly report is heavy and nobody is waiting on it; homework is.
    priority: input.priority ?? (input.type === "weekly_report" ? "low" : "normal"),
    sourceSnapshotIds: input.sourceSnapshotIds ?? [],
    creditsReserved: input.creditsReserved,
    creditsRefunded: 0,
    attemptCount: 0,
    createdAt: input.now ?? new Date().toISOString(),
  };
}

export function startAttempt(job: GenerationJob, now = new Date().toISOString()): GenerationJob {
  const running = transitionJob(job, "running", now);
  return { ...running, attemptCount: job.attemptCount + 1, errorCode: undefined };
}

/**
 * Records a failed attempt. Below the attempt ceiling the job goes back to the queue;
 * at the ceiling it fails for good and the reserved credits are returned.
 */
export function failAttempt(
  job: GenerationJob,
  errorCode: string,
  now = new Date().toISOString(),
): GenerationJob {
  const exhausted = job.attemptCount >= MAX_ATTEMPTS;
  const next = transitionJob(job, exhausted ? "failed" : "queued", now);
  return { ...next, errorCode };
}

export function completeAttempt(
  job: GenerationJob,
  outputDocumentId: string,
  modelVersion: string,
  now = new Date().toISOString(),
): GenerationJob {
  const next = transitionJob(job, "review_required", now);
  return { ...next, outputDocumentId, modelVersion, errorCode: undefined };
}

export function decideJob(
  job: GenerationJob,
  decision: "approved" | "rejected",
  decidedBy: string,
  note?: string,
  now = new Date().toISOString(),
): GenerationJob {
  const next = transitionJob(job, decision, now);
  return { ...next, approvedBy: decidedBy, decisionNote: note?.trim() || undefined };
}

/** Waiting work first, then oldest first — a queue an adult can predict. */
export function compareQueueOrder(a: GenerationJob, b: GenerationJob): number {
  if (a.priority !== b.priority) return a.priority === "normal" ? -1 : 1;
  return a.createdAt.localeCompare(b.createdAt);
}
