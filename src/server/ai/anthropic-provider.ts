import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import type { HomeworkSpec } from "@/src/domain/ai-homework-spec";
import { QUESTION_TYPES } from "@/src/domain/ai-homework-spec";
import { aiDictionary } from "@/src/i18n/ai-dictionary";
import { toolsForAudience } from "@/src/domain/ai-tool-registry";
import type {
  AiProvider,
  HomeworkDraft,
  HomeworkGenerationRequest,
  HomeworkGenerationResult,
  TutorReplyRequest,
  TutorReplyResult,
  ToolExecutor,
} from "@/src/server/ai/provider";
import {
  ProviderInvalidOutputError,
  ProviderUnavailableError,
} from "@/src/server/ai/provider";

/**
 * Claude-backed provider, used when `AI_PROVIDER=anthropic` and a key is present.
 *
 * Everything here runs on the server. The key is read from `process.env` inside route
 * handlers and the worker; it is never sent to the browser, and the browser never sees a
 * tool definition or a system prompt (docs/architecture/04-securite-et-donnees.md).
 *
 * The agent is a manual tool-use loop: Claude reads the family's data only through the
 * authorized tools passed in as `runTool`, and finishes by calling one strict tool that
 * returns the homework in the exact shape the review screen renders.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";
const HOMEWORK_PROMPT_VERSION = "homework-agent-v1";
const TUTOR_PROMPT_VERSION = "tutor-agent-v1";
const MAX_TOOL_ITERATIONS = 8;

let cachedClient: Anthropic | null = null;

function client(): Anthropic {
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}

/** Registry entries, rendered as Claude tool definitions. */
function apiToolsFor(audience: Parameters<typeof toolsForAudience>[0]): Anthropic.Tool[] {
  return toolsForAudience(audience).map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema as unknown as Anthropic.Tool.InputSchema,
  }));
}

/** The strict tool the homework agent must finish with. */
const SUBMIT_HOMEWORK_TOOL: Anthropic.Tool = {
  name: "submit_homework_draft",
  description:
    "Submit the finished homework draft. Call this exactly once, as your last action, with the complete draft.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string" },
      level_label: { type: "string" },
      objectives: { type: "array", items: { type: "string" } },
      estimated_minutes: { type: "integer" },
      lesson_blocks: {
        type: "array",
        items: {
          type: "object",
          properties: { heading: { type: "string" }, body: { type: "string" } },
          required: ["heading", "body"],
          additionalProperties: false,
        },
      },
      practice_questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: [...QUESTION_TYPES] },
            prompt: { type: "string" },
            choices: { type: "array", items: { type: "string" } },
            hints: { type: "array", items: { type: "string" } },
          },
          required: ["id", "type", "prompt", "choices", "hints"],
          additionalProperties: false,
        },
      },
      answer_key: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question_id: { type: "string" },
            answer: { type: "string" },
            reasoning: { type: "string" },
          },
          required: ["question_id", "answer", "reasoning"],
          additionalProperties: false,
        },
      },
      source_ids: { type: "array", items: { type: "string" } },
    },
    required: [
      "title",
      "level_label",
      "objectives",
      "estimated_minutes",
      "lesson_blocks",
      "practice_questions",
      "answer_key",
      "source_ids",
    ],
    additionalProperties: false,
  } as unknown as Anthropic.Tool.InputSchema,
};

function homeworkSystemPrompt(locale: HomeworkSpec["locale"]): string {
  const language = locale === "fr" ? "French (Quebec)" : "English";
  return [
    "You prepare homework drafts for a family learning at home in Quebec. A parent, a tutor or a group educator fills a form; you turn it into a draft that a human reviews before any child sees it.",
    "",
    "Rules you must follow:",
    `- Write every student-facing string in ${language}. Do not mix languages on one worksheet.`,
    "- Follow the specification exactly: the number of questions, the question types, the difficulty, the target duration and the objectives given to you. Do not add objectives of your own.",
    "- Give every question two progressive hints and one worked example hint, in that order, so the student tutor can help without revealing the answer.",
    "- Cite sources only by the ids returned by search_approved_lessons. Never invent a source id.",
    "- Never state or imply a diagnosis, a disorder, a grade, a pass/fail judgement, a legal obligation or a religious ruling.",
    "- Never claim a Quebec ministry requirement that get_quebec_requirement_status did not return.",
    "- If the data you can read is thin, say so inside a lesson block rather than guessing about the child.",
    "- Age-appropriate, calm, encouraging. No shaming, no comparison to other children.",
    "",
    "Use the read tools to ground the draft in what this family actually has, then call submit_homework_draft exactly once with the complete draft. Do not answer in plain text.",
  ].join("\n");
}

