import { completeWeekSession, createWeekSession, findNextAvailableSlot, listBlockedSlots, listWeekSessions, moveWeekSession, setBlockedSlot, suggestScheduleAdjustment, type SessionType } from "@/src/domain/week-plan";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const childId = url.searchParams.get("childId") ?? undefined;
  if (url.searchParams.get("suggest") === "1" && childId) {
    return Response.json({ suggestions: suggestScheduleAdjustment(childId), mode: "local" });
  }
  if (url.searchParams.get("nextSlot") === "1" && childId) {
    return Response.json({ slot: findNextAvailableSlot(childId) });
  }
  return Response.json({ sessions: listWeekSessions(childId), blockedSlots: listBlockedSlots(), mode: "local" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const validTypes: SessionType[] = ["lesson", "review", "group", "islamic"];
  if (!body.childId || !body.title || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^\d{2}:\d{2}$/.test(body.startTime ?? "") || !validTypes.includes(body.type)) {
    return Response.json({ error: "childId, title, date, startTime and a valid type are required" }, { status: 400 });
  }
  const session = createWeekSession({
    childId: body.childId,
    courseId: body.courseId ?? "",
    title: body.title,
    date: body.date,
    startTime: body.startTime,
    duration: Number(body.duration) > 0 ? Number(body.duration) : 30,
    type: body.type,
    location: body.location ?? "À la maison",
    note: body.note ?? "",
  });
  return Response.json({ ok: true, session }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.action === "block_slot") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^\d{2}:\d{2}$/.test(body.startTime ?? "") || typeof body.blocked !== "boolean") {
      return Response.json({ error: "date, startTime and blocked are required" }, { status: 400 });
    }
    return Response.json({ ok: true, slot: setBlockedSlot(body.date, body.startTime, body.blocked) });
  }
  if (body.action === "complete_session") {
    if (!body.sessionId) return Response.json({ error: "sessionId is required" }, { status: 400 });
    const session = completeWeekSession(body.sessionId);
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    return Response.json({ ok: true, session });
  }
  if (!body.sessionId || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^\d{2}:\d{2}$/.test(body.startTime ?? "")) {
    return Response.json({ error: "sessionId, date and startTime are required" }, { status: 400 });
  }
  const session = moveWeekSession(body.sessionId, body.date, body.startTime);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  return Response.json({ ok: true, session });
}
