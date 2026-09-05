import { describe, expect, it } from "vitest";

import { canTransition } from "../ai-generation-job";
import {
  MAX_BODY_BYTES,
  readEnum,
  readIdentifier,
  readJsonObject,
  readString,
} from "../api-guards";
import {
  assertChildInFamily,
  isChildInFamily,
  resolveFamilySession,
} from "../family-session";
import { assertParentCanAccess } from "../parent-ai-tools";

function post(body: string): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

describe("family session", () => {
  const session = resolveFamilySession(post("{}"))!;

  it("resolves an identity without reading the request body", () => {
    expect(session.parentId).toBe("demo-parent");
    expect(session.childIds.length).toBeGreaterThan(0);
  });

  it("accepts a child of the family and rejects any other", () => {
    expect(isChildInFamily(session, "adam")).toBe(true);
    expect(isChildInFamily(session, "another-family-child")).toBe(false);
  });

  /** Menace n°1 de docs/architecture/04-securite-et-donnees.md. */
  it("throws rather than leaking another family's child", () => {
    expect(() => assertChildInFamily(session, "adam")).not.toThrow();
    expect(() => assertChildInFamily(session, "someone-else")).toThrow(
      /Forbidden family access/,
    );
  });

  it("keeps the previously dead guard honest", () => {
    const context = {
      parentId: session.parentId,
      childId: "adam",
      allowedSourceIds: [],
    };
    expect(() => assertParentCanAccess(session.parentId, context)).not.toThrow();
    expect(() => assertParentCanAccess("other-parent", context)).toThrow(
      /Forbidden family access/,
    );
  });
});

describe("body parsing", () => {
  it("reports malformed JSON instead of falling back to defaults", async () => {
    const result = await readJsonObject(post("not json"));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });

  it("rejects a JSON array and a bare string", async () => {
    for (const raw of ["[1,2,3]", '"hello"']) {
      const result = await readJsonObject(post(raw));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(400);
    }
  });

  it("rejects an oversized payload", async () => {
    const huge = JSON.stringify({ text: "x".repeat(MAX_BODY_BYTES + 10) });
    const result = await readJsonObject(post(huge));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(413);
  });

  it("treats an empty body as an empty object", async () => {
    const result = await readJsonObject(post(""));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.body).toEqual({});
  });
});

describe("field guards", () => {
  it("bounds string length and rejects blanks", () => {
    expect(readString("  hello  ", 10)).toBe("hello");
    expect(readString("   ", 10)).toBeNull();
    expect(readString("x".repeat(11), 10)).toBeNull();
    expect(readString(42, 10)).toBeNull();
  });

  it("only accepts members of a closed set", () => {
    const allowed = ["lesson", "exercises"] as const;
    expect(readEnum("lesson", allowed)).toBe("lesson");
    expect(readEnum("anything", allowed)).toBeNull();
    expect(readEnum(null, allowed)).toBeNull();
  });

  it("rejects identifiers that could reach the prototype chain", () => {
    expect(readIdentifier("adam")).toBe("adam");
    expect(readIdentifier("__proto__")).toBeNull();
    expect(readIdentifier("../etc/passwd")).toBeNull();
    expect(readIdentifier("a".repeat(65))).toBeNull();
    expect(readIdentifier("")).toBeNull();
  });
});

describe("canTransition robustness", () => {
  it("answers false for an unknown status instead of throwing", () => {
    expect(() =>
      canTransition("not_a_status" as never, "running"),
    ).not.toThrow();
    expect(canTransition("not_a_status" as never, "running")).toBe(false);
  });

  it("still answers correctly for real statuses", () => {
    expect(canTransition("queued", "running")).toBe(true);
    expect(canTransition("approved", "running")).toBe(false);
  });
});
