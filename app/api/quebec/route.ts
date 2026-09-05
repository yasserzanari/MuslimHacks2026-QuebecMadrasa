/**
 * Adaptateur mock du Parcours Québec — prototype local.
 *
 * Volontairement SANS ÉTAT. Le module n'a ni authentification ni base de
 * données ; un stockage partagé en mémoire serait lisible par n'importe quel
 * navigateur et enfreindrait la séparation stricte des familles exigée par
 * `docs/architecture/04-securite-et-donnees.md`. La route se contente donc de
 * calculer et de valider : rien n'est conservé entre deux requêtes, et rien
 * n'est transmis au gouvernement.
 */

import {
  computeQuebecDeadlines,
  isValidIsoDate,
} from "@/src/domain/quebec-deadlines";
import { quebecEvaluationModes } from "@/src/domain/quebec-requirements";
import {
  canAdvanceSubmission,
  submissionTransitions,
  type EvaluationMode,
  type SubmissionStatus,
} from "@/src/domain/quebec-types";

const MAX_BODY_BYTES = 8_000;

function badRequest(error: string): Response {
  return Response.json({ success: false, error }, { status: 400 });
}

function readEvaluationMode(raw: string | null): EvaluationMode | undefined {
  if (!raw) return undefined;
  const match = quebecEvaluationModes.find((mode) => mode.id === raw);
  return match?.id;
}

function readIsoDate(raw: string | null): string | undefined {
  if (!raw) return undefined;
  return isValidIsoDate(raw) ? raw : undefined;
}

export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;

  const schoolYear = params.get("schoolYear");
  if (!schoolYear) return badRequest("schoolYear is required");

  const now = readIsoDate(params.get("now"));
  if (!now) return badRequest("now must be an ISO date (YYYY-MM-DD)");

  const computation = computeQuebecDeadlines({
    anchors: {
      schoolYear,
      schoolExitDate: readIsoDate(params.get("exitDate")),
      projectImplementationDate: readIsoDate(params.get("implementationDate")),
    },
    now,
    evaluationMode: readEvaluationMode(params.get("mode")),
  });

  return Response.json({ success: true, data: computation });
}

function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(submissionTransitions, value)
  );
}

/**
 * Valide une transition de statut sans rien enregistrer. Le navigateur garde
 * l'état local ; la route sert à vérifier que la machine à états l'autorise.
 */
export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return badRequest("Payload too large");

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return badRequest("Body must be valid JSON");
  }

  if (typeof body !== "object" || body === null) {
    return badRequest("Body must be an object");
  }

  const { from, to } = body as Record<string, unknown>;
  if (!isSubmissionStatus(from)) return badRequest("Unknown source status");
  if (!isSubmissionStatus(to)) return badRequest("Unknown target status");

  const allowed = canAdvanceSubmission(from, to);
  return Response.json({
    success: true,
    data: { from, to, allowed, nextStatuses: submissionTransitions[from] },
  });
}
