import { listBlockedSlots, listWeekSessions, moveWeekSession, setBlockedSlot } from "@/src/domain/week-plan";

export async function GET(request: Request) {
  const childId = new URL(request.url).searchParams.get("childId") ?? undefined;
  return Response.json({ sessions: listWeekSessions(childId), blockedSlots: listBlockedSlots(), mode: "local" });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.action === "block_slot") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^\d{2}:\d{2}$/.test(body.startTime ?? "") || typeof body.blocked !== "boolean") {
      return Response.json({ error: "date, startTime and blocked are required" }, { status: 400 });
    }
    return Response.json({ ok: true, slot: setBlockedSlot(body.date, body.startTime, body.blocked) });
  }
  if (!body.sessionId || !/^\d{4}-\d{2}-\d{2}$/.test(body.date ?? "") || !/^\d{2}:\d{2}$/.test(body.startTime ?? "")) {
    return Response.json({ error: "sessionId, date and startTime are required" }, { status: 400 });
  }
  const session = moveWeekSession(body.sessionId, body.date, body.startTime);
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  return Response.json({ ok: true, session });
}
