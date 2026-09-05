import "server-only";

import type { HomeworkSpec, QuestionType } from "@/src/domain/ai-homework-spec";
import type { PracticeQuestion } from "@/src/domain/ai-homework-document";
import type { Locale } from "@/src/i18n/locale";
import type {
  AiProvider,
  HomeworkGenerationRequest,
  HomeworkGenerationResult,
  TutorReplyRequest,
  TutorReplyResult,
} from "@/src/server/ai/provider";
import { aiDictionary } from "@/src/i18n/ai-dictionary";

/**
 * Deterministic generator used when `AI_PROVIDER=mock`.
 *
 * It calls no network and needs no key, so the whole queue — creation, worker, review,
 * approval, the student tutor — can be developed and tested without spending anything.
 * The same output for the same spec also makes the browser QA in
 * docs/architecture/07-plan-maitre-pages-et-qa.md repeatable.
 */

const PROMPT_VERSION = "mock-homework-v1";

const COPY = {
  fr: {
    warmup: "Mise en route",
    warmupBody:
      "Relis l'objectif, puis explique dans tes mots ce que tu dois trouver. Tu peux écrire une phrase ou la dire à voix haute.",
    modelStep: "Un exemple ensemble",
    modelBody:
      "On regarde une situation simple du même type. Repère l'étape qui change et note-la avant de commencer les questions.",
    practice: "À toi de jouer",
    practiceBody: "Fais les questions dans l'ordre. Si tu bloques, demande un indice à ton tuteur.",
    trueFalseTail: "Vrai ou faux ? Justifie en une phrase.",
    matchTail: "Associe chaque élément à sa paire.",
    oralTail: "Explique ta réponse à voix haute au tuteur.",
    hint1: "Commence par repérer ce que la question te donne déjà.",
    hint2: "Quelle opération ou quelle règle relie ces informations ?",
    exemple: "Sur un exemple plus simple, on ferait la même étape avant de conclure.",
    answer: "Réponse à vérifier avec un adulte",
    reasoning: "Étapes attendues : lire la consigne, appliquer la règle, vérifier le résultat.",
    unsure: "Je ne suis pas certain de cette étape. Vérifie avec un adulte.",
  },
  en: {
    warmup: "Warm-up",
    warmupBody:
      "Read the objective again, then explain in your own words what you need to find. You can write a sentence or say it out loud.",
    modelStep: "One example together",
    modelBody:
      "Look at a simple situation of the same kind. Spot the step that changes and note it before you start the questions.",
    practice: "Your turn",
    practiceBody: "Work through the questions in order. If you get stuck, ask your tutor for a hint.",
    trueFalseTail: "True or false? Justify in one sentence.",
    matchTail: "Match each item to its pair.",
    oralTail: "Explain your answer out loud to the tutor.",
    hint1: "Start by spotting what the question already gives you.",
    hint2: "Which operation or rule connects those pieces of information?",
    exemple: "On a simpler example, you would do the same step before concluding.",
    answer: "Answer to check with an adult",
    reasoning: "Expected steps: read the instruction, apply the rule, check the result.",
    unsure: "I am not certain about this step. Check with an adult.",
  },
} as const;

/** Small deterministic hash, so the same spec always yields the same worksheet. */
function seedFrom(spec: HomeworkSpec): number {
  const source = `${spec.childId}|${spec.topic}|${spec.subject}|${spec.questionCount}|${spec.difficulty}`;
  let hash = 7;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) % 100000;
  }
  return hash;
}

function difficultyLabel(spec: HomeworkSpec, index: number, locale: Locale): string {
  if (spec.difficulty === "mixed") {
    const share = index / Math.max(1, spec.questionCount - 1);
    if (share < 0.34) return locale === "fr" ? "échauffement" : "warm-up";
    if (share < 0.67) return locale === "fr" ? "standard" : "standard";
    return locale === "fr" ? "défi" : "challenge";
  }
  return aiDictionary[locale].difficulties[spec.difficulty].toLowerCase();
}

function promptFor(
  spec: HomeworkSpec,
  type: QuestionType,
  index: number,
  locale: Locale,
): string {
  const copy = COPY[locale];
  const objective = spec.objectives[index % spec.objectives.length];
  const framing = spec.context.trim()
    ? locale === "fr"
      ? ` En te servant du contexte « ${spec.context.trim()} », `
      : ` Using the context "${spec.context.trim()}", `
    : " ";

  const head =
    locale === "fr"
      ? `Question ${index + 1} (${difficultyLabel(spec, index, locale)}) — ${spec.topic}.${framing}montre comment tu ferais pour : ${objective.toLowerCase()}`
      : `Question ${index + 1} (${difficultyLabel(spec, index, locale)}) — ${spec.topic}.${framing}show how you would: ${objective.toLowerCase()}`;

  switch (type) {
    case "true_false":
      return `${head} ${copy.trueFalseTail}`;
    case "matching":
      return `${head} ${copy.matchTail}`;
    case "oral_practice":
      return `${head} ${copy.oralTail}`;
    default:
      return head;
  }
}

