import { courses } from "@/src/domain/course-catalog";

export async function GET() {
  return Response.json({ courses, total: courses.length, mode: "local" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const course = courses.find((item) => item.id === body.courseId);
  if (!course) return Response.json({ error: "Course not found" }, { status: 404 });
  return Response.json({ ok: true, action: "assignment_created", courseId: course.id, childId: body.childId ?? "demo-child", status: "pending_parent_plan" }, { status: 201 });
}
