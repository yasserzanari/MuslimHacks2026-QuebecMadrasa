export type GenerationJobType =
  | "lesson"
  | "exercises"
  | "weekly_report"
  | "explanation";

export type GenerationJobStatus =
  | "queued"
  | "running"
  | "review_required"
  | "approved"
  | "rejected"
  | "failed"
  | "cancelled";

export interface GenerationJob {
  id: string;
  requestId: string;
  parentId: string;
  childId?: string;
  type: GenerationJobType;
  requestText: string;
  status: GenerationJobStatus;
  sourceSnapshotIds: string[];
  creditsReserved: number;
  attemptCount: number;
  outputDocumentId?: string;
  errorCode?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  approvedBy?: string;
}

const terminalStatuses = new Set<GenerationJobStatus>([
  "approved",
  "rejected",
  "failed",
  "cancelled",
]);

const transitions: Record<GenerationJobStatus, GenerationJobStatus[]> = {
  queued: ["running", "cancelled"],
  running: ["review_required", "failed", "cancelled"],
  review_required: ["approved", "rejected"],
  approved: [],
  rejected: [],
  failed: [],
  cancelled: [],
};

export function canTransition(
  from: GenerationJobStatus,
  to: GenerationJobStatus,
): boolean {
  // A status can reach this function from JSON or a future database row, where
  // the union offers no protection. Without the guard, an unknown value throws
  // "Cannot read properties of undefined" instead of answering the question.
  if (!Object.hasOwn(transitions, from)) return false;
  return transitions[from].includes(to);
}

export function transitionJob(
  job: GenerationJob,
  nextStatus: GenerationJobStatus,
  now = new Date().toISOString(),
): GenerationJob {
  if (terminalStatuses.has(job.status)) {
    throw new Error(`Job ${job.id} is already final`);
  }
  if (!canTransition(job.status, nextStatus)) {
    throw new Error(`Invalid transition: ${job.status} -> ${nextStatus}`);
  }

  return {
    ...job,
    status: nextStatus,
    startedAt: nextStatus === "running" ? now : job.startedAt,
    completedAt:
      ["approved", "rejected", "failed", "cancelled"].includes(nextStatus)
        ? now
        : job.completedAt,
  };
}

export function createGenerationJob(input: {
  id: string;
  requestId: string;
  parentId: string;
  childId?: string;
  type: GenerationJobType;
  requestText: string;
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
    type: input.type,
    requestText: input.requestText.trim(),
    status: "queued",
    sourceSnapshotIds: input.sourceSnapshotIds ?? [],
    creditsReserved: input.creditsReserved,
    attemptCount: 0,
    createdAt: input.now ?? new Date().toISOString(),
  };
}
