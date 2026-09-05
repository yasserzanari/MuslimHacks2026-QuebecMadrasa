"use client";

/**
 * Parcours Québec — du départ de l'école à l'ensemble des obligations datées.
 *
 * La page ne détient aucune règle : elle lit le moteur d'échéances et affiche
 * ce qu'il renvoie, y compris l'ancre à l'origine de chaque date. La plateforme
 * ne transmet rien au ministère et n'atteste aucune conformité.
 */

import { useMemo, useState } from "react";

import { computeQuebecDeadlines } from "@/src/domain/quebec-deadlines";
import {
  QUEBEC_CATALOGUE_VERSION,
  quebecJointSatisfactionGroups,
} from "@/src/domain/quebec-requirements";
import {
  advanceSubmission,
  type EvaluationMode,
  type FamilySubmission,
  type QuebecFieldId,
  type RequirementId,
  type SubmissionStatus,
} from "@/src/domain/quebec-types";
import type { FieldValues } from "@/src/domain/quebec-export";
import { QuebecAnchorPanel } from "@/components/quebec/QuebecAnchorPanel";
import { QuebecAvisGenerator } from "@/components/quebec/QuebecAvisGenerator";
import { QuebecExportCard } from "@/components/quebec/QuebecExportCard";
import { QuebecJointCard } from "@/components/quebec/QuebecJointCard";
import {
  emptyProjectDraft,
  QuebecProjectForm,
  type ProjectDraft,
} from "@/components/quebec/QuebecProjectForm";
import { QuebecSidebar } from "@/components/quebec/QuebecSidebar";
import { QuebecTimeline } from "@/components/quebec/QuebecTimeline";
import { QuebecUrgentCard } from "@/components/quebec/QuebecUrgentCard";
import { getQuebecDictionary } from "@/components/quebec/quebec-dictionary";
import { useQuebecLocale, useToday } from "@/components/quebec/quebec-locale";
import {
  hasJointGroupDivergence,
  selectJointGroupDeadlines,
  selectSecondDeadline,
  selectUrgentDeadline,
} from "@/components/quebec/quebec-selectors";

const SCHOOL_YEARS = ["2026-2027", "2027-2028"] as const;

/** Date de repli tant que le navigateur n'a pas monté la page. */
const SSR_TODAY = "2026-09-05";

