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

export type DraftBlock = { type: string; title: string; prompt: string };
export type DraftPreview = { title: string; subject: string; objective: string; instructions: string; blocks: DraftBlock[]; requiresParentReview: true };

export function buildDraftPreview(subject: string, objective: string, locale: "fr" | "en" = "fr"): DraftPreview {
  return {
    title: locale === "en" ? `Practice · ${subject}` : `Révision · ${subject}`,
    subject,
    objective,
    instructions: locale === "en" ? "Try each step and explain your reasoning." : "Essaie chaque étape et explique ton raisonnement.",
    blocks: [
      { type: "warmup", title: locale === "en" ? "Warm-up" : "Mise en route", prompt: locale === "en" ? `What do you already know about ${subject.toLowerCase()}?` : `Que sais-tu déjà sur ${subject.toLowerCase()} ?` },
      { type: "guided-practice", title: locale === "en" ? "Guided practice" : "Pratique guidée", prompt: objective },
      { type: "reflection", title: locale === "en" ? "Reflection" : "Réflexion", prompt: locale === "en" ? "What would you try differently next time?" : "Que ferais-tu autrement la prochaine fois ?" },
    ],
    requiresParentReview: true,
  };
}

export interface GenerationJobRecord extends GenerationJob {
  childName: string;
  subject: string;
  locale: "fr" | "en";
  draft?: DraftPreview;
}

const DEMO_PARENT_ID = "demo-parent";
const CREDIT_COST = 1;
let creditsBalance = 1;
let jobSequence = 0;

function nextJobId() { jobSequence += 1; return `job-${jobSequence}`; }

const jobs: GenerationJobRecord[] = [
  { ...createGenerationJob({ id: "job-1", requestId: "req-1", parentId: DEMO_PARENT_ID, childId: "adam", type: "exercises", requestText: "Créer des exercices de fractions pour Adam", creditsReserved: 1, now: "2026-09-05T14:00:00.000Z" }), childName: "Adam", subject: "Mathématiques", locale: "fr", status: "review_required", startedAt: "2026-09-05T14:00:20.000Z", draft: buildDraftPreview("Mathématiques", "Comprendre la valeur des fractions et les additionner avec des dénominateurs communs.", "fr") },
  { ...createGenerationJob({ id: "job-2", requestId: "req-2", parentId: DEMO_PARENT_ID, childId: "sara", type: "weekly_report", requestText: "Résumer la semaine de Sara en sciences", creditsReserved: 1, now: "2026-09-06T09:12:00.000Z" }), childName: "Sara", subject: "Sciences", locale: "fr", status: "running", startedAt: "2026-09-06T09:12:05.000Z" },
  { ...createGenerationJob({ id: "job-3", requestId: "req-3", parentId: DEMO_PARENT_ID, childId: "adam", type: "explanation", requestText: "Expliquer les écosystèmes autrement pour Adam", creditsReserved: 1, now: "2026-09-04T11:00:00.000Z" }), childName: "Adam", subject: "Sciences", locale: "fr", status: "failed", startedAt: "2026-09-04T11:00:10.000Z", completedAt: "2026-09-04T11:00:40.000Z", errorCode: "generation_timeout" },
  { ...createGenerationJob({ id: "job-4", requestId: "req-4", parentId: DEMO_PARENT_ID, childId: "sara", type: "lesson", requestText: "Créer une leçon d’anglais oral pour Sara", creditsReserved: 1, now: "2026-09-02T08:00:00.000Z" }), childName: "Sara", subject: "Anglais", locale: "fr", status: "approved", startedAt: "2026-09-02T08:00:05.000Z", completedAt: "2026-09-02T08:05:00.000Z", approvedBy: DEMO_PARENT_ID, draft: buildDraftPreview("Anglais", "Practice introducing yourself and asking a simple question.", "fr") },
];
jobSequence = jobs.length;

export function listGenerationJobs(parentId = DEMO_PARENT_ID): GenerationJobRecord[] {
  return jobs.filter((job) => job.parentId === parentId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getGenerationJobRecord(id: string) {
  return jobs.find((job) => job.id === id);
}

export function getCreditsBalance() {
  return creditsBalance;
}

export function queueGenerationJob(input: { parentId?: string; childId?: string; childName?: string; type: GenerationJobType; requestText: string; subject?: string; locale?: "fr" | "en" }): { job: GenerationJobRecord } | { error: string } {
  if (creditsBalance < CREDIT_COST) return { error: "insufficient_credits" };
  const base = createGenerationJob({ id: nextJobId(), requestId: crypto.randomUUID(), parentId: input.parentId ?? DEMO_PARENT_ID, childId: input.childId, type: input.type, requestText: input.requestText, creditsReserved: CREDIT_COST });
  const record: GenerationJobRecord = { ...base, childName: input.childName ?? "Enfant", subject: input.subject ?? "Mathématiques", locale: input.locale ?? "fr" };
  jobs.unshift(record);
  creditsBalance -= CREDIT_COST;
  return { job: record };
}

export function cancelGenerationJob(id: string): { job: GenerationJobRecord } | { error: string } {
  const job = getGenerationJobRecord(id);
  if (!job) return { error: "not_found" };
  if (!canTransition(job.status, "cancelled")) return { error: "not_cancellable" };
  const updated = transitionJob(job, "cancelled") as GenerationJobRecord;
  Object.assign(job, updated);
  creditsBalance += job.creditsReserved;
  return { job };
}

export function retryGenerationJob(id: string): { job: GenerationJobRecord } | { error: string } {
  const failedJob = getGenerationJobRecord(id);
  if (!failedJob) return { error: "not_found" };
  if (failedJob.status !== "failed") return { error: "not_retryable" };
  if (creditsBalance < CREDIT_COST) return { error: "insufficient_credits" };
  const base = createGenerationJob({ id: nextJobId(), requestId: crypto.randomUUID(), parentId: failedJob.parentId, childId: failedJob.childId, type: failedJob.type, requestText: failedJob.requestText, creditsReserved: CREDIT_COST });
  const record: GenerationJobRecord = { ...base, childName: failedJob.childName, subject: failedJob.subject, locale: failedJob.locale };
  jobs.unshift(record);
  creditsBalance -= CREDIT_COST;
  return { job: record };
}
