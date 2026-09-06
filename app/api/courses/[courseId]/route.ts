import { DEMO_APPROVED_LESSONS, DEMO_EVIDENCE, DEMO_LESSON, findChild } from "@/src/server/demo-data";
import { errorResponse, jsonError } from "@/src/server/http";
import { resolveAdultSession } from "@/src/server/session";
import { listCoursePlanItems } from "@/src/server/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { courseId: string } }) {
  try {
    const session = resolveAdultSession(request);
    if (params.courseId !== "fractions") return jsonError("not_found", 404);
    const child = findChild("child-adam");
    if (!child || child.familyId !== session.familyId) return jsonError("not_found", 404);
    const approved = DEMO_APPROVED_LESSONS.find((lesson) => lesson.id === "lesson-fractions-base");
    if (!approved) return jsonError("not_found", 404);
    const planned = listCoursePlanItems(child.id).some((item) => item.courseId === params.courseId);
    return Response.json({
      course: {
        id: params.courseId,
        title: "Fractions & nombres rationnels",
        subject: "Mathématiques",
        level: "5e année",
        child: { id: child.id, name: child.displayName, level: child.level },
        progress: 72,
        sessionCount: 5,
        planned,
        approvedSource: approved,
        sessions: [
          { id: "s1", number: 1, title: "Comprendre les fractions", objective: "Lire le numérateur et le dénominateur", duration: 25, status: "completed", lessonId: "demo-fractions", score: "8/10" },
          { id: "s2", number: 2, title: "Fractions équivalentes", objective: "Reconnaître des fractions de même valeur", duration: 30, status: "completed", lessonId: "demo-fractions", score: "9/10" },
          { id: "s3", number: 3, title: "Comparer deux fractions", objective: "Utiliser un dénominateur commun", duration: 25, status: "in_progress", lessonId: "demo-fractions", score: null },
          { id: "s4", number: 4, title: "Fractions dans la vie réelle", objective: "Résoudre un problème contextualisé", duration: 30, status: "locked", lessonId: null, score: null },
          { id: "s5", number: 5, title: "Bilan et défi final", objective: "Mobiliser les stratégies apprises", duration: 35, status: "locked", lessonId: null, score: null },
        ],
        resources: [
          { id: "r1", type: "Leçon", title: "Comparer deux fractions", description: DEMO_LESSON.goal, meta: "25 min · interactif", href: "/student/lesson/demo-fractions" },
          { id: "r2", type: "Référence MEQ", title: approved.titleFr, description: approved.objectives.join(" · "), meta: "Source approuvée par le parent", href: "https://www.quebec.ca/education" },
          { id: "r3", type: "Fiche famille", title: "Le vocabulaire des fractions", description: "Une fiche simple à consulter ensemble avant la prochaine séance.", meta: "PDF · 1 page", href: "/student/lesson/demo-fractions" },
        ],
        competencies: [
          { title: "Fractions équivalentes", code: "MAT.5.N2", level: "En progression", value: 82, color: "green" },
          { title: "Dénominateur commun", code: "MAT.5.N3", level: "À consolider", value: 61, color: "amber" },
          { title: "Résolution de problèmes", code: "MAT.5.R1", level: "En progression", value: 70, color: "blue" },
        ],
        evidence: DEMO_EVIDENCE.filter((item) => item.childId === child.id && item.skillId === "obj-math-fractions"),
        plan: listCoursePlanItems(child.id),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
