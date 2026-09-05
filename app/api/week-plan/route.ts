import {
  jsonError,
  readIdentifier,
  readJsonObject,
} from "@/src/domain/api-guards";
import {
  isChildInFamily,
  resolveFamilySession,
} from "@/src/domain/family-session";
import {
  listBlockedSlots,
  listWeekSessions,
  moveWeekSession,
  setBlockedSlot,
} from "@/src/domain/week-plan";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

export async function GET(request: Request) {
  const session = resolveFamilySession(request);
  if (!session) return jsonError("Authentication required", 401);

  const raw = new URL(request.url).searchParams.get("childId");

  // Sans filtre, on ne renvoie que les enfants de la famille de la session.
  if (raw === null) {
    return Response.json({
      sessions: listWeekSessions().filter((item) =>
        isChildInFamily(session, item.childId),
      ),
      blockedSlots: listBlockedSlots(),
      mode: "local",
    });
  }

  const childId = readIdentifier(raw);
  if (!childId) return jsonError("childId is invalid", 400);
  if (!isChildInFamily(session, childId)) {
    return jsonError("Forbidden family access", 403);
  }

  return Response.json({
    sessions: listWeekSessions(childId),
    blockedSlots: listBlockedSlots(),
    mode: "local",
  });
}

export async function PATCH(request: Request) {
  const session = resolveFamilySession(request);
  if (!session) return jsonError("Authentication required", 401);

  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  const date = typeof body.date === "string" ? body.date : "";
  const startTime = typeof body.startTime === "string" ? body.startTime : "";

  if (body.action === "block_slot") {
    if (
      !DATE_PATTERN.test(date) ||
      !TIME_PATTERN.test(startTime) ||
      typeof body.blocked !== "boolean"
    ) {
      return jsonError("date, startTime and blocked are required", 400);
    }
    return Response.json({
      ok: true,
      slot: setBlockedSlot(date, startTime, body.blocked),
    });
  }

  const sessionId = readIdentifier(body.sessionId);
  if (!sessionId || !DATE_PATTERN.test(date) || !TIME_PATTERN.test(startTime)) {
    return jsonError("sessionId, date and startTime are required", 400);
  }

  // Vérifier l'appartenance AVANT de déplacer quoi que ce soit.
  const target = listWeekSessions().find((item) => item.id === sessionId);
  if (!target) return jsonError("Session not found", 404);
  if (!isChildInFamily(session, target.childId)) {
    return jsonError("Forbidden family access", 403);
  }

  const moved = moveWeekSession(sessionId, date, startTime);
  if (!moved) return jsonError("Session not found", 404);
  return Response.json({ ok: true, session: moved });
}
