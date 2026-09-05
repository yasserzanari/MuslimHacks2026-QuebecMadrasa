/**
 * Garde-fous partagés par les routes d'API locales.
 *
 * Trois principes, tirés de `docs/architecture/04-securite-et-donnees.md` :
 * l'identité vient du serveur, l'entrée est validée avant d'être utilisée, et
 * une erreur n'est jamais avalée en silence.
 */

/** Un corps de requête raisonnable pour ce prototype. */
export const MAX_BODY_BYTES = 16_000;

export type BodyResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; response: Response };

export function jsonError(error: string, status: number): Response {
  return Response.json({ error }, { status });
}

/**
 * Lit un corps JSON en objet. Contrairement à `request.json().catch(() => ({}))`,
 * un corps illisible produit une 400 explicite plutôt qu'une réponse construite
 * sur des valeurs par défaut silencieuses.
 */
export async function readJsonObject(request: Request): Promise<BodyResult> {
  const raw = await request.text();

  if (raw.length > MAX_BODY_BYTES) {
    return { ok: false, response: jsonError("Payload too large", 413) };
  }
  if (raw.trim() === "") {
    return { ok: true, body: {} };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError("Body must be valid JSON", 400) };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, response: jsonError("Body must be a JSON object", 400) };
  }

  return { ok: true, body: parsed as Record<string, unknown> };
}

/** Chaîne non vide, bornée. Renvoie `null` si la valeur ne convient pas. */
export function readString(
  value: unknown,
  maxLength: number,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed.length > maxLength) return null;
  return trimmed;
}

/** Valeur appartenant à un ensemble fermé. */
export function readEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * Clés qui atteindraient la chaîne de prototypes si un identifiant servait à
 * indexer un objet. Elles passent le motif ci-dessous (le tiret bas est permis),
 * d'où le refus explicite.
 */
const RESERVED_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export function readIdentifier(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (RESERVED_KEYS.has(value)) return null;
  return /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : null;
}
