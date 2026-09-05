import "server-only";

import { randomUUID } from "node:crypto";

import type { ParentAiContext, ParentAiTools } from "@/src/domain/parent-ai-tools";
import { ForbiddenAccessError } from "@/src/domain/parent-ai-tools";
import type { GenerationJob, GenerationJobType } from "@/src/domain/ai-generation-job";
import { createGenerationJob, decideJob, transitionJob } from "@/src/domain/ai-generation-job";
import { estimateCredits, type HomeworkSpec } from "@/src/domain/ai-homework-spec";
import { isToolAllowed, type ToolAudience } from "@/src/domain/ai-tool-registry";
import type {
  ApprovedLesson,
  Evidence,
  LearningSnapshot,
  QuebecRequirement,
  WeekPlan,
} from "@/src/domain/learning-records";
import type { ToolExecutor } from "@/src/server/ai/provider";
import {
  DEMO_ACTIVITIES,
  DEMO_APPROVED_LESSONS,
  DEMO_EVIDENCE,
  DEMO_FAMILY,
  DEMO_QUEBEC_REQUIREMENTS,
  findChild,
} from "@/src/server/demo-data";
import {
  findJobByRequestId,
  getJob,
  logAccess,
  refundCredits,
  reserveCredits,
  saveJob,
} from "@/src/server/store";

/**
 * Server implementation of the adult-facing tools.
 *
 * Every method re-checks the family before touching data and writes an access-log entry,
 * granted or refused. This is where "two families cannot read the same evidence" is
 * actually enforced — not in the UI, and not in the model's prompt.
 */

export class InsufficientCreditsError extends Error {
  readonly code = "insufficient_credits";
  constructor() {
    super("Not enough credits");
    this.name = "InsufficientCreditsError";
  }
}

