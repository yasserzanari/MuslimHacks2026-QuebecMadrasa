import { applyAction, buildDraft, creditsUsed, enqueueJob, listJobs, monthlyCredits, type QueueAction } from "@/src/domain/generation-queue";

const actions: QueueAction[] = ["cancel", "approve", "reject", "retry", "add_to_plan"];

export async function GET() {
  const jobs = listJobs();
  return Response.json({ jobs, credits: { used: creditsUsed(), total: monthlyCredits } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = body.locale === "en" ? "en" : "fr";
  const subject = body.subject ?? "Mathématiques";
  const objective = body.objective ?? (locale === "en" ? "Practice the week’s objective" : "Réviser l’objectif de la semaine");
  const type = body.type ?? "lesson";

  let job;
  try {
    job = enqueueJob({
      type,
      subject,
      objective,
      requestText: body.requestText ?? "Créer une activité de révision",
      childId: body.childId ?? "demo-child",
      parentId: body.parentId ?? "demo-parent",
      locale,
      sourceSnapshotIds: Array.isArray(body.sourceSnapshotIds) ? body.sourceSnapshotIds : [],
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "queue_error";
    return Response.json({ error: code }, { status: code === "credit_limit_reached" ? 429 : 400 });
  }

  const draft = buildDraft({ type, subject, objective, locale, sources: job.sourceSnapshotIds });
  return Response.json({ ...job, draft, credits: { used: creditsUsed(), total: monthlyCredits } }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.jobId || !actions.includes(body.action)) {
    return Response.json({ error: "invalid_action" }, { status: 400 });
  }
  try {
    const job = applyAction(body.jobId, body.action);
    return Response.json({ job, credits: { used: creditsUsed(), total: monthlyCredits } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "queue_error";
    return Response.json({ error: code }, { status: code === "job_not_found" ? 404 : 409 });
  }
}
