import type { StepId } from "@/src/domain/quebec-pathway";

const KEY_PREFIX = "madrasa:quebec:";

export type SubmissionStatus = "draft" | "verified" | "exported";

export type StepSubmission = {
  values: Record<string, string>;
  status: SubmissionStatus;
  savedAt?: string;
  verifiedAt?: string;
  exportedAt?: string;
};

function key(stepId: StepId) { return `${KEY_PREFIX}${stepId}`; }

export function loadSubmission(stepId: StepId): StepSubmission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(stepId));
    if (!raw) return null;
    return JSON.parse(raw) as StepSubmission;
  } catch {
    return null;
  }
}

export function saveSubmission(stepId: StepId, values: Record<string, string>): StepSubmission {
  const submission: StepSubmission = { values, status: "draft", savedAt: new Date().toISOString() };
  if (typeof window !== "undefined") window.localStorage.setItem(key(stepId), JSON.stringify(submission));
  return submission;
}

export function verifySubmission(stepId: StepId): StepSubmission | null {
  const current = loadSubmission(stepId);
  if (!current) return null;
  const updated: StepSubmission = { ...current, status: "verified", verifiedAt: new Date().toISOString() };
  if (typeof window !== "undefined") window.localStorage.setItem(key(stepId), JSON.stringify(updated));
  return updated;
}

export function markExported(stepId: StepId): StepSubmission | null {
  const current = loadSubmission(stepId);
  if (!current || current.status !== "verified") return null;
  const updated: StepSubmission = { ...current, status: "exported", exportedAt: new Date().toISOString() };
  if (typeof window !== "undefined") window.localStorage.setItem(key(stepId), JSON.stringify(updated));
  return updated;
}
