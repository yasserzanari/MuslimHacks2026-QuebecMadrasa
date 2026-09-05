import { resolveAdultSession } from "@/src/server/session";
import {
  contextFor,
  parentAiTools,
  rejectGeneratedContent,
} from "@/src/server/parent-tools";
import { publishApprovedLesson } from "@/src/server/generation-worker";
import { getCredits, getDocument } from "@/src/server/store";
import { DEMO_FAMILY } from "@/src/server/demo-data";
import { errorResponse, jsonError, readJson } from "@/src/server/http";

/**
 * The human decision. Nothing an AI can call: approving, rejecting and cancelling are
 * the three actions the docs reserve for a person, and `approve_generated_content` is
 * deliberately granted to no agent audience.
 */

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: { jobId: string } },
) {
  try {
    const session = resolveAdultSession(request);
    const body = await readJson(request);
    const action = String(body.action ?? "");
    const note = typeof body.note === "string" ? body.note : undefined;

    const context = contextFor({
      parentId: session.parentId,
      childId: "child-adam",
      locale: "fr",
      role: session.role,
    });

    switch (action) {
      case "approve": {
        const job = await parentAiTools.approveGeneratedContent(context, params.jobId, note);
        // Approval publishes the lesson so the student can open it. Scheduling it into the
        // week plan stays a separate manual action.
        const lesson = publishApprovedLesson(job);
        return Response.json({ job, lessonId: lesson?.id ?? null });
      }
      case "reject": {
        const job = await rejectGeneratedContent(context, params.jobId, note);
        return Response.json({ job, lessonId: null });
      }
      case "cancel": {
        const job = await parentAiTools.cancelGenerationJob(context, params.jobId);
        return Response.json({
          job,
          lessonId: null,
          creditsAvailable: getCredits(DEMO_FAMILY.id),
        });
      }
      default:
        return jsonError("invalid_request", 400);
    }
  } catch (error) {
    return errorResponse(error);
  }
}

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
    return Response.json({
      job,
      document: job.outputDocumentId ? getDocument(job.outputDocumentId) ?? null : null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