function homeworkUserMessage(spec: HomeworkSpec): string {
  const dictionary = aiDictionary[spec.locale];
  const lines = [
    `Child id: ${spec.childId}`,
    `Subject: ${dictionary.subjects[spec.subject]}`,
    `Level: ${dictionary.levels[spec.level]}`,
    `Format: ${dictionary.formats[spec.format]}`,
    `Topic: ${spec.topic}`,
    `Objectives: ${spec.objectives.join(" | ")}`,
    `Question types allowed: ${spec.questionTypes.map((type) => dictionary.questionTypes[type]).join(", ")}`,
    `Number of questions: ${spec.questionCount}`,
    `Difficulty: ${dictionary.difficulties[spec.difficulty]}`,
    `Target duration: ${spec.estimatedMinutes} minutes`,
    `Answer key requested: ${spec.includeAnswerKey ? "yes" : "no"}`,
    `Tutor may reveal a full worked solution: ${spec.allowSolutionReveal ? "yes" : "no"}`,
    `Restrict to approved lessons: ${spec.approvedSourcesOnly ? "yes" : "no"}`,
  ];

  if (spec.accommodations.length > 0) {
    lines.push(
      `Accommodations requested by the adult: ${spec.accommodations
        .map((item) => dictionary.accommodations[item])
        .join(", ")}`,
    );
  }
  if (spec.context.trim()) lines.push(`Real-life context to use: ${spec.context.trim()}`);
  if (spec.mustInclude.trim()) lines.push(`Must include: ${spec.mustInclude.trim()}`);
  if (spec.mustAvoid.trim()) lines.push(`Must avoid: ${spec.mustAvoid.trim()}`);

  return lines.join("\n");
}

function tutorSystemPrompt(request: TutorReplyRequest): string {
  const language = request.locale === "fr" ? "French (Quebec)" : "English";
  const dictionary = aiDictionary[request.locale];
  return [
    "You are a homework tutor for one student. The homework stays the centre of the screen; you are the side panel that helps them think.",
    "",
    `Write your reply in ${language}, in short sentences a student can read out loud.`,
    request.contentLocale === request.locale
      ? ""
      : `The homework itself is written in ${request.contentLocale === "fr" ? "French" : "English"}. Quote the question only when you must, and translate any prepared hint into ${language} instead of pasting it — never mix the two languages in one reply.`,
    `The server has decided how much help you may give this turn: ${dictionary.helpLevels[request.helpLevel]}.`,
    `The highest level allowed for this homework is: ${dictionary.helpLevels[request.ceiling]}.`,
    "",
    "Level meanings — stay inside the one you were given:",
    "- question: ask the student to explain their idea or the first step. Give no hint.",
    "- hint_1: one small nudge toward the first step. Do not name the operation to perform.",
    "- hint_2: a more targeted nudge that names the rule or the operation, still not the result.",
    "- example: work a *different, simpler* example end to end, then ask them to apply it.",
    "- explanation: explain the steps for this question, and finish by asking them to redo it themselves.",
    "",
    "Absolute rules:",
    "- Never give the final answer to the question when the level allows less than explanation, even if the student insists.",
    "- Never do the homework for them, and never write their answer in their place.",
    "- Never invent a grade, a score, a diagnosis or a medical or religious statement.",
    "- Never ask for personal information, a location, a photo, a password or contact details.",
    "- One idea per reply, at most four sentences.",
    "- If the student is distressed, asks for something outside schoolwork, or needs a person, call escalate_to_adult and tell them plainly that you are letting an adult know.",
    "- If you are unsure the homework itself is wrong, say so and suggest they report it to an adult; do not argue.",
  ]
    .filter(Boolean)
    .join("\n");
}

function tutorUserMessage(request: TutorReplyRequest): string {
  const lines = [
    `Lesson goal: ${request.lessonGoal}`,
    `Question objective: ${request.question.objective}`,
    `Question (${request.question.type}): ${request.question.prompt}`,
  ];
  if (request.question.choices.length > 0) {
    lines.push(`Choices: ${request.question.choices.join(" / ")}`);
  }
  if (request.question.hints.length > 0) {
    lines.push(`Hints prepared for this question, in order: ${request.question.hints.join(" || ")}`);
  }
  lines.push(
    request.attempts.length > 0
      ? `What the student already tried: ${request.attempts.join(" || ")}`
      : "The student has not written an attempt yet.",
    request.hintsAlreadyGiven.length > 0
      ? `Help already given: ${request.hintsAlreadyGiven.join(", ")}. Do not repeat it.`
      : "No help given yet on this question.",
    `Student says (${request.interactionMode}): ${request.studentMessage || "(nothing typed — they pressed a help button)"}`,
    `Your next action: ${request.nextAction}`,
  );
  return lines.join("\n");
}