function choicesFor(type: QuestionType, index: number, locale: Locale): string[] {
  if (type === "multiple_choice") {
    return locale === "fr"
      ? [`Proposition A${index + 1}`, `Proposition B${index + 1}`, `Proposition C${index + 1}`]
      : [`Option A${index + 1}`, `Option B${index + 1}`, `Option C${index + 1}`];
  }
  if (type === "matching") {
    return locale === "fr"
      ? [`Élément ${index + 1}`, `Paire ${index + 1}`]
      : [`Item ${index + 1}`, `Pair ${index + 1}`];
  }
  if (type === "true_false") {
    return locale === "fr" ? ["Vrai", "Faux"] : ["True", "False"];
  }
  return [];
}

function buildQuestions(spec: HomeworkSpec): PracticeQuestion[] {
  const locale = spec.locale;
  const copy = COPY[locale];
  const seed = seedFrom(spec);

  return Array.from({ length: spec.questionCount }, (_, index) => {
    const type = spec.questionTypes[(seed + index) % spec.questionTypes.length];
    return {
      id: `q${index + 1}`,
      type,
      prompt: promptFor(spec, type, index, locale),
      choices: choicesFor(type, index, locale),
      hints: [copy.hint1, copy.hint2, copy.exemple],
    };
  });
}

export const mockProvider: AiProvider = {
  id: "mock",

  async generateHomework(request: HomeworkGenerationRequest): Promise<HomeworkGenerationResult> {
    const { spec, approvedLessons } = request;
    const locale = spec.locale;
    const copy = COPY[locale];
    const dictionary = aiDictionary[locale];
    const questions = buildQuestions(spec);

    // Even the mock goes through a tool, so the queue exercises the authorized path. It
    // searches with the raw topic and finds nothing when the family has no matching
    // approved lesson — the draft is then flagged "no source" for the reviewer. The real
    // provider lets the model choose the search terms instead.
    const matching = (await request
      .runTool("search_approved_lessons", { query: spec.topic })
      .catch(() => approvedLessons)) as typeof approvedLessons;

    const sourceIds = (Array.isArray(matching) ? matching : approvedLessons)
      .slice(0, 3)
      .map((lesson) => lesson.id);

    const accommodationNote =
      spec.accommodations.length > 0
        ? `${locale === "fr" ? "Adaptations demandées" : "Requested accommodations"}: ${spec.accommodations
            .map((item) => dictionary.accommodations[item])
            .join(", ")}.`
        : "";

    return {
      modelVersion: "mock-generator-1.0",
      promptVersion: PROMPT_VERSION,
      draft: {
        title: `${dictionary.subjects[spec.subject]} — ${spec.topic}`,
        levelLabel: dictionary.levels[spec.level],
        objectives: spec.objectives,
        estimatedMinutes: spec.estimatedMinutes,
        lessonBlocks: [
          { heading: copy.warmup, body: [copy.warmupBody, accommodationNote].filter(Boolean).join(" ") },
          { heading: copy.modelStep, body: copy.modelBody },
          { heading: copy.practice, body: copy.practiceBody },
        ],
        practiceQuestions: questions,
        answerKey: spec.includeAnswerKey
          ? questions.map((question) => ({
              questionId: question.id,
              answer: `${copy.answer} — ${question.id}`,
              reasoning: copy.reasoning,
            }))
          : [],
        sourceIds,
      },
    };
  },

  async replyAsTutor(request: TutorReplyRequest): Promise<TutorReplyResult> {
    const copy = COPY[request.locale];
    const dictionary = aiDictionary[request.locale];
    const { question, helpLevel } = request;
    // The prepared hints are written in the homework's language. Reusing them on an
    // interface set to the other language would put two languages on one screen, which
    // docs/architecture/05-internationalisation-fr-en.md forbids.
    const preparedHints = request.contentLocale === request.locale ? question.hints : [];

    const reply = (() => {
      switch (helpLevel) {
        case "question": {
          // The objective is homework content: quote it only when the student is reading
          // the language it was written in.
          const objective =
            request.contentLocale === request.locale ? `${question.objective}. ` : "";
          return request.locale === "fr"
            ? `Avant de chercher : ${objective}Dis-moi ce que la question te donne déjà, et ce que tu dois trouver.`
            : `Before we search: ${objective}Tell me what the question already gives you, and what you need to find.`;
        }
        case "hint_1":
          return preparedHints[0] ?? copy.hint1;
        case "hint_2":
          return preparedHints[1] ?? copy.hint2;
        case "example":
          return preparedHints[2] ?? copy.exemple;
        case "explanation":
          return request.locale === "fr"
            ? `${copy.reasoning} Reprends maintenant la question avec ces étapes et dis-moi ce que tu obtiens.`
            : `${copy.reasoning} Now redo the question with those steps and tell me what you get.`;
      }
    })();

    const levelLabel = dictionary.helpLevels[helpLevel];
    return {
      reply: `${levelLabel} — ${reply}`,
      modelVersion: "mock-tutor-1.0",
      promptVersion: "mock-tutor-v1",
      escalated: false,
    };
  },
};
