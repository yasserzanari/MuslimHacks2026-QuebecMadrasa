import "server-only";

import { DEMO_FAMILY, DEMO_PARENT_ID, findChild } from "@/src/server/demo-data";
import { ForbiddenAccessError } from "@/src/domain/parent-ai-tools";

/**
 * Session resolution for the local slice.
 *
 * Real authentication is Phase 5 in docs/architecture/07-plan-maitre-pages-et-qa.md. Until
 * then every request resolves to the demo family, and the *shape* of the checks is what
 * matters: identity is decided on the server, a child id from the client is always
 * re-verified against the family, and no route trusts a body field for authorization.
 */

export interface AdultSession {
  parentId: string;
  familyId: string;
  role: "parent" | "tutor" | "educator";
}

export interface StudentSession {
  studentId: string;
  familyId: string;
}

export function resolveAdultSession(request: Request): AdultSession {
  const role = request.headers.get("x-demo-role");
  return {
    parentId: DEMO_PARENT_ID,
    familyId: DEMO_FAMILY.id,
    role: role === "tutor" || role === "educator" ? role : "parent",
  };
}

export function resolveStudentSession(request: Request): StudentSession {
  const requested = request.headers.get("x-demo-student-id");
  const child = requested ? findChild(requested) : undefined;
  return {
    studentId: child?.id ?? "child-adam",
    familyId: DEMO_FAMILY.id,
  };
}

/**
 * The check that stops family A from reading family B's child, listed as a threat in
 * docs/architecture/04-securite-et-donnees.md.
 */
export function assertChildBelongsToFamily(childId: string, familyId: string): void {
  const child = findChild(childId);
  if (!child || child.familyId !== familyId) {
    throw new ForbiddenAccessError("Child does not belong to this family");
  }
}