export class NotFoundError extends Error {
  readonly code = "not_found";
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

function assertChildReadable(
  context: ParentAiContext,
  action: string,
  need: "progress" | "evidence" = "progress",
): void {
  const child = findChild(context.childId);
  const granted =
    !!child &&
    child.familyId === DEMO_FAMILY.id &&
    (need === "evidence" ? child.permissions.aiMayReadEvidence : child.permissions.aiMayReadProgress);

  logAccess({ actorId: context.parentId, action, subjectId: context.childId, granted });

  if (!child || child.familyId !== DEMO_FAMILY.id) {
    throw new ForbiddenAccessError("Child does not belong to this family");
  }
  if (!granted) {
    // The parent can withhold a data class from the agent; the agent must not work around it.
    throw new ForbiddenAccessError(`Consent missing for ${need}`);
  }
}

function assertJobOwned(context: ParentAiContext, jobId: string): GenerationJob {
  const job = getJob(jobId);
  const granted = !!job && job.parentId === context.parentId;
  logAccess({ actorId: context.parentId, action: "read_generation_job", subjectId: jobId, granted });
  if (!job) throw new NotFoundError(`Job ${jobId} not found`);
  if (!granted) throw new ForbiddenAccessError();
  return job;
}

function weekStart(now = new Date()): string {
  const date = new Date(now);
  const day = (date.getUTCDay() + 6) % 7; // Monday-based
  date.setUTCDate(date.getUTCDate() - day);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString();
}

export const parentAiTools: ParentAiTools = {
  async getChildLearningSnapshot(context, days = 14): Promise<LearningSnapshot> {
    assertChildReadable(context, "get_child_learning_snapshot");

    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    const activities = DEMO_ACTIVITIES.filter((activity) => activity.childId === context.childId);
    const completed = activities.filter((activity) => activity.status === "done");

    return {
      childId: context.childId,
      fromDate: from.toISOString(),
      toDate: to.toISOString(),
      minutesLearned: completed.reduce((total, activity) => total + activity.minutes, 0),
      activitiesCompleted: completed.length,
      subjectsTouched: Array.from(new Set(activities.map((activity) => activity.subject))),
      notionsInProgress: activities
        .filter((activity) => activity.status === "in_progress")
        .map((activity) => activity.title),
      // Below three recorded activities, any statement about a child would be a guess.
      hasEnoughData: activities.length >= 3,
    };
  },

  async getSkillEvidence(context, skillId): Promise<Evidence[]> {
    assertChildReadable(context, "get_skill_evidence", "evidence");
    return DEMO_EVIDENCE.filter(
      (evidence) => evidence.childId === context.childId && evidence.skillId === skillId,
    );
  },

  async getWeekPlan(context): Promise<WeekPlan> {
    assertChildReadable(context, "get_week_plan");
    const activities = DEMO_ACTIVITIES.filter((activity) => activity.childId === context.childId);
    const minutesPlanned = activities
      .filter((activity) => activity.status !== "done")
      .reduce((total, activity) => total + activity.minutes, 0);

    return {
      childId: context.childId,
      weekStart: weekStart(),
      activities,
      minutesPlanned,
      // Demo ceiling: five 60-minute learning blocks in a week.
      minutesAvailable: Math.max(0, 300 - minutesPlanned),
    };
  },

  async getQuebecRequirementStatus(context): Promise<QuebecRequirement[]> {
    assertChildReadable(context, "get_quebec_requirement_status");
    return DEMO_QUEBEC_REQUIREMENTS.filter(
      (requirement) => requirement.schoolYear === DEMO_FAMILY.schoolYear,
    );
  },

  async searchApprovedLessons(context, query): Promise<ApprovedLesson[]> {
    logAccess({
      actorId: context.parentId,
      action: "search_approved_lessons",
      subjectId: query,
      granted: true,
    });
    const needle = query.trim().toLowerCase();
    if (!needle) return DEMO_APPROVED_LESSONS;
    return DEMO_APPROVED_LESSONS.filter((lesson) =>
      [lesson.titleFr, lesson.titleEn, ...lesson.objectives]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  },

  async createGenerationJob(input): Promise<GenerationJob> {
    const { context, requestId, type, requestText, spec } = input;
    assertChildReadable(context, "create_generation_job");

    // Idempotency: a double click, a retried fetch or a model repeating itself must not
    // create a second job or reserve credits twice.
    const existing = findJobByRequestId(requestId);
    if (existing) {
      if (existing.parentId !== context.parentId) throw new ForbiddenAccessError();
      return existing;
    }

    const credits = spec ? estimateCredits(spec) : 1;
    if (!reserveCredits(DEMO_FAMILY.id, credits)) {
      throw new InsufficientCreditsError();
    }

    const job = createGenerationJob({
      id: randomUUID(),
      requestId,
      parentId: context.parentId,
      childId: context.childId,
      requestedByRole: context.role,
      type: type as GenerationJobType,
      locale: context.locale,
      requestText,
      spec,
      creditsReserved: credits,
    });

    logAccess({
      actorId: context.parentId,
      action: "create_generation_job",
      subjectId: job.id,
      granted: true,
    });
    return saveJob(job);
  },

  async getGenerationJob(context, jobId): Promise<GenerationJob> {
    return assertJobOwned(context, jobId);
  },

  async approveGeneratedContent(context, jobId, note): Promise<GenerationJob> {
    const job = assertJobOwned(context, jobId);
    if (job.status !== "review_required") {
      throw new NotFoundError(`Job ${jobId} is not awaiting review`);
    }
    logAccess({
      actorId: context.parentId,
      action: "approve_generated_content",
      subjectId: jobId,
      granted: true,
    });
    return saveJob(decideJob(job, "approved", context.parentId, note));
  },

  async cancelGenerationJob(context, jobId): Promise<GenerationJob> {
    const job = assertJobOwned(context, jobId);
    const cancelled = transitionJob(job, "cancelled");
    // Cancelling before publication returns the reservation.
    refundCredits(DEMO_FAMILY.id, cancelled.creditsReserved);
    logAccess({
      actorId: context.parentId,
      action: "cancel_generation_job",
      subjectId: jobId,
      granted: true,
    });
    return saveJob(cancelled);
  },
};

export async function rejectGeneratedContent(
  context: ParentAiContext,
  jobId: string,
  note?: string,
): Promise<GenerationJob> {
  const job = assertJobOwned(context, jobId);
  if (job.status !== "review_required") {
    throw new NotFoundError(`Job ${jobId} is not awaiting review`);
  }
  const rejected = decideJob(job, "rejected", context.parentId, note);
  // A rejected draft was still generated, so the credits are spent; only failures refund.
  logAccess({
    actorId: context.parentId,
    action: "reject_generated_content",
    subjectId: jobId,
    granted: true,
  });
  return saveJob(rejected);
}

/**
 * Builds the executor handed to an agent.
 *
 * The audience gate is the whole point: `approve_generated_content` is in the registry but
 * belongs to no audience, so an agent asking for it is refused here rather than trusted.
 */
export function createParentToolExecutor(
  context: ParentAiContext,
  audience: ToolAudience = "parent_agent",
): ToolExecutor {
  return async (name, input) => {
    if (!isToolAllowed(name, audience)) {
      logAccess({ actorId: context.parentId, action: name, subjectId: "tool", granted: false });
      throw new ForbiddenAccessError(`Tool ${name} is not available to this agent`);
    }

    switch (name) {
      case "get_child_learning_snapshot":
        return parentAiTools.getChildLearningSnapshot(
          context,
          typeof input.days === "number" ? input.days : undefined,
        );
      case "get_skill_evidence":
        return parentAiTools.getSkillEvidence(context, String(input.skillId ?? ""));
      case "get_week_plan":
        return parentAiTools.getWeekPlan(context);
      case "get_quebec_requirement_status":
        return parentAiTools.getQuebecRequirementStatus(context);
      case "search_approved_lessons":
        return parentAiTools.searchApprovedLessons(context, String(input.query ?? ""));
      case "create_generation_job":
        return parentAiTools.createGenerationJob({
          context,
          requestId: String(input.requestId ?? randomUUID()),
          type: (input.type as GenerationJobType) ?? "lesson",
          requestText: String(input.requestText ?? ""),
        });
      case "get_generation_job":
        return parentAiTools.getGenerationJob(context, String(input.jobId ?? ""));
      case "cancel_generation_job":
        return parentAiTools.cancelGenerationJob(context, String(input.jobId ?? ""));
      default:
        throw new ForbiddenAccessError(`Unknown tool ${name}`);
    }
  };
}

export function contextFor(input: {
  parentId: string;
  childId: string;
  locale: ParentAiContext["locale"];
  role: ParentAiContext["role"];
  spec?: HomeworkSpec;
}): ParentAiContext {
  return {
    parentId: input.parentId,
    childId: input.childId,
    locale: input.locale,
    role: input.role,
    allowedSourceIds: DEMO_APPROVED_LESSONS.map((lesson) => lesson.id),
  };
}
