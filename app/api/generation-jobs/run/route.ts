import { resolveAdultSession } from "@/src/server/session";
import { runWorkerTick } from "@/src/server/generation-worker";
import { getCredits, listJobsForParent } from "@/src/server/store";
import { DEMO_FAMILY } from "@/src/server/demo-data";
import { errorResponse } from "@/src/server/http";

/**
 * Drains the queue once.
 *
 * In production a separate worker process owns this loop; locally the parent triggers it
 * from the queue panel, which keeps the whole flow visible and testable without a daemon.
 */

export const dynamic = "force-dynamic";
// A real generation call is slower than the default serverless budget.
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const session = resolveAdultSession(request);
    const result = await runWorkerTick();
    return Response.json({
      result,
      jobs: listJobsForParent(session.parentId),
      creditsAvailable: getCredits(DEMO_FAMILY.id),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
