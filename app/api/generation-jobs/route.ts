import { randomUUID } from "node:crypto";

import { parseHomeworkSpec, estimateCredits } from "@/src/domain/ai-homework-spec";
import { resolveLocale } from "@/src/i18n/locale";
import { assertChildBelongsToFamily, resolveAdultSession } from "@/src/server/session";
import { contextFor, parentAiTools } from "@/src/server/parent-tools";
import { getCredits, listJobsForParent } from "@/src/server/store";
import { DEMO_FAMILY } from "@/src/server/demo-data";
import { errorResponse, jsonError, readJson } from "@/src/server/http";

/**
 * The queue endpoint used by the Homework Studio.
 *
 * POST validates the adult's specification, reserves credits and returns the queued job.
 * It never generates anything inline: generation is the worker's job, so the interface
 * answers in well under the two seconds the acceptance criteria ask for.
 */

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = resolveAdultSession(request);
    return Response.json({
      jobs: listJobsForParent(session.parentId),
      creditsAvailable: getCredits(DEMO_FAMILY.id),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = resolveAdultSession(request);
    const body = await readJson(request);

    const result = parseHomeworkSpec(body.spec);
    if (!result.ok || !result.spec) {
      return jsonError("invalid_request", 422, result.issues);
    }

    const spec = result.spec;
    // The child id arrives from the browser, so it is re-checked against the session's
    // family before any tool runs.
    assertChildBelongsToFamily(spec.childId, session.familyId);

    const context = contextFor({
      parentId: session.parentId,
      childId: spec.childId,
      locale: spec.locale,
      role: session.role,
    });

    const job = await parentAiTools.createGenerationJob({
      context,
      // A client-supplied request id makes a double submit idempotent.
      requestId: typeof body.requestId === "string" && body.requestId ? body.requestId : randomUUID(),
      type: spec.format === "project" ? "lesson" : "exercises",
      requestText: `${spec.topic} — ${spec.objectives.join(" / ")}`,
      spec,
    });

    return Response.json(
      {
        job,
        creditsReserved: estimateCredits(spec),
        creditsAvailable: getCredits(DEMO_FAMILY.id),
        locale: resolveLocale(spec.locale),
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
