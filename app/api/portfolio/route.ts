import { addComment, addEvidence, deleteEvidence, listEvidence, setVisibility, type EvidenceType, type Visibility } from "@/src/domain/portfolio";
import type { CourseCategory } from "@/src/domain/course-catalog";

const VALID_TYPES: EvidenceType[] = ["photo", "document", "reflection", "achievement"];
const VALID_VISIBILITY: Visibility[] = ["private", "family", "shared"];

export async function GET(request: Request) {
  const childId = new URL(request.url).searchParams.get("childId") ?? undefined;
  return Response.json({ evidence: listEvidence(childId), mode: "local" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.childId || !body.childName || !body.title || !VALID_TYPES.includes(body.type)) {
    return Response.json({ error: "childId, childName, title and a valid type are required" }, { status: 400 });
  }
  const item = addEvidence({
    childId: body.childId,
    childName: body.childName,
    skill: (body.skill as CourseCategory) ?? "Mathematiques",
    type: body.type,
    title: body.title,
    description: body.description ?? "",
    visibility: VALID_VISIBILITY.includes(body.visibility) ? body.visibility : "private",
  });
  return Response.json({ ok: true, evidence: item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.evidenceId) return Response.json({ error: "evidenceId is required" }, { status: 400 });

  if (body.action === "comment") {
    if (!body.text || !body.author || !body.authorName) return Response.json({ error: "author, authorName and text are required" }, { status: 400 });
    const item = addComment(body.evidenceId, body.author, body.authorName, body.text);
    if (!item) return Response.json({ error: "Evidence not found" }, { status: 404 });
    return Response.json({ ok: true, evidence: item });
  }
  if (body.action === "share") {
    if (!VALID_VISIBILITY.includes(body.visibility)) return Response.json({ error: "A valid visibility is required" }, { status: 400 });
    const item = setVisibility(body.evidenceId, body.visibility);
    if (!item) return Response.json({ error: "Evidence not found" }, { status: 404 });
    return Response.json({ ok: true, evidence: item });
  }
  return Response.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id is required" }, { status: 400 });
  const removed = deleteEvidence(id);
  if (!removed) return Response.json({ error: "Evidence not found" }, { status: 404 });
  return Response.json({ ok: true });
}
