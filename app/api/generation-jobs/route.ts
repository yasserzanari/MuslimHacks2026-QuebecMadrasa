import { buildDraftPreview, cancelGenerationJob, getCreditsBalance, listGenerationJobs, queueGenerationJob, retryGenerationJob } from "@/src/domain/ai-generation-job";

export async function GET() {
  return Response.json({ jobs: listGenerationJobs(), credits: getCreditsBalance(), mode: "local" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = body.locale === "en" ? "en" : "fr";
  const subject = body.subject ?? "Mathématiques";
  const objective = body.objective ?? (locale === "en" ? "Practice the week’s objective" : "Réviser l’objectif de la semaine");
  const result = queueGenerationJob({
    parentId: body.parentId,
    childId: body.childId ?? "demo-child",
    childName: body.childName,
    type: body.type ?? "lesson",
    requestText: body.requestText ?? "Créer une activité de révision",
    subject,
    locale,
  });
  if ("error" in result) return Response.json({ error: result.error }, { status: 402 });
  return Response.json({ ...result.job, draft: buildDraftPreview(subject, objective, locale) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.jobId || (body.action !== "cancel" && body.action !== "retry")) {
    return Response.json({ error: "jobId and a valid action are required" }, { status: 400 });
  }
  const result = body.action === "cancel" ? cancelGenerationJob(body.jobId) : retryGenerationJob(body.jobId);
  if ("error" in result) {
    const status = result.error === "not_found" ? 404 : result.error === "insufficient_credits" ? 402 : 409;
    return Response.json({ error: result.error }, { status });
  }
  return Response.json({ ok: true, job: result.job, credits: getCreditsBalance() });
}
