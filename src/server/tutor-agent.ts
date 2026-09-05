import "server-only";

import { randomUUID } from "node:crypto";

import type { Locale } from "@/src/i18n/locale";
import type { HelpLevel, InteractionMode, TutorSessionState } from "@/src/domain/ai-tutor-session";
import {
  createTutorSession,
  decideTutorTurn,
  recordTutorTurn,
  summarizeForParent,
} from "@/src/domain/ai-tutor-session";
import { isToolAllowed } from "@/src/domain/ai-tool-registry";
import type { HomeworkQuestionRecord, StudentLesson } from "@/src/domain/learning-records";
import { aiDictionary } from "@/src/i18n/ai-dictionary";
import { ForbiddenAccessError } from "@/src/domain/parent-ai-tools";
import { getAiProvider } from "@/src/server/ai";
import type { ToolExecutor } from "@/src/server/ai/provider";
import { DEMO_APPROVED_LESSONS, findChild } from "@/src/server/demo-data";
import {
  getLesson,
  getTutorSession,
  recordEscalation,
  saveTutorSession,
} from "@/src/server/store";
import { NotFoundError } from "@/src/server/parent-tools";

/**
 * The student-facing agent.
 *
 * The order here is the guardrail: the server decides the help level *before* the model is
 * called, and checks the model's answer *after* it comes back. A student cannot raise their
 * own help level, and the browser holds neither the key nor the rules
 * (docs/plan/services/04-tuteur-ia-eleve.md).
 */

export interface TutorTurnInput {
  studentId: string;
  lessonId: string;
  questionId: string;
  message: string;
  interactionMode: InteractionMode;
  requestedHelp?: "hint" | "question" | "explain_differently";
  locale: Locale;
}

export interface TutorTurnResponse {
  reply: string;
  helpLevel: HelpLevel;
  ceiling: HelpLevel;
  hintsUsed: number;
  attempts: number;
  turnCount: number;
  /** Dictionary keys the student sees as small notices under the reply. */
  noticeCodes: string[];
  escalated: boolean;
  modelVersion: string;
}

/** A tutor reply is short by contract; anything longer is a drifting model. */
const MAX_REPLY_SENTENCES = 5;
const MAX_REPLY_CHARS = 700;

const FORBIDDEN_REPLY_PATTERNS = [
  /\b(tu as|you (have|are))\s+(échoué|failed)\b/i,
  /\b(dyslexi|dysorthograph|tdah|adhd|autis|diagnostic|diagnosis)\w*/i,
  /\b(mot de passe|password|adresse|address|num[ée]ro de t[ée]l[ée]phone|phone number)\b/i,
];

function findQuestion(lesson: StudentLesson, questionId: string): HomeworkQuestionRecord {
  const question = lesson.questions.find((item) => item.id === questionId);
  if (!question) throw new NotFoundError(`Question ${questionId} not found`);
  return question;
}

/**
 * Trims and screens the model's reply.
 * Anything that trips a forbidden pattern is replaced rather than shown to a child.
 */
function filterTutorReply(reply: string, locale: Locale): { text: string; replaced: boolean } {
  const cleaned = reply.replace(/\s+/g, " ").trim();

  if (FORBIDDEN_REPLY_PATTERNS.some((pattern) => pattern.test(cleaned))) {
    return {
      text:
        locale === "fr"
          ? "Je préfère ne pas répondre à ça. Demande à un adulte, et on reprend le devoir ensemble après."
          : "I would rather not answer that. Ask an adult, and we will pick the homework back up after.",
      replaced: true,
    };
  }

  const sentences = cleaned.split(/(?<=[.!?…])\s+/).slice(0, MAX_REPLY_SENTENCES).join(" ");
  return { text: sentences.slice(0, MAX_REPLY_CHARS), replaced: false };
}

/** Read-only tools for the student agent, plus the one escalation it may write. */
function createStudentToolExecutor(input: {
  studentId: string;
  lesson: StudentLesson;
  session: TutorSessionState;
  onEscalate: (reason: string, note: string) => void;
}): ToolExecutor {
  return async (name, toolInput) => {
    if (!isToolAllowed(name, "student_agent")) {
      throw new ForbiddenAccessError(`Tool ${name} is not available to the student tutor`);
    }

    switch (name) {
      case "get_homework_question": {
        const question = findQuestion(input.lesson, String(toolInput.questionId ?? ""));
        return {
          id: question.id,
          type: question.type,
          prompt: question.prompt,
          choices: question.choices,
          hints: question.hints,
          objective: question.objective,
        };
      }
      case "get_student_attempt_history":
        return {
          questionId: input.session.questionId,
          attempts: input.session.attempts,
          hintsAlreadyGiven: input.session.hintsUsed,
          turnCount: input.session.turnCount,
        };
      case "search_approved_lessons": {
        const needle = String(toolInput.query ?? "").toLowerCase();
        return DEMO_APPROVED_LESSONS.filter((lesson) =>
          [lesson.titleFr, lesson.titleEn, ...lesson.objectives]
            .join(" ")
            .toLowerCase()
            .includes(needle),
        ).map((lesson) => ({ id: lesson.id, title: lesson.titleFr, objectives: lesson.objectives }));
      }
      case "escalate_to_adult": {
        const reason = String(toolInput.reason ?? "needs_human_help");
        const note = String(toolInput.note ?? "");
        input.onEscalate(reason, note);
        return { acknowledged: true };
      }
      default:
        throw new ForbiddenAccessError(`Unknown tool ${name}`);
    }
  };
}

