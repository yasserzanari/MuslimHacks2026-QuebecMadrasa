import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { findChild } from "@/src/server/demo-data";
import { getLesson } from "@/src/server/store";
import { LessonWorkspace } from "@/app/student/lesson/[lessonId]/lesson-workspace";

/**
 * P14 — Lesson + AI tutor.
 *
 * The homework is the page. The tutor is a side panel, never a separate chat page
 * (docs/plan/04-feedback-ui.md). The page loads the lesson on the server and passes only
 * what the student is allowed to see: prompts, choices and objectives — no answer key.
 */

export const metadata: Metadata = {
  title: "Leçon — Madrasa Québec",
};

export const dynamic = "force-dynamic";

export default function StudentLessonPage({ params }: { params: { lessonId: string } }) {
  const lesson = getLesson(params.lessonId);
  if (!lesson) notFound();

  const child = findChild(lesson.childId);
  if (!child?.permissions.voiceTutorEnabled) {
    // Voice is a parent-granted permission, so a lesson can still be opened without it.
    return (
      <main className="lesson-shell">
        <section className="lesson-main">
          <h1>{lesson.title}</h1>
          <p>{lesson.goal}</p>
          <Link className="button button-primary" href="/student">
            ← /student
          </Link>
        </section>
      </main>
    );
  }

  return (
    <LessonWorkspace
      lesson={{
        id: lesson.id,
        title: lesson.title,
        goal: lesson.goal,
        estimatedMinutes: lesson.estimatedMinutes,
        locale: lesson.locale,
        allowSolutionReveal: lesson.allowSolutionReveal,
        studentId: lesson.childId,
        studentName: child.displayName,
        questions: lesson.questions.map((question) => ({
          id: question.id,
          index: question.index,
          type: question.type,
          prompt: question.prompt,
          choices: question.choices,
          objective: question.objective,
        })),
      }}
    />
  );
}
