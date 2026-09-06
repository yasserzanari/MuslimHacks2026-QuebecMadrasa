import { addEvidence, commentEvidence, listAccessLog, listEvidence, removeEvidence, setVisibility, skillProgress, type EvidenceType, type EvidenceVisibility } from "@/src/domain/portfolio";

const types: EvidenceType[] = ["text", "photo", "audio", "document", "quiz"];
const visibilities: EvidenceVisibility[] = ["private", "family", "shared_link"];

function fail(error: string, status: number) {
  return Response.json({ error }, { status });
}

export async function GET(request: Request) {
  const childId = new URL(request.url).searchParams.get("childId") ?? undefined;
  return Response.json({ evidence: listEvidence(childId), skills: childId ? skillProgress(childId) : [], accessLog: listAccessLog().slice(0, 8) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!types.includes(body.type)) return fail("invalid_type", 400);
  try {
    const item = addEvidence({
      childId: body.childId ?? "adam",
      skillId: body.skillId,
      type: body.type,
      titleFr: body.titleFr ?? "",
      titleEn: body.titleEn,
      noteFr: body.noteFr,
      noteEn: body.noteEn,
      visibility: visibilities.includes(body.visibility) ? body.visibility : undefined,
    });
    return Response.json({ evidence: item }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "add_failed", 400);
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "comment") return Response.json({ evidence: commentEvidence(body.evidenceId, body.text ?? "") });
    if (body.action === "visibility") {
      if (!visibilities.includes(body.visibility)) return fail("invalid_visibility", 400);
      return Response.json({ evidence: setVisibility(body.evidenceId, body.visibility) });
    }
    return fail("invalid_action", 400);
  } catch (error) {
    const code = error instanceof Error ? error.message : "patch_failed";
    return fail(code, code === "evidence_not_found" ? 404 : 400);
  }
}

export async function DELETE(request: Request) {
  const evidenceId = new URL(request.url).searchParams.get("evidenceId");
  if (!evidenceId) return fail("evidence_id_required", 400);
  try {
    removeEvidence(evidenceId);
    return Response.json({ ok: true });
  } catch {
    return fail("evidence_not_found", 404);
  }
}