export async function runTutorTurn(input: TutorTurnInput): Promise<TutorTurnResponse> {
  const lesson = getLesson(input.lessonId);
  if (!lesson) throw new NotFoundError(`Lesson ${input.lessonId} not found`);

  // A student may only open a lesson that belongs to them.
  const child = findChild(input.studentId);
  if (!child || lesson.childId !== child.id) {
    throw new ForbiddenAccessError("This lesson does not belong to this student");
  }

  const question = findQuestion(lesson, input.questionId);
  const session =
    getTutorSession(input.studentId, input.lessonId, input.questionId) ??
    createTutorSession({
      lessonId: lesson.id,
      questionId: question.id,
      studentId: input.studentId,
      locale: lesson.locale,
      lessonGoal: lesson.goal,
      allowSolutionReveal: lesson.allowSolutionReveal,
    });

  const decision = decideTutorTurn(session, {
    studentMessage: input.message,
    interactionMode: input.interactionMode,
    requestedHelp: input.requestedHelp,
  });

  const locale = input.locale ?? session.locale;
  const dictionary = aiDictionary[locale];

  // Blocked turns never reach the model: distress, off-topic and the turn ceiling are
  // handled by the server with a fixed, translated message.
  if (decision.blocked) {
    if (decision.nextAction === "escalate_to_adult") {
      recordEscalation({
        id: randomUUID(),
        studentId: input.studentId,
        lessonId: lesson.id,
        questionId: question.id,
        reason: decision.noticeCodes[0] ?? "needs_human_help",
        note: input.message.slice(0, 300),
        createdAt: new Date().toISOString(),
        seenByAdult: false,
      });
    }

    const updated = saveTutorSession(recordTutorTurn(session, decision, input.message));
    const summary = summarizeForParent(updated);
    return {
      reply: decision.noticeCodes.map((code) => dictionary.notices[code]).filter(Boolean).join(" "),
      helpLevel: decision.helpLevel,
      ceiling: decision.ceiling,
      hintsUsed: summary.hintsUsed,
      attempts: summary.attemptCount,
      turnCount: updated.turnCount,
      noticeCodes: decision.noticeCodes,
      escalated: updated.escalated,
      modelVersion: "server-guardrail",
    };
  }

  let escalatedByTool = false;
  const runTool = createStudentToolExecutor({
    studentId: input.studentId,
    lesson,
    session,
    onEscalate: (reason, note) => {
      escalatedByTool = true;
      recordEscalation({
        id: randomUUID(),
        studentId: input.studentId,
        lessonId: lesson.id,
        questionId: question.id,
        reason,
        note,
        createdAt: new Date().toISOString(),
        seenByAdult: false,
      });
    },
  });

  const provider = await getAiProvider();
  const result = await provider.replyAsTutor({
    locale,
    contentLocale: lesson.locale,
    lessonGoal: lesson.goal,
    question,
    studentMessage: input.message,
    attempts: session.attempts,
    hintsAlreadyGiven: session.hintsUsed,
    helpLevel: decision.helpLevel,
    ceiling: decision.ceiling,
    nextAction: decision.nextAction,
    interactionMode: input.interactionMode,
    audience: "student_agent",
    runTool,
  });

  const filtered = filterTutorReply(result.reply, locale);
  const updated = saveTutorSession({
    ...recordTutorTurn(session, decision, input.message),
    escalated: session.escalated || escalatedByTool || result.escalated,
  });
  const summary = summarizeForParent(updated);

  return {
    reply: filtered.text,
    helpLevel: decision.helpLevel,
    ceiling: decision.ceiling,
    hintsUsed: summary.hintsUsed,
    attempts: summary.attemptCount,
    turnCount: updated.turnCount,
    noticeCodes: filtered.replaced ? ["noticeOffTopic"] : decision.noticeCodes,
    escalated: updated.escalated,
    modelVersion: result.modelVersion,
  };
}

/** What the parent dashboard reads after a lesson: progress, not a transcript. */
export function tutorProgressForParent(studentId: string, lessonId: string) {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  return lesson.questions
    .map((question) => getTutorSession(studentId, lessonId, question.id))
    .filter((state): state is TutorSessionState => !!state)
    .map(summarizeForParent);
}
