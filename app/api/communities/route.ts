import { jsonError, readEnum, readIdentifier, readJsonObject, readString } from "@/src/domain/api-guards";
import { communities, getCommunity } from "@/src/domain/communities";
import { isChildInFamily, resolveFamilySession } from "@/src/domain/family-session";

const ACTIONS = ["join", "leave", "create"] as const;
const MAX_QUERY = 120;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = readIdentifier(params.get("id"));
  if (id) {
    const community = getCommunity(id);
    return community ? Response.json({ community, mode: "local" }) : Response.json({ error: "Communauté introuvable" }, { status: 404 });
  }
  const query = readString(params.get("q"), MAX_QUERY)?.toLowerCase();
  const result = query ? communities.filter((community) => `${community.title} ${community.neighborhood} ${community.languages} ${community.activities.join(" ")}`.toLowerCase().includes(query)) : communities;
  return Response.json({ communities: result, total: result.length, mode: "local" });
}

export async function POST(request: Request) {
  // Rejoindre un groupe met en jeu le lieu et les coordonnées de la famille :
  // l'identité doit venir de la session, jamais du corps de la requête.
  const session = resolveFamilySession(request);
  if (!session) return jsonError("Authentication required", 401);

  const parsed = await readJsonObject(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  const action = readEnum(body.action, ACTIONS);
  if (!action) return jsonError("Action inconnue", 400);

  if (body.parentId !== undefined && body.parentId !== session.parentId) {
    return jsonError("Forbidden family access", 403);
  }

  if (action === "join") {
    const communityId = readIdentifier(body.communityId);
    if (!communityId) return jsonError("communityId is invalid", 400);

    const childId = body.childId === undefined ? "adam" : readIdentifier(body.childId);
    if (!childId) return jsonError("childId is invalid", 400);
    if (!isChildInFamily(session, childId)) {
      return jsonError("Forbidden family access", 403);
    }

    const community = getCommunity(communityId);
    if (!community) return Response.json({ error: "Communauté introuvable" }, { status: 404 });
    if (community.availableSpots < 1) return Response.json({ error: "Ce groupe est complet" }, { status: 409 });
    return Response.json({ ok: true, action: "join_request_created", communityId: community.id, parentId: session.parentId, childId, status: "pending_review", message: "Votre demande a été envoyée. Le responsable du groupe doit vérifier le profil avant de partager le lieu exact." }, { status: 201 });
  }
  if (action === "leave") {
    const communityId = readIdentifier(body.communityId);
    if (!communityId) return jsonError("communityId is invalid", 400);
    return Response.json({ ok: true, action: "membership_cancelled", communityId, status: "left" });
  }
  if (action === "create") return Response.json({ ok: true, action: "group_submitted", status: "pending_review", message: "Votre groupe EXTRA sera vérifié avant publication." }, { status: 201 });
  return jsonError("Action inconnue", 400);
}