function emptySubmission(
  requirementId: RequirementId,
  schoolYearId: string,
): FamilySubmission {
  const stamp = `${SSR_TODAY}T00:00:00.000Z`;
  return {
    id: `local-${requirementId}`,
    familyId: "demo-family",
    childId: "demo-child",
    jurisdiction: "quebec",
    schoolYearId,
    requirementId,
    requirementDefinitionVersion: 1,
    status: "todo",
    recipientStates: [],
    fieldValues: {},
    evidenceIds: [],
    ministryFinding: "none",
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export default function ParcoursQuebecPage() {
  const { locale, setLocale } = useQuebecLocale();
  const dictionary = getQuebecDictionary(locale);
  const today = useToday();
  const now = today ?? SSR_TODAY;

  const [schoolYear, setSchoolYear] = useState<string>(SCHOOL_YEARS[0]);
  const [hasLeftSchool, setHasLeftSchool] = useState(false);
  const [exitDate, setExitDate] = useState("");
  const [implementationDate, setImplementationDate] = useState("");
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode | "">("");
  const [fieldValues, setFieldValues] = useState<FieldValues>({});
  const [projectDraft, setProjectDraft] =
    useState<ProjectDraft>(emptyProjectDraft);
  const [projectSaved, setProjectSaved] = useState(false);
  const [submissions, setSubmissions] = useState<
    Readonly<Partial<Record<RequirementId, FamilySubmission>>>
  >({});

  const computation = useMemo(
    () =>
      computeQuebecDeadlines({
        anchors: {
          schoolYear,
          schoolExitDate:
            hasLeftSchool && exitDate !== "" ? exitDate : undefined,
          projectImplementationDate:
            implementationDate !== "" ? implementationDate : undefined,
        },
        now,
        evaluationMode: evaluationMode === "" ? undefined : evaluationMode,
        submissions: Object.values(submissions),
      }),
    [
      schoolYear,
      hasLeftSchool,
      exitDate,
      implementationDate,
      evaluationMode,
      now,
      submissions,
    ],
  );

  const submissionList = useMemo(
    () => Object.values(submissions),
    [submissions],
  );

  const urgent = selectUrgentDeadline(computation, submissionList);
  const second = selectSecondDeadline(computation, submissionList);
  const jointGroup = quebecJointSatisfactionGroups[0];
  const jointDeadlines = selectJointGroupDeadlines(computation, jointGroup.id);
  const jointDivergence = hasJointGroupDivergence(computation, jointGroup.id);

  const statuses = useMemo(() => {
    const map: Partial<Record<RequirementId, SubmissionStatus>> = {};
    for (const submission of submissionList) {
      map[submission.requirementId] = submission.status;
    }
    return map;
  }, [submissionList]);

  const handleFieldChange = (id: QuebecFieldId, value: string) => {
    setFieldValues((previous) => ({ ...previous, [id]: value }));
    if (id === "schoolExitDate" && value !== "") {
      setHasLeftSchool(true);
      setExitDate(value);
    }
  };

  const handleAdvance = (
    requirementId: RequirementId,
    next: SubmissionStatus,
  ) => {
    setSubmissions((previous) => {
      const current =
        previous[requirementId] ?? emptySubmission(requirementId, schoolYear);
      try {
        return {
          ...previous,
          [requirementId]: advanceSubmission(
            current,
            next,
            `${now}T12:00:00.000Z`,
          ),
        };
      } catch {
        // Transition refusée par la machine à états : on ne change rien.
        return previous;
      }
    });
  };

  const handleExitToggle = (value: boolean) => {
    setHasLeftSchool(value);
    if (!value) setExitDate("");
  };

  const handleExitDate = (value: string) => {
    setExitDate(value);
    setFieldValues((previous) => ({ ...previous, schoolExitDate: value }));
  };

  return (
    <main className="app-shell">
      <QuebecSidebar dictionary={dictionary} />

      <section className="workspace quebec-workspace">
        <div className="workspace-top">
          <div>
            <div className="eyebrow">{dictionary.pageEyebrow}</div>
            <h1>{dictionary.pageTitle}</h1>
          </div>
          <div className="quebec-header-right">
            <div
              className="real-language-switch"
              role="group"
              aria-label={dictionary.languageSwitchLabel}
            >
              <button
                type="button"
                className={locale === "fr" ? "active" : ""}
                onClick={() => setLocale("fr")}
                aria-pressed={locale === "fr"}
                lang="fr"
              >
                Français
              </button>
              <button
                type="button"
                className={locale === "en" ? "active" : ""}
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
                lang="en"
              >
                English
              </button>
            </div>
            <div className="profile">
              <span className="avatar">AG</span>
              <span>{dictionary.profileName}</span>
            </div>
          </div>
        </div>

        <p className="quebec-page-lead">{dictionary.pageLead}</p>

        <p className="quebec-disclaimer">
          {dictionary.disclaimer}{" "}
          <span className="quebec-verified">
            {dictionary.primaryTextPending}
          </span>
        </p>

        <QuebecUrgentCard
          urgent={urgent}
          second={second}
          dictionary={dictionary}
          locale={locale}
        />

        <QuebecAnchorPanel
          dictionary={dictionary}
          schoolYear={schoolYear}
          schoolYearOptions={SCHOOL_YEARS}
          onSchoolYearChange={setSchoolYear}
          hasLeftSchool={hasLeftSchool}
          onHasLeftSchoolChange={handleExitToggle}
          exitDate={exitDate}
          onExitDateChange={handleExitDate}
          implementationDate={implementationDate}
          onImplementationDateChange={setImplementationDate}
          evaluationMode={evaluationMode}
          onEvaluationModeChange={setEvaluationMode}
          issues={computation.issues}
          exitClassification={computation.exitClassification}
        />

        <QuebecAvisGenerator
          fieldValues={fieldValues}
          onFieldChange={handleFieldChange}
          dictionary={dictionary}
          locale={locale}
          now={`${now}T12:00:00.000Z`}
        />

        <QuebecJointCard
          deadlines={jointDeadlines}
          hasDivergence={jointDivergence}
          ministryRecordName={jointGroup.ministryRecordName}
          dictionary={dictionary}
          locale={locale}
        />

        <QuebecTimeline
          deadlines={computation.deadlines}
          statuses={statuses}
          onAdvance={handleAdvance}
          dictionary={dictionary}
          locale={locale}
        />

        <QuebecProjectForm
          draft={projectDraft}
          onChange={(draft) => {
            setProjectDraft(draft);
            setProjectSaved(false);
          }}
          onSave={() => setProjectSaved(true)}
          saved={projectSaved}
          dictionary={dictionary}
        />

        {computation.schoolYear ? (
          <QuebecExportCard
            schoolYear={computation.schoolYear}
            deadlines={computation.deadlines}
            dictionary={dictionary}
            locale={locale}
            now={now}
            catalogueVersion={QUEBEC_CATALOGUE_VERSION}
          />
        ) : null}
      </section>
    </main>
  );
}
