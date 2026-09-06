"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ACCOMMODATIONS,
  DIFFICULTIES,
  HOMEWORK_FORMATS,
  LEVELS,
  MAX_MINUTES,
  MAX_QUESTIONS,
  MIN_MINUTES,
  MIN_QUESTIONS,
  QUESTION_TYPES,
  SUBJECTS,
  estimateCredits,
  type Accommodation,
  type Difficulty,
  type HomeworkFormat,
  type Level,
  type QuestionType,
  type Subject,
} from "@/src/domain/homework-options";
import type { GenerationJob } from "@/src/domain/ai-generation-job";
import type { DocumentWarning, HomeworkDocument } from "@/src/domain/ai-homework-document";
import { dictionaryFor, interpolate } from "@/src/i18n/ai-dictionary";
import { DEFAULT_LOCALE, formatDateTime, type Locale } from "@/src/i18n/locale";
import { ParentSidebar } from "@/app/parent/parent-sidebar";

/**
 * The tools a parent, a tutor or a group educator uses to make the AI generate homework.
 *
 * Everything the adult decides is a field here, and the result of pressing "send" is a
 * queued job — never a lesson. The review panel on the right is where a human turns a
 * draft into something a child can open.
 */

interface ChildOption {
  id: string;
  displayName: string;
  level: Level;
}

interface SpecForm {
  childId: string;
  subject: Subject;
  level: Level;
  format: HomeworkFormat;
  topic: string;
  objectives: string[];
  questionTypes: QuestionType[];
  questionCount: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  accommodations: Accommodation[];
  context: string;
  mustInclude: string;
  mustAvoid: string;
  includeAnswerKey: boolean;
  allowSolutionReveal: boolean;
  approvedSourcesOnly: boolean;
}

type AdultRole = "parent" | "tutor" | "educator";

interface FieldIssue {
  field: string;
  messageKey: string;
}

const NAV_ITEMS: Array<{ icon: string; labelFr: string; labelEn: string; href: string }> = [
  { icon: "⌂", labelFr: "Accueil", labelEn: "Home", href: "/parent" },
  { icon: "☷", labelFr: "Plan de la semaine", labelEn: "Week plan", href: "#" },
  { icon: "▣", labelFr: "Cours", labelEn: "Courses", href: "#" },
  { icon: "✦", labelFr: "Assistant IA", labelEn: "AI assistant", href: "/parent/assistant" },
  { icon: "◌", labelFr: "Communauté", labelEn: "Community", href: "#" },
  { icon: "▤", labelFr: "Portfolio", labelEn: "Portfolio", href: "#" },
  { icon: "◫", labelFr: "Parcours Québec", labelEn: "Quebec pathway", href: "#" },
  { icon: "$", labelFr: "Budget", labelEn: "Budget", href: "#" },
];

