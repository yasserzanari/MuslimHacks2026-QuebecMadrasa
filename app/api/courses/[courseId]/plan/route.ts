import { randomUUID } from "node:crypto";
import { errorResponse, readJson, jsonError } from "@/src/server/http";
import { resolveAdultSession, assertChildBelongsToFamily } from "@/src/server/session";
import { saveCoursePlanItem } from "@/src/server/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = resolveAdultSession(request);
    if (params.courseId !== "fractions") return jsonError("not_found", 404);
    const body = await readJson(request);
    const childId = typeof body.childId === "string" ? body.childId : "child-adam";
    assertChildBelongsToFamily(childId, session.familyId);
    const item = saveCoursePlanItem({ id: randomUUID(), courseId: params.courseId, childId, title: "Fractions & nombres rationnels", addedAt: new Date().toISOString(), status: "planned" });
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
