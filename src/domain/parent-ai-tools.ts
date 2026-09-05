import type { Locale } from "@/src/i18n/locale";
import type { HomeworkSpec } from "@/src/domain/ai-homework-spec";
import type { GenerationJob, GenerationJobType } from "@/src/domain/ai-generation-job";
import type {
  ApprovedLesson,
  Evidence,
  LearningSnapshot,
  QuebecRequirement,
  WeekPlan,
} from "@/src/domain/learning-records";

/**
 * Server-side tool contract for the adult-facing agent.
 *
 * Every method is executed by the backend, never by the browser, and every call carries
 * a context the implementation re-checks against the caller's session. The AI never gets
 * the database: it gets these nine methods and nothing else.
 */

export interface ParentAiContext {
  parentId: string;
  childId: string;
  locale: Locale;
  /** Ids the parent has consented to expose to the agent for this request. */
  allowedSourceIds: string[];
  /** Which adult is acting; a group educator sees only their own class. */
  role: "parent" | "tutor" | "educator";
}

export interface ParentAiTools {
  getChildLearningSnapshot(context: ParentAiContext, days?: number): Promise<LearningSnapshot>;
  getSkillEvidence(context: ParentAiContext, skillId: string): Promise<Evidence[]>;
  getWeekPlan(context: ParentAiContext): Promise<WeekPlan>;
  getQuebecRequirementStatus(context: ParentAiContext): Promise<QuebecRequirement[]>;
  searchApprovedLessons(context: ParentAiContext, query: string): Promise<ApprovedLesson[]>;
  createGenerationJob(input: {
    context: ParentAiContext;
    requestId: string;
    type: GenerationJobType;
    requestText: string;
    spec?: HomeworkSpec;
  }): Promise<GenerationJob>;
  getGenerationJob(context: ParentAiContext, jobId: string): Promise<GenerationJob>;
  approveGeneratedContent(
    context: ParentAiContext,
    jobId: string,
    note?: string,
  ): Promise<GenerationJob>;
  cancelGenerationJob(context: ParentAiContext, jobId: string): Promise<GenerationJob>;
}

export class ForbiddenAccessError extends Error {
  readonly code = "forbidden";
  constructor(message = "Forbidden family access") {
    super(message);
    this.name = "ForbiddenAccessError";
  }
}

/**
 * Every implementation must enforce authorization server-side before using a tool.
 * The browser must never receive database credentials or unrestricted tool access.
 */
export function assertParentCanAccess(sessionParentId: string, context: ParentAiContext): void {
  if (sessionParentId !== context.parentId) {
    throw new ForbiddenAccessError();
  }
  if (!context.childId) {
    throw new ForbiddenAccessError("A child must be selected");
  }
}
