"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { QuestionType } from "@/src/domain/homework-options";
import { HELP_LEVELS, type HelpLevel } from "@/src/domain/ai-tutor-session";
import { dictionaryFor } from "@/src/i18n/ai-dictionary";
import { localeTag, type Locale } from "@/src/i18n/locale";

/**
 * The student's agentic tutor.
 *
 * The student can write or speak; the panel answers with a question, a hint, an example or
 * — only when the homework allows it — an explanation. The ladder shown at the top of the
 * panel is not decoration: it is the level the server returned, so the student always sees
 * how much help they are getting and how much is left.
 *
 * The browser holds no key, no prompt and no hint text. It sends what the student said and
 * which button they pressed; everything else is decided in `src/server/tutor-agent.ts`.
 */

interface StudentQuestion {
  id: string;
  index: number;
  type: QuestionType;
  prompt: string;
  choices: string[];
  objective: string;
}

interface LessonProps {
  id: string;
  title: string;
  goal: string;
  estimatedMinutes: number;
  locale: Locale;
  allowSolutionReveal: boolean;
  studentId: string;
  studentName: string;
  questions: StudentQuestion[];
}

interface ChatEntry {
  id: string;
  author: "student" | "tutor";
  text: string;
  helpLevel?: HelpLevel;
  noticeCodes?: string[];
}

/* ------------------------------------------------------------------ voice */

/**
 * Minimal typings for the Web Speech API. It is not in the DOM lib, and it is missing in
 * some browsers entirely — hence the capability checks below rather than a hard dependency.
 */
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResultLike };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function speechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const candidate = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

/* -------------------------------------------------------------- component */

