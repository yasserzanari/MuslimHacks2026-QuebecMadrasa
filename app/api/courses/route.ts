import {
  jsonError,
  readIdentifier,
  readJsonObject,
} from "@/src/domain/api-guards";
import { courses } from "@/src/domain/course-catalog";
import {
  isChildInFamily,
  resolveFamilySession,
} from "@/src/domain/family-session";

export async function GET() {
  return Response.json({ courses, total: courses.length, mode: "local" });
}

export async function POST(request: Request) {
  const session = resolveFamilySession(request);
  if (!session) return jsonError("Authentication required", 401);

  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  const courseId = readIdentifier(body.courseId);
  if (!courseId) return jsonError("courseId is invalid", 400);

  const course = courses.find((item) => item.id === courseId);
  if (!course) return jsonError("Course not found", 404);

  // L'enfant doit relever de la famille de la session, pas du corps reçu.
  const childId =
    body.childId === undefined ? "demo-child" : readIdentifier(body.childId);
  if (!childId) return jsonError("childId is invalid", 400);
  if (!isChildInFamily(session, childId)) {
    return jsonError("Forbidden family access", 403);
  }

  return Response.json(
    {
      ok: true,
      action: "assignment_created",
      courseId: course.id,
      childId,
      status: "pending_parent_plan",
    },
    { status: 201 },
  );
}
