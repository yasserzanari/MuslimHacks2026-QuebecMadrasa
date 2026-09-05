import {
  createGenerationJob,
  type GenerationJobType,
} from "@/src/domain/ai-generation-job";
import {
  jsonError,
  readEnum,
  readIdentifier,
  readJsonObject,
  readString,
} from "@/src/domain/api-guards";
import {
  isChildInFamily,
  resolveFamilySession,
} from "@/src/domain/family-session";
import { assertParentCanAccess } from "@/src/domain/parent-ai-tools";

const JOB_TYPES: readonly GenerationJobType[] = [
  "lesson",
  "exercises",
  "weekly_report",
  "explanation",
];

const LOCALES = ["fr", "en"] as const;

const MAX_REQUEST_TEXT = 2_000;
const MAX_SUBJECT = 120;
const MAX_OBJECTIVE = 400;

const DEFAULT_REQUEST_TEXT = "Créer une activité de révision";
const DEFAULT_SUBJECT = "Mathématiques";

export async function POST(request: Request) {
  // L'identité vient de la session, jamais du corps de la requête.
  const session = resolveFamilySession(request);
  if (!session) return jsonError("Authentication required", 401);

  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  // Un corps qui prétend être une autre famille est refusé, pas ignoré.
  if (body.parentId !== undefined && body.parentId !== session.parentId) {
    return jsonError("Forbidden family access", 403);
  }

  const childId =
    body.childId === undefined ? "demo-child" : readIdentifier(body.childId);
  if (!childId) return jsonError("childId is invalid", 400);
  if (!isChildInFamily(session, childId)) {
    return jsonError("Forbidden family access", 403);
  }

  const type =
    body.type === undefined ? "lesson" : readEnum(body.type, JOB_TYPES);
  if (!type) return jsonError("type is invalid", 400);

  const locale = body.locale === undefined ? "fr" : readEnum(body.locale, LOCALES);
  if (!locale) return jsonError("locale is invalid", 400);

  const requestText =
    body.requestText === undefined
      ? DEFAULT_REQUEST_TEXT
      : readString(body.requestText, MAX_REQUEST_TEXT);
  if (!requestText) return jsonError("requestText is invalid", 400);

  const subject =
    body.subject === undefined
      ? DEFAULT_SUBJECT
      : readString(body.subject, MAX_SUBJECT);
  if (!subject) return jsonError("subject is invalid", 400);

  const fallbackObjective =
    locale === "en"
      ? "Practice the week’s objective"
      : "Réviser l’objectif de la semaine";
  const objective =
    body.objective === undefined
      ? fallbackObjective
      : readString(body.objective, MAX_OBJECTIVE);
  if (!objective) return jsonError("objective is invalid", 400);

  const requestId =
    body.requestId === undefined
      ? crypto.randomUUID()
      : readIdentifier(body.requestId);
  if (!requestId) return jsonError("requestId is invalid", 400);

  const context = {
    parentId: session.parentId,
    childId,
    allowedSourceIds: [],
  };

  try {
    assertParentCanAccess(session.parentId, context);
  } catch {
    return jsonError("Forbidden family access", 403);
  }

  const job = createGenerationJob({
    id: crypto.randomUUID(),
    requestId,
    parentId: context.parentId,
    childId: context.childId,
    type,
    requestText,
    creditsReserved: 1,
  });

  const draft = {
    title: locale === "en" ? `Practice · ${subject}` : `Révision · ${subject}`,
    subject,
    objective,
    instructions:
      locale === "en"
        ? "Try each step and explain your reasoning."
        : "Essaie chaque étape et explique ton raisonnement.",
    blocks: [
      {
        type: "warmup",
        title: locale === "en" ? "Warm-up" : "Mise en route",
        prompt:
          locale === "en"
            ? `What do you already know about ${subject.toLowerCase()}?`
            : `Que sais-tu déjà sur ${subject.toLowerCase()} ?`,
      },
      {
        type: "guided-practice",
        title: locale === "en" ? "Guided practice" : "Pratique guidée",
        prompt: objective,
      },
      {
        type: "reflection",
        title: locale === "en" ? "Reflection" : "Réflexion",
        prompt:
          locale === "en"
            ? "What would you try differently next time?"
            : "Que ferais-tu autrement la prochaine fois ?",
      },
    ],
    requiresParentReview: true,
  };

  return Response.json({ ...job, draft }, { status: 201 });
}
