import { buildExport, getSettings, setConsent, setPermission, setRetention, setScreenLimit, type PermissionKey } from "@/src/domain/family-settings";

export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get("export") === "1") {
    return Response.json(buildExport(), { headers: { "Content-Disposition": 'attachment; filename="madrasa-quebec-export.json"' } });
  }
  return Response.json({ settings: getSettings() });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  try {
    if (body.action === "permission") return Response.json({ settings: setPermission(body.childId, body.key as PermissionKey, Boolean(body.value)) });
    if (body.action === "screen_limit") return Response.json({ settings: setScreenLimit(body.childId, Number(body.minutes)) });
    if (body.action === "consent") return Response.json({ settings: setConsent(body.consentId, Boolean(body.granted)) });
    if (body.action === "retention") return Response.json({ settings: setRetention(Number(body.days)) });
    return Response.json({ error: "invalid_action" }, { status: 400 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "patch_failed";
    return Response.json({ error: code }, { status: code.endsWith("not_found") ? 404 : 400 });
  }
}
