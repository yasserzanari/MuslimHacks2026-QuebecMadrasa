import type { Locale } from "@/src/i18n/locale";

/**
 * Student tutor session — the rules the server enforces before the model is even called.
 *
 * The pedagogical contract in docs/plan/services/04-tuteur-ia-eleve.md is deliberately
 * mechanical: the *server* decides how much help is allowed next, not the model and not
 * the browser. A student who types "just give me the answer" moves the ladder up by one
 * step at most, and only reaches a worked solution when the pathway authorizes it.
 */

export const HELP_LEVELS = ["question", "hint_1", "hint_2", "example", "explanation"] as const;
export type HelpLevel = (typeof HELP_LEVELS)[number];

export type InteractionMode = "text" | "voice";

export type TutorNextAction =
  | "await_student_reasoning"
  | "await_student_attempt"
  | "offer_next_hint"
  | "confirm_answer"
  | "suggest_break"
  | "escalate_to_adult";

/** Per-question message ceiling, so a lesson cannot turn into an endless chat. */
export const MAX_TURNS_PER_QUESTION = 12;

export interface TutorSessionState {
  lessonId: string;
  questionId: string;
  studentId: string;
  locale: Locale;
  lessonGoal: string;
  /** How far up the ladder this student has already been taken on this question. */
  helpLevel: HelpLevel;
  hintsUsed: HelpLevel[];
  attempts: string[];
  turnCount: number;
  /** From the homework spec: whether a full worked solution may ever be shown. */
  allowSolutionReveal: boolean;
  escalated: boolean;
}

export interface TutorTurnRequest {
  studentMessage: string;
  interactionMode: InteractionMode;
  /** Set when the student pressed "Give me a hint" instead of writing a question. */
  requestedHelp?: "hint" | "question" | "explain_differently";
}

export interface TutorTurnDecision {
  /** The level the model is allowed to write at. Never above `ceiling`. */
  helpLevel: HelpLevel;
  ceiling: HelpLevel;
  nextAction: TutorNextAction;
  /** Machine-readable reasons, rendered to the student through the dictionary. */
  noticeCodes: string[];
  /** True when the student asked outright for the answer. */
  directAnswerRequested: boolean;
  blocked: boolean;
}

export function createTutorSession(input: {
  lessonId: string;
  questionId: string;
  studentId: string;
  locale: Locale;
  lessonGoal: string;
  allowSolutionReveal: boolean;
}): TutorSessionState {
  return {
    ...input,
    helpLevel: "question",
    hintsUsed: [],
    attempts: [],
    turnCount: 0,
    escalated: false,
  };
}

/**
 * Phrases that mean "do the work for me". Matching one is not a failure — it is the
 * normal moment to ask the student what they already tried.
 */
