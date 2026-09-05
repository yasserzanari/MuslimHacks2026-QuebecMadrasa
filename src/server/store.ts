import "server-only";

import type { GenerationJob } from "@/src/domain/ai-generation-job";
import type { HomeworkDocument } from "@/src/domain/ai-homework-document";
import type { StudentLesson } from "@/src/domain/learning-records";
import type { TutorSessionState } from "@/src/domain/ai-tutor-session";
import { DEMO_FAMILY, DEMO_LESSON } from "@/src/server/demo-data";

/**
 * Local persistence adapter.
 *
 * Deliberately in-memory: docs/architecture/01-stack-local.md keeps the first slice free
 * of a real database, and the interface below is the seam SQLite/Prisma will replace.
 * State hangs off `globalThis` so a hot reload in `next dev` does not wipe a queue the
 * developer is in the middle of testing.
 */

interface AccessLogEntry {
  at: string;
  actorId: string;
  action: string;
  subjectId: string;
  granted: boolean;
}

export interface Escalation {
  id: string;
  studentId: string;
  lessonId: string;
  questionId: string;
  reason: string;
  note: string;
  createdAt: string;
  seenByAdult: boolean;
}

interface StoreShape {
  jobs: Map<string, GenerationJob>;
  jobIdByRequestId: Map<string, string>;
  documents: Map<string, HomeworkDocument>;
  lessons: Map<string, StudentLesson>;
  tutorSessions: Map<string, TutorSessionState>;
  creditsByFamily: Map<string, number>;
  accessLog: AccessLogEntry[];
  escalations: Escalation[];
}

const STORE_KEY = Symbol.for("madrasa.quebec.local-store");

function createStore(): StoreShape {
  return {
    jobs: new Map(),
    jobIdByRequestId: new Map(),
    documents: new Map(),
    // The demo lesson exists from the start so the student flow and the tutor API work
    // before any parent has approved a generated draft.
    lessons: new Map([[DEMO_LESSON.id, DEMO_LESSON]]),
    tutorSessions: new Map(),
    creditsByFamily: new Map([[DEMO_FAMILY.id, DEMO_FAMILY.creditsAvailable]]),
    accessLog: [],
    escalations: [],
  };
}

function getStore(): StoreShape {
  const globalRef = globalThis as unknown as Record<symbol, StoreShape | undefined>;
  if (!globalRef[STORE_KEY]) globalRef[STORE_KEY] = createStore();
  return globalRef[STORE_KEY] as StoreShape;
}

/* ------------------------------------------------------------------ jobs */

export function saveJob(job: GenerationJob): GenerationJob {
  const store = getStore();
  store.jobs.set(job.id, job);
  store.jobIdByRequestId.set(job.requestId, job.id);
  return job;
}

export function getJob(jobId: string): GenerationJob | undefined {
  return getStore().jobs.get(jobId);
}

/** Idempotency: the same `requestId` must never create a second job. */
export function findJobByRequestId(requestId: string): GenerationJob | undefined {
  const store = getStore();
  const jobId = store.jobIdByRequestId.get(requestId);
  return jobId ? store.jobs.get(jobId) : undefined;
}

export function listJobsForParent(parentId: string): GenerationJob[] {
  return Array.from(getStore().jobs.values())
    .filter((job) => job.parentId === parentId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listQueuedJobs(): GenerationJob[] {
  return Array.from(getStore().jobs.values()).filter((job) => job.status === "queued");
}

/* -------------------------------------------------------------- documents */

export function saveDocument(document: HomeworkDocument): HomeworkDocument {
  getStore().documents.set(document.id, document);
  return document;
}

export function getDocument(documentId: string): HomeworkDocument | undefined {
  return getStore().documents.get(documentId);
}

/* ---------------------------------------------------------------- lessons */

export function saveLesson(lesson: StudentLesson): StudentLesson {
  getStore().lessons.set(lesson.id, lesson);
  return lesson;
}

export function getLesson(lessonId: string): StudentLesson | undefined {
  return getStore().lessons.get(lessonId);
}

export function listLessonsForChild(childId: string): StudentLesson[] {
  return Array.from(getStore().lessons.values()).filter((lesson) => lesson.childId === childId);
}

/* --------------------------------------------------------- tutor sessions */

function sessionKey(studentId: string, lessonId: string, questionId: string): string {
  return `${studentId}::${lessonId}::${questionId}`;
}

export function getTutorSession(
  studentId: string,
  lessonId: string,
  questionId: string,
): TutorSessionState | undefined {
  return getStore().tutorSessions.get(sessionKey(studentId, lessonId, questionId));
}

export function saveTutorSession(state: TutorSessionState): TutorSessionState {
  getStore().tutorSessions.set(
    sessionKey(state.studentId, state.lessonId, state.questionId),
    state,
  );
  return state;
}

export function listTutorSessionsForLesson(
  studentId: string,
  lessonId: string,
): TutorSessionState[] {
  return Array.from(getStore().tutorSessions.values()).filter(
    (state) => state.studentId === studentId && state.lessonId === lessonId,
  );
}

/* ---------------------------------------------------------------- credits */

export function getCredits(familyId: string): number {
  return getStore().creditsByFamily.get(familyId) ?? 0;
}

/** Returns false when the family cannot afford the request; nothing is reserved then. */
export function reserveCredits(familyId: string, amount: number): boolean {
  const store = getStore();
  const available = store.creditsByFamily.get(familyId) ?? 0;
  if (available < amount) return false;
  store.creditsByFamily.set(familyId, available - amount);
  return true;
}

export function refundCredits(familyId: string, amount: number): void {
  const store = getStore();
  store.creditsByFamily.set(familyId, (store.creditsByFamily.get(familyId) ?? 0) + amount);
}

/* ------------------------------------------------------------- access log */

export function logAccess(entry: Omit<AccessLogEntry, "at">): void {
  const store = getStore();
  store.accessLog.push({ ...entry, at: new Date().toISOString() });
  // The log is a development aid, not an audit trail yet: keep it bounded.
  if (store.accessLog.length > 500) store.accessLog.splice(0, store.accessLog.length - 500);
}

export function listAccessLog(): ReadonlyArray<AccessLogEntry> {
  return getStore().accessLog;
}

/* ----------------------------------------------------------- escalations */

export function recordEscalation(escalation: Escalation): Escalation {
  getStore().escalations.push(escalation);
  return escalation;
}

export function listEscalations(studentId?: string): Escalation[] {
  const all = getStore().escalations;
  return studentId ? all.filter((item) => item.studentId === studentId) : [...all];
}
