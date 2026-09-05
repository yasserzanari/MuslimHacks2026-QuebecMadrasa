/**
 * The only tools an AI agent may call in this product.
 *
 * Both agents (the adult-facing homework generator and the student tutor) receive their
 * tools from this registry. Two consequences the docs require:
 *   - the browser never sees a tool definition or a provider key: the registry is imported
 *     by server code only, and every call is authorized against the caller's family;
 *   - a tool that is not listed here does not exist. There is no free-form database access,
 *     no payments, no private messages, no precise location.
 *
 * See docs/plan/services/11-assistant-ia-parent.md and docs/architecture/02-queue-ia-et-live.md.
 */

export type ToolAccess = "read" | "controlled_write";

export type ToolAudience = "parent_agent" | "student_agent";

export interface AiToolDefinition {
  name: string;
  access: ToolAccess;
  audiences: ToolAudience[];
  /** Sent to the model, so it is written for the model, not for a reader of this file. */
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties: false;
  };
}

const definitions: AiToolDefinition[] = [
  {
    name: "get_child_learning_snapshot",
    access: "read",
    audiences: ["parent_agent"],
    description:
      "Recent learning activity for one child: subjects touched, activities completed, time spent, and the date range the data covers. Use it before claiming anything about how a child is doing.",
    inputSchema: {
      type: "object",
      properties: {
        childId: { type: "string" },
        days: { type: "integer", minimum: 1, maximum: 90 },
      },
      required: ["childId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_skill_evidence",
    access: "read",
    audiences: ["parent_agent"],
    description:
      "Evidence recorded for one skill: what the child produced, when, and who observed it. Returns an empty list when no evidence exists — say so rather than guessing.",
    inputSchema: {
      type: "object",
      properties: { childId: { type: "string" }, skillId: { type: "string" } },
      required: ["childId", "skillId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_week_plan",
    access: "read",
    audiences: ["parent_agent"],
    description:
      "Activities already scheduled this week for one child and the time still available. Use it to check that new homework fits before proposing it.",
    inputSchema: {
      type: "object",
      properties: { childId: { type: "string" } },
      required: ["childId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_quebec_requirement_status",
    access: "read",
    audiences: ["parent_agent"],
    description:
      "Status of the Quebec pathway items the family is tracking, with their official source. Never state a Quebec requirement that this tool did not return.",
    inputSchema: {
      type: "object",
      properties: { childId: { type: "string" } },
      required: ["childId"],
      additionalProperties: false,
    },
  },
  {
    name: "search_approved_lessons",
    access: "read",
    audiences: ["parent_agent", "student_agent"],
    description:
      "Search lessons the family has already approved. Cite the returned ids as sources; do not invent a source id.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        subject: { type: "string" },
        level: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "create_generation_job",
    access: "controlled_write",
    audiences: ["parent_agent"],
    description:
      "Place a homework or report request in the family's generation queue. This only queues a draft; it never publishes anything to a child's plan.",
    inputSchema: {
      type: "object",
      properties: {
        requestId: { type: "string" },
        type: {
          type: "string",
          enum: ["lesson", "exercises", "weekly_report", "explanation"],
        },
        requestText: { type: "string" },
      },
      required: ["requestId", "type", "requestText"],
      additionalProperties: false,
    },
  },
  {
    name: "get_generation_job",
    access: "read",
    audiences: ["parent_agent"],
    description: "State, result, reserved credits and error code of one queued job.",
    inputSchema: {
      type: "object",
      properties: { jobId: { type: "string" } },
      required: ["jobId"],
      additionalProperties: false,
    },
  },
  {
    name: "approve_generated_content",
    access: "controlled_write",
    audiences: [],
    description:
      "Reserved for the human review interface. An AI agent is never granted this tool: approving generated content is a human decision.",
    inputSchema: {
      type: "object",
      properties: { jobId: { type: "string" } },
      required: ["jobId"],
      additionalProperties: false,
    },
  },
  {
    name: "cancel_generation_job",
    access: "controlled_write",
    audiences: ["parent_agent"],
    description: "Cancel a queued or running job before it produces a draft.",
    inputSchema: {
      type: "object",
      properties: { jobId: { type: "string" } },
      required: ["jobId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_homework_question",
    access: "read",
    audiences: ["student_agent"],
    description:
      "The question the student is working on right now, with its objective and its prepared hints. Read it before answering anything about the homework.",
    inputSchema: {
      type: "object",
      properties: { questionId: { type: "string" } },
      required: ["questionId"],
      additionalProperties: false,
    },
  },
  {
    name: "get_student_attempt_history",
    access: "read",
    audiences: ["student_agent"],
    description:
      "What this student already tried on the current question and which hints they have already seen, so you do not repeat help they already have.",
    inputSchema: {
      type: "object",
      properties: { questionId: { type: "string" } },
      required: ["questionId"],
      additionalProperties: false,
    },
  },
  {
    name: "escalate_to_adult",
    access: "controlled_write",
    audiences: ["student_agent"],
    description:
      "Raise a flag for the parent or tutor when the student needs a human: distress, a question outside schoolwork, a safety concern, or a problem you cannot help with pedagogically. Say plainly to the student that you are doing this.",
    inputSchema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: ["needs_human_help", "outside_schoolwork", "wellbeing", "content_dispute"],
        },
        note: { type: "string" },
      },
      required: ["reason", "note"],
      additionalProperties: false,
    },
  },
];

const byName = new Map(definitions.map((tool) => [tool.name, tool]));

export const AI_TOOLS: readonly AiToolDefinition[] = definitions;

export function getToolDefinition(name: string): AiToolDefinition | undefined {
  return byName.get(name);
}

/** The tools one agent is allowed to call. Anything outside this list is refused. */
export function toolsForAudience(audience: ToolAudience): AiToolDefinition[] {
  return definitions.filter((tool) => tool.audiences.includes(audience));
}

export function isToolAllowed(name: string, audience: ToolAudience): boolean {
  return byName.get(name)?.audiences.includes(audience) ?? false;
}