const DIRECT_ANSWER_PATTERNS = [
  /\b(donne|donnes|dis|dis-moi|donne-moi|c'?est quoi)\b[^?]{0,30}\b(la\s+)?(r[ée]ponse|solution|r[ée]sultat)\b/i,
  /\b(fais|fait|r[ée]sous|r[ée]souds|corrige)\b[^?]{0,20}\b(le\s+)?(devoir|exercice|probl[èe]me|num[ée]ro)\b/i,
  /\b(just|give|tell)\s+(me\s+)?(the\s+)?(answer|solution|result)\b/i,
  /\b(do|solve|finish)\s+(it|this|my\s+homework|the\s+problem)\s*(for\s+me)?\b/i,
  /\bwhat'?s\s+the\s+answer\b/i,
];

/** Signals that a person, not a tutor, should take over. */
const ESCALATION_PATTERNS = [
  /\b(je suis triste|je pleure|j'?ai peur|personne ne m'?aime|je veux mourir|je me fais mal)\b/i,
  /\b(i'?m sad|i'?m scared|i want to die|hurt myself|nobody likes me|bullied|intimid)\w*\b/i,
];

/** Requests that are not schoolwork and belong to a parent. */
const OFF_TOPIC_PATTERNS = [
  /\b(mot de passe|password|carte de cr[ée]dit|credit card|adresse|address|num[ée]ro de t[ée]l[ée]phone|phone number)\b/i,
  /\b(ach[eè]te|acheter|buy|order|commande)\b.{0,20}\b(en ligne|online|app|jeu|game)\b/i,
];

export function detectsDirectAnswerRequest(message: string): boolean {
  return DIRECT_ANSWER_PATTERNS.some((pattern) => pattern.test(message));
}

export function needsAdultEscalation(message: string): boolean {
  return ESCALATION_PATTERNS.some((pattern) => pattern.test(message));
}

export function isOffTopic(message: string): boolean {
  return OFF_TOPIC_PATTERNS.some((pattern) => pattern.test(message));
}

/** The highest level this session may ever reach. */
export function ceilingFor(state: TutorSessionState): HelpLevel {
  return state.allowSolutionReveal ? "explanation" : "example";
}

function levelIndex(level: HelpLevel): number {
  return HELP_LEVELS.indexOf(level);
}

function nextLevel(level: HelpLevel, ceiling: HelpLevel): HelpLevel {
  const target = Math.min(levelIndex(level) + 1, levelIndex(ceiling));
  return HELP_LEVELS[target];
}

/**
 * Decides what the model is allowed to produce for this turn.
 *
 * Called before the provider request; the resulting `helpLevel` is both an instruction to
 * the model and the value the response is checked against afterwards.
 */
export function decideTutorTurn(
  state: TutorSessionState,
  request: TutorTurnRequest,
): TutorTurnDecision {
  const ceiling = ceilingFor(state);
  const noticeCodes: string[] = [];
  const message = request.studentMessage.trim();

  if (needsAdultEscalation(message)) {
    return {
      helpLevel: state.helpLevel,
      ceiling,
      nextAction: "escalate_to_adult",
      noticeCodes: ["noticeAdultNeeded"],
      directAnswerRequested: false,
      blocked: true,
    };
  }

  if (isOffTopic(message)) {
    return {
      helpLevel: state.helpLevel,
      ceiling,
      nextAction: "escalate_to_adult",
      noticeCodes: ["noticeOffTopic"],
      directAnswerRequested: false,
      blocked: true,
    };
  }

  if (state.turnCount >= MAX_TURNS_PER_QUESTION) {
    return {
      helpLevel: state.helpLevel,
      ceiling,
      nextAction: "suggest_break",
      noticeCodes: ["noticeTurnLimit"],
      directAnswerRequested: false,
      blocked: true,
    };
  }

  const directAnswerRequested = detectsDirectAnswerRequest(message);
  if (directAnswerRequested) noticeCodes.push("noticeNoDirectAnswer");

  // The very first turn is always a question back to the student, whatever they typed:
  // the tutor's job starts by finding out what they already understand. From the second
  // turn on the ladder can move, otherwise a student who never writes an attempt would be
  // stuck at "question" forever.
  const hasAttempt = state.attempts.length > 0;
  let helpLevel: HelpLevel;

  if (state.turnCount === 0) {
    helpLevel = "question";
    noticeCodes.push("noticeExplainYourIdea");
  } else if (request.requestedHelp === "hint" || directAnswerRequested) {
    helpLevel = nextLevel(state.helpLevel, ceiling);
  } else if (request.requestedHelp === "question") {
    helpLevel = "question";
  } else if (request.requestedHelp === "explain_differently") {
    // Rephrasing is not more help: stay at the level already reached.
    helpLevel = state.helpLevel === "question" ? "question" : state.helpLevel;
  } else {
    helpLevel = state.helpLevel;
  }

  if (levelIndex(helpLevel) >= levelIndex(ceiling) && !state.allowSolutionReveal) {
    noticeCodes.push("noticeSolutionLocked");
  }

  const nextAction: TutorNextAction =
    helpLevel === "question"
      ? "await_student_reasoning"
      : helpLevel === "explanation"
        ? "confirm_answer"
        : hasAttempt
          ? "offer_next_hint"
          : "await_student_attempt";

  return { helpLevel, ceiling, nextAction, noticeCodes, directAnswerRequested, blocked: false };
}

/** Applies a completed turn. Kept pure so the same rules hold wherever state is stored. */
export function recordTutorTurn(
  state: TutorSessionState,
  decision: TutorTurnDecision,
  studentMessage: string,
): TutorSessionState {
  // Anything the student actually writes or says is an attempt. Pressing a help button
  // sends an empty message, and "give me the answer" is a request, not an attempt.
  const isAttempt = studentMessage.trim().length > 0 && !decision.directAnswerRequested;

  return {
    ...state,
    helpLevel: decision.helpLevel,
    hintsUsed:
      decision.helpLevel === "question" || state.hintsUsed.includes(decision.helpLevel)
        ? state.hintsUsed
        : [...state.hintsUsed, decision.helpLevel],
    attempts: isAttempt ? [...state.attempts, studentMessage.trim()] : state.attempts,
    turnCount: state.turnCount + 1,
    escalated: state.escalated || decision.nextAction === "escalate_to_adult",
  };
}

/**
 * What the parent sees afterwards: progress, not a transcript.
 * docs/plan/services/04-tuteur-ia-eleve.md asks for a progress summary that does not
 * expose a conversation unnecessarily.
 */
export function summarizeForParent(state: TutorSessionState): {
  questionId: string;
  hintsUsed: number;
  highestHelpLevel: HelpLevel;
  attemptCount: number;
  escalated: boolean;
} {
  return {
    questionId: state.questionId,
    hintsUsed: state.hintsUsed.length,
    highestHelpLevel: state.helpLevel,
    attemptCount: state.attempts.length,
    escalated: state.escalated,
  };
}
