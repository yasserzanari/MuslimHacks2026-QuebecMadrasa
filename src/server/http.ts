import "server-only";

import { ForbiddenAccessError } from "@/src/domain/parent-ai-tools";
import { InsufficientCreditsError, NotFoundError } from "@/src/server/parent-tools";

/**
 * One place where server errors become HTTP responses.
 *
 * The body carries an error *code*, never a sentence: the client renders it through the
 * dictionary, so a French parent and an English tutor each get their own language on the
 * same failure (docs/architecture/05-internationalisation-fr-en.md).
 */

export interface ApiErrorBody {
  error: string;
  /** Field-level problems, also as dictionary keys. */
  issues?: Array<{ field: string; messageKey: string }>;
}

export function jsonError(
  code: string,
  status: number,
  issues?: ApiErrorBody["issues"],
): Response {
  const body: ApiErrorBody = { error: code };
  if (issues?.length) body.issues = issues;
  return Response.json(body, { status });
}

/** Maps a thrown domain error onto a status. Unknown errors never leak their message. */
export function errorResponse(error: unknown): Response {
  if (error instanceof ForbiddenAccessError) return jsonError("forbidden", 403);
  if (error instanceof NotFoundError) return jsonError("not_found", 404);
  if (error instanceof InsufficientCreditsError) return jsonError("insufficient_credits", 402);
  if (error instanceof Error && error.message.startsWith("Invalid transition")) {
    return jsonError("invalid_request", 409);
  }
  console.error("[api] unexpected error", error);
  return jsonError("unknown", 500);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
