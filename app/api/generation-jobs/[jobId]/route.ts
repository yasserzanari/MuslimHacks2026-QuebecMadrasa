import { resolveAdultSession } from "@/src/server/session";
import { contextFor, parentAiTools } from "@/src/server/parent-tools";
import { getDocument } from "@/src/server/store";
import { errorResponse } from "@/src/server/http";

/** One job plus its draft, for the review panel. */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } },
) {
  try {
    const session = resolveAdultSession(request);
    const context = contextFor({
      parentId: session.parentId,
      childId: "child-adam",
      locale: "fr",
      role: session.role,
    });

    const job = await parentAiTools.getGenerationJob(context, params.jobId);
    const document = job.outputDocumentId ? getDocument(job.outputDocumentId) : undefined;

    return Response.json({ job, document: document ?? null });
  } catch (error) {
    return errorResponse(error);
  }
}