function initialForm(child: ChildOption | undefined): SpecForm {
  return {
    childId: child?.id ?? "",
    subject: "mathematics",
    level: child?.level ?? "primaire-5",
    format: "practice_set",
    topic: "",
    objectives: [""],
    questionTypes: ["short_answer"],
    questionCount: 6,
    difficulty: "standard",
    estimatedMinutes: 25,
    accommodations: [],
    context: "",
    mustInclude: "",
    mustAvoid: "",
    includeAnswerKey: true,
    allowSolutionReveal: false,
    approvedSourcesOnly: true,
  };
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function HomeworkStudio({
  childProfiles,
  familyName,
  creditsAvailable: initialCredits,
  providerId,
}: {
  childProfiles: ChildOption[];
  familyName: string;
  creditsAvailable: number;
  providerId: string;
}) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [role, setRole] = useState<AdultRole>("parent");
  const [form, setForm] = useState<SpecForm>(() => initialForm(childProfiles[0]));
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [credits, setCredits] = useState(initialCredits);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [flash, setFlash] = useState<"created" | "approved" | "rejected" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [workerRunning, setWorkerRunning] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [document, setDocument] = useState<HomeworkDocument | null>(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [publishedLessonId, setPublishedLessonId] = useState<string | null>(null);

  const t = dictionaryFor(locale);

  useEffect(() => {
    globalThis.document.documentElement.lang = locale;
  }, [locale]);

  const headers = useMemo(
    () => ({ "Content-Type": "application/json", "x-demo-role": role }),
    [role],
  );

  const loadJobs = useCallback(async () => {
    try {
      const response = await fetch("/api/generation-jobs", { headers: { "x-demo-role": role } });
      if (!response.ok) throw new Error("load failed");
      const data = await response.json();
      setJobs(data.jobs ?? []);
      setCredits(data.creditsAvailable ?? 0);
    } catch {
      setErrorCode("network");
    }
  }, [role]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;

  const creditEstimate = useMemo(() => {
    const objectives = form.objectives.map((item) => item.trim()).filter(Boolean);
    if (!form.topic.trim() || objectives.length === 0) return 0;
    return estimateCredits({
      locale,
      format: form.format,
      questionTypes: form.questionTypes,
      questionCount: form.questionCount,
      estimatedMinutes: form.estimatedMinutes,
      includeAnswerKey: form.includeAnswerKey,
    });
  }, [form, locale]);

  function updateForm<K extends keyof SpecForm>(key: K, value: SpecForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function issueFor(field: string): string | null {
    const issue = issues.find((item) => item.field === field || item.field.startsWith(`${field}.`));
    return issue ? (t.issues[issue.messageKey] ?? t.issues.issueInvalidField) : null;
  }

  async function submitSpec(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setIssues([]);
    setErrorCode(null);
    setFlash(null);

    const spec = {
      ...form,
      locale,
      objectives: form.objectives.map((item) => item.trim()).filter(Boolean),
    };

    try {
      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers,
        body: JSON.stringify({ spec, requestId: crypto.randomUUID() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setIssues(data.issues ?? []);
        setErrorCode(data.error ?? "unknown");
        return;
      }

      setFlash("created");
      setCredits(data.creditsAvailable ?? credits);
      await loadJobs();
    } catch {
      setErrorCode("network");
    } finally {
      setSubmitting(false);
    }
  }

  async function runWorker() {
    setWorkerRunning(true);
    setErrorCode(null);
    try {
      const response = await fetch("/api/generation-jobs/run", { method: "POST", headers });
      const data = await response.json();
      if (!response.ok) {
        setErrorCode(data.error ?? "unknown");
        return;
      }
      setJobs(data.jobs ?? []);
      setCredits(data.creditsAvailable ?? credits);
    } catch {
      setErrorCode("network");
    } finally {
      setWorkerRunning(false);
    }
  }

  async function openJob(jobId: string) {
    setSelectedJobId(jobId);
    setDocument(null);
    setDecisionNote("");
    setPublishedLessonId(null);
    setFlash(null);
    try {
      const response = await fetch(`/api/generation-jobs/${jobId}`, {
        headers: { "x-demo-role": role },
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorCode(data.error ?? "unknown");
        return;
      }
      setDocument(data.document);
    } catch {
      setErrorCode("network");
    }
  }

  async function decide(jobId: string, action: "approve" | "reject" | "cancel") {
    setErrorCode(null);
    try {
      const response = await fetch(`/api/generation-jobs/${jobId}/decision`, {
        method: "POST",
        headers,
        body: JSON.stringify({ action, note: decisionNote }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorCode(data.error ?? "unknown");
        return;
      }
      if (action === "approve") {
        setFlash("approved");
        setPublishedLessonId(data.lessonId ?? null);
      }
      if (action === "reject") setFlash("rejected");
      if (action === "cancel" && selectedJobId === jobId) {
        setSelectedJobId(null);
        setDocument(null);
      }
      await loadJobs();
    } catch {
      setErrorCode("network");
    }
  }

  function warningText(warning: DocumentWarning): string {
    const template = t.warnings[warning.code];
    return template ? interpolate(template, warning.values ?? {}) : warning.code;
  }

  return (
    <main className="parent-assistant-shell">
      <ParentSidebar active="assistant" />

      <section className="workspace">
        <div className="workspace-top">
          <div>
            <div className="eyebrow">{t.studio.eyebrow}</div>
            <h1>{t.studio.title}</h1>
          </div>
          <div className="studio-top-actions">
            <span className="tag" title={`AI_PROVIDER=${providerId}`}>
              {providerId === "mock" ? "mock" : "Claude"} · {credits} {t.common.credits}
            </span>
            <div className="real-language-switch" aria-label={t.common.language}>
              <button
                type="button"
                className={locale === "fr" ? "active" : ""}
                aria-pressed={locale === "fr"}
                onClick={() => setLocale("fr")}
              >
                {t.common.french}
              </button>
              <button
                type="button"
                className={locale === "en" ? "active" : ""}
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
              >
                {t.common.english}
              </button>
            </div>
            <div className="profile">
              <span className="avatar">{familyName.slice(0, 2).toUpperCase()}</span>
              <span>{familyName}</span>
            </div>
          </div>
        </div>

        {errorCode ? (
          <p className="studio-alert studio-alert-error" role="alert">
            {t.errors[errorCode] ?? t.errors.unknown}
          </p>
        ) : null}

        <div className="studio-grid">
          <div className="studio-main">
            {selectedJob ? (
              <ReviewPanel
                locale={locale}
                t={t}
                job={selectedJob}
                document={document}
                note={decisionNote}
                flash={flash}
                publishedLessonId={publishedLessonId}
                onNoteChange={setDecisionNote}
                onBack={() => {
                  setSelectedJobId(null);
                  setDocument(null);
                }}
                onApprove={() => decide(selectedJob.id, "approve")}
                onReject={() => decide(selectedJob.id, "reject")}
                warningText={warningText}
              />
            ) : (
              <form className="panel-card studio-form" onSubmit={submitSpec}>
                <p>{t.studio.lead}</p>

                {flash === "created" ? (
                  <p className="studio-alert studio-alert-ok" role="status">
                    <strong>{t.studio.createdTitle}</strong> {t.studio.createdBody}
                  </p>
                ) : null}

                <fieldset className="studio-fieldset">
                  <legend>{t.studio.sectionWho}</legend>
                  <div className="studio-row">
                    <label className="studio-field">
                      <span>{t.studio.child}</span>
                      <select
                        value={form.childId}
                        onChange={(event) => updateForm("childId", event.target.value)}
                      >
                        {childProfiles.map((child) => (
                          <option key={child.id} value={child.id}>
                            {child.displayName} · {t.levels[child.level]}
                          </option>
                        ))}
                      </select>
                      {issueFor("childId") ? (
                        <em className="studio-issue">{issueFor("childId")}</em>
                      ) : null}
                    </label>

                    <label className="studio-field">
                      <span>{t.studio.role}</span>
                      <select
                        value={role}
                        onChange={(event) => setRole(event.target.value as AdultRole)}
                      >
                        <option value="parent">{t.studio.roleParent}</option>
                        <option value="tutor">{t.studio.roleTutor}</option>
                        <option value="educator">{t.studio.roleEducator}</option>
                      </select>
                    </label>

                    <label className="studio-field">
                      <span>{t.studio.language}</span>
                      <select
                        value={locale}
                        onChange={(event) => setLocale(event.target.value as Locale)}
                      >
                        <option value="fr">{t.common.french}</option>
                        <option value="en">{t.common.english}</option>
                      </select>
                    </label>
                  </div>
                </fieldset>

                <fieldset className="studio-fieldset">
                  <legend>{t.studio.sectionWhat}</legend>
                  <div className="studio-row">
                    <label className="studio-field">
                      <span>{t.studio.subject}</span>
                      <select
                        value={form.subject}
                        onChange={(event) => updateForm("subject", event.target.value as Subject)}
                      >
                        {SUBJECTS.map((subject) => (
                          <option key={subject} value={subject}>
                            {t.subjects[subject]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="studio-field">
                      <span>{t.studio.level}</span>
                      <select
                        value={form.level}
                        onChange={(event) => updateForm("level", event.target.value as Level)}
                      >
                        {LEVELS.map((level) => (
                          <option key={level} value={level}>
                            {t.levels[level]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="studio-field">
                      <span>{t.studio.format}</span>
                      <select
                        value={form.format}
                        onChange={(event) =>
                          updateForm("format", event.target.value as HomeworkFormat)
                        }
                      >
                        {HOMEWORK_FORMATS.map((format) => (
                          <option key={format} value={format}>
                            {t.formats[format]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="studio-field">
                    <span>{t.studio.topic}</span>
                    <input
                      value={form.topic}
                      placeholder={t.studio.topicPlaceholder}
                      onChange={(event) => updateForm("topic", event.target.value)}
                    />
                    {issueFor("topic") ? <em className="studio-issue">{issueFor("topic")}</em> : null}
                  </label>

                  <div className="studio-field">
                    <span>{t.studio.objectives}</span>
                    {form.objectives.map((objective, index) => (
                      <div className="studio-inline" key={index}>
                        <input
                          value={objective}
                          placeholder={t.studio.objectivePlaceholder}
                          aria-label={`${t.studio.objectives} ${index + 1}`}
                          onChange={(event) =>
                            updateForm(
                              "objectives",
                              form.objectives.map((item, position) =>
                                position === index ? event.target.value : item,
                              ),
                            )
                          }
                        />
                        {form.objectives.length > 1 ? (
                          <button
                            type="button"
                            className="studio-ghost-button"
                            onClick={() =>
                              updateForm(
                                "objectives",
                                form.objectives.filter((_, position) => position !== index),
                              )
                            }
                          >
                            {t.studio.removeObjective}
                          </button>
                        ) : null}
                      </div>
                    ))}
                    {form.objectives.length < 5 ? (
                      <button
                        type="button"
                        className="studio-ghost-button"
                        onClick={() => updateForm("objectives", [...form.objectives, ""])}
                      >
                        + {t.studio.addObjective}
                      </button>
                    ) : null}
                    {issueFor("objectives") ? (
                      <em className="studio-issue">{issueFor("objectives")}</em>
                    ) : null}
                  </div>
                </fieldset>

                <fieldset className="studio-fieldset">
                  <legend>{t.studio.sectionHow}</legend>

                  <div className="studio-field">
                    <span>{t.studio.questionTypes}</span>
                    <div className="studio-chips">
                      {QUESTION_TYPES.map((type) => (
                        <label
                          key={type}
                          className={`studio-chip ${form.questionTypes.includes(type) ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.questionTypes.includes(type)}
                            onChange={() =>
                              updateForm("questionTypes", toggle(form.questionTypes, type))
                            }
                          />
                          {t.questionTypes[type]}
                        </label>
                      ))}
                    </div>
                    {issueFor("questionTypes") ? (
                      <em className="studio-issue">{issueFor("questionTypes")}</em>
                    ) : null}
                  </div>

                  <div className="studio-row">
                    <label className="studio-field">
                      <span>
                        {t.studio.questionCount} — {form.questionCount}
                      </span>
                      <input
                        type="range"
                        min={MIN_QUESTIONS}
                        max={MAX_QUESTIONS}
                        value={form.questionCount}
                        onChange={(event) =>
                          updateForm("questionCount", Number(event.target.value))
                        }
                      />
                      {issueFor("questionCount") ? (
                        <em className="studio-issue">{issueFor("questionCount")}</em>
                      ) : null}
                    </label>

                    <label className="studio-field">
                      <span>
                        {t.studio.estimatedMinutes} — {form.estimatedMinutes} {t.common.minutes}
                      </span>
                      <input
                        type="range"
                        min={MIN_MINUTES}
                        max={MAX_MINUTES}
                        step={5}
                        value={form.estimatedMinutes}
                        onChange={(event) =>
                          updateForm("estimatedMinutes", Number(event.target.value))
                        }
                      />
                      {issueFor("estimatedMinutes") ? (
                        <em className="studio-issue">{issueFor("estimatedMinutes")}</em>
                      ) : null}
                    </label>

                    <label className="studio-field">
                      <span>{t.studio.difficulty}</span>
                      <select
                        value={form.difficulty}
                        onChange={(event) =>
                          updateForm("difficulty", event.target.value as Difficulty)
                        }
                      >
                        {DIFFICULTIES.map((difficulty) => (
                          <option key={difficulty} value={difficulty}>
                            {t.difficulties[difficulty]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="studio-field">
                    <span>{t.studio.accommodations}</span>
                    <div className="studio-chips">
                      {ACCOMMODATIONS.map((accommodation) => (
                        <label
                          key={accommodation}
                          className={`studio-chip ${form.accommodations.includes(accommodation) ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={form.accommodations.includes(accommodation)}
                            onChange={() =>
                              updateForm(
                                "accommodations",
                                toggle(form.accommodations, accommodation),
                              )
                            }
                          />
                          {t.accommodations[accommodation]}
                        </label>
                      ))}
                    </div>
                    <em className="studio-help">{t.studio.accommodationsHelp}</em>
                  </div>
                </fieldset>

                <fieldset className="studio-fieldset">
                  <legend>{t.studio.sectionGuardrails}</legend>
                  <label className="studio-field">
                    <span>{t.studio.context}</span>
                    <textarea
                      rows={2}
                      value={form.context}
                      placeholder={t.studio.contextPlaceholder}
                      onChange={(event) => updateForm("context", event.target.value)}
                    />
                  </label>
                  <div className="studio-row">
                    <label className="studio-field">
                      <span>{t.studio.mustInclude}</span>
                      <textarea
                        rows={2}
                        value={form.mustInclude}
                        onChange={(event) => updateForm("mustInclude", event.target.value)}
                      />
                    </label>
                    <label className="studio-field">
                      <span>{t.studio.mustAvoid}</span>
                      <textarea
                        rows={2}
                        value={form.mustAvoid}
                        onChange={(event) => updateForm("mustAvoid", event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="studio-switch">
                    <input
                      type="checkbox"
                      checked={form.includeAnswerKey}
                      onChange={(event) => updateForm("includeAnswerKey", event.target.checked)}
                    />
                    <span>{t.studio.includeAnswerKey}</span>
                  </label>

                  <label className="studio-switch">
                    <input
                      type="checkbox"
                      checked={form.allowSolutionReveal}
                      onChange={(event) =>
                        updateForm("allowSolutionReveal", event.target.checked)
                      }
                    />
                    <span>
                      {t.studio.allowSolutionReveal}
                      <em className="studio-help">{t.studio.allowSolutionRevealHelp}</em>
                    </span>
                  </label>

                  <label className="studio-switch">
                    <input
                      type="checkbox"
                      checked={form.approvedSourcesOnly}
                      onChange={(event) =>
                        updateForm("approvedSourcesOnly", event.target.checked)
                      }
                    />
                    <span>{t.studio.approvedSourcesOnly}</span>
                  </label>
                </fieldset>

                <div className="studio-submit-row">
                  <span className="tag">
                    {t.studio.creditsEstimate}: {creditEstimate}
                  </span>
                  <button
                    type="button"
                    className="studio-ghost-button"
                    onClick={() => {
                      setForm(initialForm(childProfiles[0]));
                      setIssues([]);
                      setFlash(null);
                    }}
                  >
                    {t.studio.reset}
                  </button>
                  <button className="button button-primary" type="submit" disabled={submitting}>
                    {submitting ? t.studio.submitting : t.studio.submit}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="panel-card studio-queue">
            <h3>{t.queue.title}</h3>
            <p>{t.queue.lead}</p>

            <div className="studio-queue-actions">
              <button type="button" className="studio-ghost-button" onClick={() => void loadJobs()}>
                {t.queue.refresh}
              </button>
              <button
                type="button"
                className="button button-soft"
                onClick={() => void runWorker()}
                disabled={workerRunning}
              >
                {workerRunning ? t.queue.running : t.queue.runWorker}
              </button>
            </div>

            {jobs.length === 0 ? (
              <p className="studio-empty">{t.queue.empty}</p>
            ) : (
              jobs.map((job) => (
                <article className="studio-job" key={job.id}>
                  <div className="studio-job-head">
                    <strong>{job.requestText}</strong>
                    <span className={`tag status-${job.status}`}>{t.status[job.status]}</span>
                  </div>
                  <div className="task-meta">
                    {t.queue.createdAt} {formatDateTime(job.createdAt, locale)} ·{" "}
                    {job.creditsReserved} {t.queue.credits}
                    {job.creditsRefunded > 0
                      ? ` · ${job.creditsRefunded} ${t.queue.creditsRefunded}`
                      : ""}
                    {job.attemptCount > 0 ? ` · ${t.queue.attempt} ${job.attemptCount}` : ""}
                  </div>
                  {job.errorCode ? (
                    <div className="studio-job-error">
                      {t.queue.errorLabel}: {t.errors[job.errorCode] ?? t.errors.unknown}
                    </div>
                  ) : null}
                  <div className="studio-job-actions">
                    {job.status === "review_required" ||
                    job.status === "approved" ||
                    job.status === "rejected" ? (
                      <button
                        type="button"
                        className="studio-ghost-button"
                        onClick={() => void openJob(job.id)}
                      >
                        {t.queue.open}
                      </button>
                    ) : null}
                    {job.status === "queued" || job.status === "running" ? (
                      <button
                        type="button"
                        className="studio-ghost-button"
                        onClick={() => void decide(job.id, "cancel")}
                      >
                        {t.queue.cancel}
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}

function ReviewPanel({
  locale,
  t,
  job,
  document,
  note,
  flash,
  publishedLessonId,
  onNoteChange,
  onBack,
  onApprove,
  onReject,
  warningText,
}: {
  locale: Locale;
  t: ReturnType<typeof dictionaryFor>;
  job: GenerationJob;
  document: HomeworkDocument | null;
  note: string;
  flash: "created" | "approved" | "rejected" | null;
  publishedLessonId: string | null;
  onNoteChange: (value: string) => void;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  warningText: (warning: DocumentWarning) => string;
}) {
  const decided = job.status === "approved" || job.status === "rejected";

  return (
    <section className="panel-card studio-review">
      <div className="studio-job-head">
        <div>
          <h3>{t.review.title}</h3>
          <p>{t.review.lead}</p>
        </div>
        <button type="button" className="studio-ghost-button" onClick={onBack}>
          ← {t.queue.title}
        </button>
      </div>

      {!document ? (
        <p className="studio-empty">{t.common.loading}</p>
      ) : (
        <>
          <span className="tag">{t.common.aiDraftBadge}</span>
          <h2 className="studio-review-title">{document.title}</h2>
          <div className="task-meta">
            {document.subject} · {document.levelLabel} · {t.review.duration}:{" "}
            {document.estimatedMinutes} {t.common.minutes}
          </div>

          <h4>{t.review.objectives}</h4>
          <ul className="studio-list">
            {document.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>

          <h4>{t.review.warnings}</h4>
          {document.warnings.length === 0 ? (
            <p className="studio-help">{t.review.noWarnings}</p>
          ) : (
            <ul className="studio-list studio-warnings">
              {document.warnings.map((warning, index) => (
                <li key={`${warning.code}-${index}`}>{warningText(warning)}</li>
              ))}
            </ul>
          )}

          <h4>{t.review.lessonBlocks}</h4>
          {document.lessonBlocks.map((block) => (
            <div className="studio-block" key={block.heading}>
              <strong>{block.heading}</strong>
              <p>{block.body}</p>
            </div>
          ))}

          <h4>
            {t.review.questions} ({document.practiceQuestions.length})
          </h4>
          <ol className="studio-list">
            {document.practiceQuestions.map((question) => (
              <li key={question.id}>
                <strong>{t.questionTypes[question.type]}</strong> — {question.prompt}
                {question.choices.length > 0 ? (
                  <div className="task-meta">{question.choices.join(" · ")}</div>
                ) : null}
                {question.hints.length > 0 ? (
                  <div className="task-meta">
                    {t.review.hints}: {question.hints.join(" → ")}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>

          {document.answerKey.length > 0 ? (
            <>
              <h4>{t.review.answerKey}</h4>
              <ul className="studio-list">
                {document.answerKey.map((entry) => (
                  <li key={entry.questionId}>
                    <strong>{entry.questionId}</strong> — {entry.answer}
                    <div className="task-meta">{entry.reasoning}</div>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          <h4>{t.review.sources}</h4>
          <p className="task-meta">
            {document.sourceIds.length > 0 ? document.sourceIds.join(", ") : t.review.noSources}
          </p>
          <p className="task-meta">
            {t.review.model}: {document.modelVersion} · {t.review.promptVersion}:{" "}
            {document.promptVersion} · {formatDateTime(document.generatedAt, locale)}
          </p>

          {flash === "approved" ? (
            <p className="studio-alert studio-alert-ok" role="status">
              {t.review.approved} {t.review.addToPlanHint}{" "}
              {publishedLessonId ? (
                <Link className="real-text-link" href={`/student/lesson/${publishedLessonId}`}>
                  {t.review.openStudentView}
                </Link>
              ) : null}
            </p>
          ) : null}
          {flash === "rejected" ? (
            <p className="studio-alert studio-alert-ok" role="status">
              {t.review.rejected}
            </p>
          ) : null}

          {!decided ? (
            <>
              <label className="studio-field">
                <span>{t.review.noteLabel}</span>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(event) => onNoteChange(event.target.value)}
                />
              </label>
              <div className="studio-submit-row">
                <button type="button" className="studio-ghost-button" onClick={onReject}>
                  {t.review.reject}
                </button>
                <button type="button" className="button button-primary" onClick={onApprove}>
                  {t.review.approve}
                </button>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
