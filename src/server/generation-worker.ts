import "server-only";

import { randomUUID } from "node:crypto";

import type { GenerationJob } from "@/src/domain/ai-generation-job";
import { compareQueueOrder, completeAttempt, failAttempt, startAttempt } from "@/src/domain/ai-generation-job";
import type { HomeworkDocument } from "@/src/domain/ai-homework-document";
import { validateHomeworkDocument } from "@/src/domain/ai-homework-document";
import type { StudentLesson } from "@/src/domain/learning-records";
import { aiDictionary } from "@/src/i18n/ai-dictionary";
import { getAiProvider } from "@/src/server/ai";
import { ProviderUnavailableError } from "@/src/server/ai/provider";
import { contextFor, createParentToolExecutor } from "@/src/server/parent-tools";
import { DEMO_APPROVED_LESSONS, DEMO_FAMILY } from "@/src/server/demo-data";
import {
  getDocument,
  listQueuedJobs,
  refundCredits,
  saveDocument,
  saveJob,
  saveLesson,
} from "@/src/server/store";

/**
 * The worker that drains the generation queue.
 *
 * docs/architecture/02-queue-ia-et-live.md: a short answer can be immediate, but any
 * lesson, exercise set or report is asynchronous. In production this is a separate Node
 * process; locally it is this function, triggered by the parent's "Process the queue"
 * button or by a poll, so nothing about the flow depends on a background daemon existing.
 */

export interface WorkerTickResult {
  processed: number;
  succeeded: number;
  failed: number;
  jobIds: string[];
}

async function runJob(job: GenerationJob): Promise<GenerationJob> {
  if (!job.spec) {
    // Only homework-shaped jobs are generated for now; anything else fails loudly rather
    // than producing an untyped document the review screen cannot render.
    return saveJob(failAttempt(startAttempt(job), "invalid_request"));
  }

  const running = saveJob(startAttempt(job));
  const context = contextFor({
    parentId: running.parentId,
    childId: running.spec?.childId ?? running.childId ?? "",
    locale: running.locale,
    role: running.requestedByRole,
  });

  try {
    const provider = await getAiProvider();
    const result = await provider.generateHomework({
      spec: running.spec!,
      approvedLessons: DEMO_APPROVED_LESSONS,
      audience: "parent_agent",
      runTool: createParentToolExecutor(context, "parent_agent"),
    });

    const documentId = randomUUID();
    const dictionary = aiDictionary[running.spec!.locale];
    const base: Omit<HomeworkDocument, "warnings"> = {
      id: documentId,
      jobId: running.id,
      locale: running.spec!.locale,
      title: result.draft.title,
      audience: "child",
      levelLabel: result.draft.levelLabel,
      subject: dictionary.subjects[running.spec!.subject],
      objectives: result.draft.objectives,
      estimatedMinutes: result.draft.estimatedMinutes,
      lessonBlocks: result.draft.lessonBlocks,
      practiceQuestions: result.draft.practiceQuestions,
      answerKey: result.draft.answerKey,
      sourceIds: result.draft.sourceIds,
      requiresParentReview: true,
      modelVersion: result.modelVersion,
      promptVersion: result.promptVersion,
      generatedAt: new Date().toISOString(),
    };

    // Automatic safety and coherence pass before a human is asked to read it.
    const warnings = validateHomeworkDocument(base, running.spec!);
    saveDocument({ ...base, warnings });

    return saveJob(completeAttempt(running, documentId, result.modelVersion));
  } catch (error) {
    const code =
      error instanceof ProviderUnavailableError
        ? error.code
        : error instanceof Error && "code" in error
          ? String((error as { code: unknown }).code)
          : "unknown";

    const failed = failAttempt(running, code);
    // A job that gave up must not keep the family's credits (rule: refund on failure).
    if (failed.status === "failed") {
      refundCredits(DEMO_FAMILY.id, failed.creditsReserved);
    }
    return saveJob(failed);
  }
}

/**
 * Processes the queue once. Normal priority first, then oldest first.
 * `limit` keeps a single request bounded; the button can simply be pressed again.
 */
export async function runWorkerTick(limit = 3): Promise<WorkerTickResult> {
  const queued = listQueuedJobs().sort(compareQueueOrder).slice(0, limit);
  const result: WorkerTickResult = { processed: 0, succeeded: 0, failed: 0, jobIds: [] };

  for (const job of queued) {
    const done = await runJob(job);
    result.processed += 1;
    result.jobIds.push(done.id);
    if (done.status === "review_required") result.succeeded += 1;
    else result.failed += 1;
  }

  return result;
}

/**
 * Turns an approved draft into a lesson the student can open.
 *
 * Approval publishes the content; it does *not* schedule it. Adding the lesson to the
 * week plan stays a separate, manual parent action.
 */
export function publishApprovedLesson(job: GenerationJob): StudentLesson | undefined {
  if (job.status !== "approved" || !job.outputDocumentId || !job.spec) return undefined;

  const document = getDocument(job.outputDocumentId);
  if (!document) return undefined;

  const lesson: StudentLesson = {
    id: `lesson-${job.id}`,
    childId: job.spec.childId,
    documentId: document.id,
    subject: job.spec.subject,
    title: document.title,
    goal: document.objectives[0] ?? job.spec.topic,
    estimatedMinutes: document.estimatedMinutes,
    locale: document.locale,
    allowSolutionReveal: job.spec.allowSolutionReveal,
    questions: document.practiceQuestions.map((question, index) => ({
      id: question.id,
      lessonId: `lesson-${job.id}`,
      index,
      type: question.type,
      prompt: question.prompt,
      choices: question.choices,
      hints: question.hints,
      objective: document.objectives[index % Math.max(1, document.objectives.length)] ?? job.spec!.topic,
    })),
  };

  return saveLesson(lesson);
}