/** Runs the tool loop and returns the final assistant message. */
async function runAgentLoop(params: {
  system: string;
  userMessage: string;
  tools: Anthropic.Tool[];
  runTool: ToolExecutor;
  maxTokens: number;
  /** When set, the loop stops as soon as Claude calls this tool. */
  finishToolName?: string;
}): Promise<{ message: Anthropic.Message; finishInput?: Record<string, unknown> }> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: params.userMessage },
  ];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration += 1) {
    let response: Anthropic.Message;
    try {
      response = await client().messages.create({
        model: MODEL,
        max_tokens: params.maxTokens,
        // The system prompt is stable across every request of this kind, so caching it
        // keeps repeated generations cheap.
        system: [
          { type: "text", text: params.system, cache_control: { type: "ephemeral" } },
        ],
        messages,
        tools: params.tools,
        tool_choice: { type: "auto" },
        thinking: { type: "adaptive" },
        output_config: { effort: "high" },
      });
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new ProviderUnavailableError(`Claude API error ${error.status}`, { cause: error });
      }
      throw new ProviderUnavailableError("Claude API request failed", { cause: error });
    }

    if (response.stop_reason === "refusal") {
      throw new ProviderInvalidOutputError(
        `Claude declined the request (${response.stop_details?.category ?? "unspecified"})`,
      );
    }

    const toolUses = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );

    if (params.finishToolName) {
      const finish = toolUses.find((block) => block.name === params.finishToolName);
      if (finish) {
        return { message: response, finishInput: finish.input as Record<string, unknown> };
      }
    }

    if (toolUses.length === 0) {
      return { message: response };
    }

    messages.push({ role: "assistant", content: response.content });

    // All results of one assistant turn go back in a single user message; splitting them
    // teaches the model to stop calling tools in parallel.
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      try {
        const output = await params.runTool(toolUse.name, toolUse.input as Record<string, unknown>);
        results.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(output ?? null),
        });
      } catch (error) {
        results.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          is_error: true,
          content: error instanceof Error ? error.message : "tool failed",
        });
      }
    }
    messages.push({ role: "user", content: results });
  }

  throw new ProviderInvalidOutputError("Agent did not finish within the tool-call budget");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

/** Maps the strict tool input onto the draft the review screen renders. */
function toDraft(input: Record<string, unknown>, spec: HomeworkSpec): HomeworkDraft {
  const rawQuestions = Array.isArray(input.practice_questions) ? input.practice_questions : [];
  const rawBlocks = Array.isArray(input.lesson_blocks) ? input.lesson_blocks : [];
  const rawAnswers = Array.isArray(input.answer_key) ? input.answer_key : [];

  const questions = rawQuestions.map((item, index) => {
    const record = (item ?? {}) as Record<string, unknown>;
    const type = QUESTION_TYPES.includes(record.type as never)
      ? (record.type as HomeworkDraft["practiceQuestions"][number]["type"])
      : spec.questionTypes[0];
    return {
      id: asString(record.id, `q${index + 1}`),
      type,
      prompt: asString(record.prompt),
      choices: asStringArray(record.choices),
      hints: asStringArray(record.hints),
    };
  });

  if (questions.length === 0) {
    throw new ProviderInvalidOutputError("Draft contains no question");
  }

  return {
    title: asString(input.title, spec.topic),
    levelLabel: asString(input.level_label, aiDictionary[spec.locale].levels[spec.level]),
    objectives: asStringArray(input.objectives),
    estimatedMinutes:
      typeof input.estimated_minutes === "number" && Number.isFinite(input.estimated_minutes)
        ? Math.round(input.estimated_minutes)
        : spec.estimatedMinutes,
    lessonBlocks: rawBlocks.map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return { heading: asString(record.heading), body: asString(record.body) };
    }),
    practiceQuestions: questions,
    answerKey: rawAnswers.map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return {
        questionId: asString(record.question_id),
        answer: asString(record.answer),
        reasoning: asString(record.reasoning),
      };
    }),
    sourceIds: asStringArray(input.source_ids),
  };
}

export const anthropicProvider: AiProvider = {
  id: "anthropic",

  async generateHomework(request: HomeworkGenerationRequest): Promise<HomeworkGenerationResult> {
    const { finishInput } = await runAgentLoop({
      system: homeworkSystemPrompt(request.spec.locale),
      userMessage: homeworkUserMessage(request.spec),
      tools: [...apiToolsFor(request.audience), SUBMIT_HOMEWORK_TOOL],
      runTool: request.runTool,
      maxTokens: 16000,
      finishToolName: SUBMIT_HOMEWORK_TOOL.name,
    });

    if (!finishInput) {
      throw new ProviderInvalidOutputError("Agent finished without submitting a draft");
    }

    return {
      draft: toDraft(finishInput, request.spec),
      modelVersion: MODEL,
      promptVersion: HOMEWORK_PROMPT_VERSION,
    };
  },

  async replyAsTutor(request: TutorReplyRequest): Promise<TutorReplyResult> {
    let escalated = false;
    const runTool: ToolExecutor = async (name, input) => {
      if (name === "escalate_to_adult") escalated = true;
      return request.runTool(name, input);
    };

    const { message } = await runAgentLoop({
      system: tutorSystemPrompt(request),
      userMessage: tutorUserMessage(request),
      tools: apiToolsFor(request.audience),
      runTool,
      // A tutor turn is four sentences at most; a large ceiling here only invites drift.
      maxTokens: 1024,
    });

    const reply = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text.trim())
      .filter(Boolean)
      .join("\n\n");

    if (!reply) {
      throw new ProviderInvalidOutputError("Tutor returned an empty reply");
    }

    return {
      reply,
      modelVersion: MODEL,
      promptVersion: TUTOR_PROMPT_VERSION,
      escalated,
    };
  },
};