export function LessonWorkspace({ lesson }: { lesson: LessonProps }) {
  const [locale, setLocale] = useState<Locale>(lesson.locale);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [savedAnswerId, setSavedAnswerId] = useState<string | null>(null);
  const [entriesByQuestion, setEntriesByQuestion] = useState<Record<string, ChatEntry[]>>({});
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [helpLevel, setHelpLevel] = useState<HelpLevel>("question");
  const [ceiling, setCeiling] = useState<HelpLevel>(
    lesson.allowSolutionReveal ? "explanation" : "example",
  );
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [escalated, setEscalated] = useState(false);
  const [reported, setReported] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<"unsupported" | "denied" | null>(null);
  const [readAloud, setReadAloud] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);

  const t = dictionaryFor(locale);
  const question = lesson.questions[questionIndex];
  const entries = entriesByQuestion[question.id] ?? [];

  useEffect(() => {
    globalThis.document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [entries.length, pending]);

  // Each question keeps its own ladder, so moving on genuinely starts over.
  useEffect(() => {
    setHelpLevel("question");
    setHintsUsed(0);
    setAttempts(0);
    setSavedAnswerId(null);
  }, [question.id]);

  const speak = useCallback(
    (text: string) => {
      if (!readAloud || typeof window === "undefined" || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = localeTag(locale);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    },
    [locale, readAloud],
  );

  const appendEntry = useCallback(
    (questionId: string, entry: ChatEntry) => {
      setEntriesByQuestion((current) => ({
        ...current,
        [questionId]: [...(current[questionId] ?? []), entry],
      }));
    },
    [],
  );

  const sendTurn = useCallback(
    async (options: {
      text: string;
      mode: "text" | "voice";
      requestedHelp?: "hint" | "question" | "explain_differently";
    }) => {
      if (pending) return;
      const trimmed = options.text.trim();
      if (!trimmed && !options.requestedHelp) return;

      setPending(true);
      setErrorCode(null);

      if (trimmed) {
        appendEntry(question.id, {
          id: crypto.randomUUID(),
          author: "student",
          text: trimmed,
        });
      }
      setMessage("");

      try {
        const response = await fetch("/api/tutor/turn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-demo-student-id": lesson.studentId,
          },
          body: JSON.stringify({
            lessonId: lesson.id,
            questionId: question.id,
            message: trimmed,
            interactionMode: options.mode,
            requestedHelp: options.requestedHelp,
            locale,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          setErrorCode(data.error ?? "unknown");
          return;
        }

        setHelpLevel(data.helpLevel);
        setCeiling(data.ceiling);
        setHintsUsed(data.hintsUsed);
        setAttempts(data.attempts);
        setEscalated(Boolean(data.escalated));

        appendEntry(question.id, {
          id: crypto.randomUUID(),
          author: "tutor",
          text: data.reply,
          helpLevel: data.helpLevel,
          noticeCodes: data.noticeCodes ?? [],
        });
        speak(data.reply);
      } catch {
        setErrorCode("network");
      } finally {
        setPending(false);
      }
    },
    [appendEntry, lesson.id, lesson.studentId, locale, pending, question.id, speak],
  );

  function startListening() {
    const Recognition = speechRecognitionConstructor();
    if (!Recognition) {
      setVoiceError("unsupported");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = localeTag(locale);
    recognition.continuous = false;
    recognition.interimResults = true;

    let transcript = "";
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) transcript += result[0].transcript;
        else setMessage(transcript + result[0].transcript);
      }
      if (transcript) setMessage(transcript);
    };
    recognition.onerror = (event) => {
      setVoiceError(event.error === "not-allowed" ? "denied" : "unsupported");
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      // Speaking is a full turn: what the student said is sent as soon as they stop.
      if (transcript.trim()) void sendTurn({ text: transcript, mode: "voice" });
    };

    recognitionRef.current = recognition;
    setVoiceError(null);
    setListening(true);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const ladder = useMemo(() => {
    const ceilingIndex = HELP_LEVELS.indexOf(ceiling);
    const currentIndex = HELP_LEVELS.indexOf(helpLevel);
    return HELP_LEVELS.map((level, index) => ({
      level,
      reached: index <= currentIndex,
      locked: index > ceilingIndex,
    }));
  }, [ceiling, helpLevel]);

  return (
    <main className="lesson-shell">
      <section className="lesson-main">
        <div className="lesson-top">
          <Link className="studio-ghost-button" href="/student">
            ← {lesson.studentName}
          </Link>
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
        </div>

        <div className="eyebrow">{t.tutor.goalLabel}</div>
        <h1>{lesson.title}</h1>
        <p className="lesson-goal">{lesson.goal}</p>

        <article className="lesson-question">
          <div className="lesson-question-head">
            <span className="tag">
              {t.tutor.questionOf
                .replace("{current}", String(questionIndex + 1))
                .replace("{total}", String(lesson.questions.length))}
            </span>
            <span className="task-meta">{t.questionTypes[question.type]}</span>
          </div>
          <h2>{question.prompt}</h2>
          <p className="task-meta">{question.objective}</p>

          {question.choices.length > 0 ? (
            <ul className="lesson-choices">
              {question.choices.map((choice) => (
                <li key={choice}>
                  <button
                    type="button"
                    className={answers[question.id] === choice ? "selected" : ""}
                    onClick={() => {
                      setAnswers((current) => ({ ...current, [question.id]: choice }));
                      setSavedAnswerId(null);
                    }}
                  >
                    {choice}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <label className="studio-field">
            <span>{t.tutor.yourAnswer}</span>
            <textarea
              rows={4}
              value={answers[question.id] ?? ""}
              placeholder={t.tutor.answerPlaceholder}
              onChange={(event) => {
                setAnswers((current) => ({ ...current, [question.id]: event.target.value }));
                setSavedAnswerId(null);
              }}
            />
          </label>

          <div className="lesson-question-actions">
            <button
              type="button"
              className="studio-ghost-button"
              disabled={questionIndex === 0}
              onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
            >
              ← {t.tutor.previous}
            </button>
            <button
              type="button"
              className="button button-soft"
              onClick={() => setSavedAnswerId(question.id)}
            >
              {savedAnswerId === question.id ? t.tutor.answerSaved : t.tutor.saveAnswer}
            </button>
            <button
              type="button"
              className="studio-ghost-button"
              disabled={questionIndex === lesson.questions.length - 1}
              onClick={() =>
                setQuestionIndex((index) => Math.min(lesson.questions.length - 1, index + 1))
              }
            >
              {t.tutor.next} →
            </button>
          </div>
        </article>
      </section>

      <aside className="tutor-panel" aria-label={t.tutor.panelTitle}>
        <div className="tutor-head">
          <h2>{t.tutor.panelTitle}</h2>
          <p>{t.tutor.panelLead}</p>
          {locale !== lesson.locale ? (
            <span className="tag">{t.tutor.contentLanguageNotice}</span>
          ) : null}
        </div>

        <div className="tutor-ladder" aria-label={t.tutor.helpLevelLabel}>
          {ladder.map((step) => (
            <span
              key={step.level}
              className={`tutor-step ${step.reached ? "reached" : ""} ${step.locked ? "locked" : ""}`}
              title={t.helpLevels[step.level]}
            >
              {t.helpLevels[step.level]}
            </span>
          ))}
        </div>

        <div className="tutor-meta">
          <span>
            {t.tutor.hintsUsed}: {hintsUsed}
          </span>
          <span>
            {t.tutor.attempts}: {attempts}
          </span>
        </div>

        <div className="tutor-log" ref={logRef}>
          {entries.length === 0 ? (
            <p className="studio-empty">{t.tutor.emptyLog}</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className={`tutor-bubble ${entry.author}`}>
                <strong>{entry.author === "student" ? t.tutor.you : t.tutor.tutorName}</strong>
                {entry.helpLevel ? (
                  <span className="tutor-bubble-level">{t.helpLevels[entry.helpLevel]}</span>
                ) : null}
                <p>{entry.text}</p>
                {entry.noticeCodes
                  ?.map((code) => t.notices[code])
                  .filter(Boolean)
                  .map((notice) => (
                    <em className="tutor-notice" key={notice}>
                      {notice}
                    </em>
                  ))}
              </div>
            ))
          )}
          {pending ? <p className="studio-empty">{t.tutor.thinking}</p> : null}
        </div>

        {errorCode ? (
          <p className="studio-alert studio-alert-error" role="alert">
            <strong>{t.tutor.errorTitle}</strong> {t.errors[errorCode] ?? t.errors.unknown}
          </p>
        ) : null}

        {voiceError ? (
          <p className="studio-alert studio-alert-error" role="alert">
            {voiceError === "denied" ? t.tutor.voiceDenied : t.tutor.voiceUnsupported}
          </p>
        ) : null}

        {escalated ? (
          <p className="studio-alert studio-alert-ok" role="status">
            {t.tutor.escalated}
          </p>
        ) : null}

        <div className="tutor-help-buttons">
          <button
            type="button"
            className="studio-ghost-button"
            disabled={pending}
            onClick={() => void sendTurn({ text: "", mode: "text", requestedHelp: "hint" })}
          >
            {t.tutor.askHint}
          </button>
          <button
            type="button"
            className="studio-ghost-button"
            disabled={pending}
            onClick={() => void sendTurn({ text: "", mode: "text", requestedHelp: "question" })}
          >
            {t.tutor.askQuestion}
          </button>
          <button
            type="button"
            className="studio-ghost-button"
            disabled={pending}
            onClick={() =>
              void sendTurn({ text: "", mode: "text", requestedHelp: "explain_differently" })
            }
          >
            {t.tutor.explainDifferently}
          </button>
        </div>

        <form
          className="input-row"
          onSubmit={(event) => {
            event.preventDefault();
            void sendTurn({ text: message, mode: "text" });
          }}
        >
          <input
            value={message}
            aria-label={t.tutor.messagePlaceholder}
            placeholder={listening ? t.tutor.listening : t.tutor.messagePlaceholder}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type="submit" aria-label={t.tutor.send} disabled={pending}>
            ↑
          </button>
        </form>

        <div className="tutor-voice-row">
          <button
            type="button"
            className={`button ${listening ? "button-soft" : "button-primary"}`}
            onClick={() => (listening ? stopListening() : startListening())}
            disabled={pending}
          >
            🎙 {listening ? t.tutor.stopListening : t.tutor.speak}
          </button>
          <label className="studio-switch">
            <input
              type="checkbox"
              checked={readAloud}
              onChange={(event) => {
                setReadAloud(event.target.checked);
                if (!event.target.checked && typeof window !== "undefined") {
                  window.speechSynthesis?.cancel();
                }
              }}
            />
            <span>{t.tutor.readAloud}</span>
          </label>
        </div>

        <div className="tutor-footer">
          <button
            type="button"
            className="studio-ghost-button"
            onClick={() => setReported(true)}
            disabled={reported}
          >
            {reported ? t.tutor.reported : t.tutor.reportAnswer}
          </button>
          <button
            type="button"
            className="studio-ghost-button"
            disabled={pending}
            onClick={() =>
              void sendTurn({
                text: locale === "fr" ? "J'ai besoin d'un adulte." : "I need an adult.",
                mode: "text",
              })
            }
          >
            {t.tutor.askAdult}
          </button>
          <p className="task-meta">{t.tutor.privacyNote}</p>
        </div>
      </aside>
    </main>
  );
}
