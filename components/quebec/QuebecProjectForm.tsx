"use client";

/**
 * Projet d'apprentissage, structuré par les matières de l'article 4.
 * Les champs manquants restent visibles et ne bloquent jamais l'enregistrement.
 */

import type { QuebecDictionary } from "./quebec-dictionary";

export interface ProjectDraft {
  approach: string;
  activities: string;
  resources: string;
  time: string;
  subjects: Readonly<Record<string, string>>;
}

export const emptyProjectDraft: ProjectDraft = {
  approach: "",
  activities: "",
  resources: "",
  time: "",
  subjects: {},
};

interface ProjectFormProps {
  draft: ProjectDraft;
  onChange: (draft: ProjectDraft) => void;
  onSave: () => void;
  saved: boolean;
  dictionary: QuebecDictionary;
}

export function QuebecProjectForm({
  draft,
  onChange,
  onSave,
  saved,
  dictionary,
}: ProjectFormProps) {
  const setField = (key: keyof Omit<ProjectDraft, "subjects">, value: string) =>
    onChange({ ...draft, [key]: value });

  const setSubject = (subject: string, value: string) =>
    onChange({ ...draft, subjects: { ...draft.subjects, [subject]: value } });

  const missing = dictionary.projectSubjects.filter(
    (subject) => (draft.subjects[subject] ?? "").trim() === "",
  );

  return (
    <section className="quebec-project-form" id="quebec-projet">
      <h2>{dictionary.projectTitle}</h2>
      <p className="quebec-panel-lead">{dictionary.projectLead}</p>

      <div className="quebec-anchor-grid">
        <label className="quebec-anchor-field">
          <span>{dictionary.projectApproach}</span>
          <textarea
            rows={3}
            value={draft.approach}
            onChange={(event) => setField("approach", event.target.value)}
          />
        </label>
        <label className="quebec-anchor-field">
          <span>{dictionary.projectActivities}</span>
          <textarea
            rows={3}
            value={draft.activities}
            onChange={(event) => setField("activities", event.target.value)}
          />
        </label>
        <label className="quebec-anchor-field">
          <span>{dictionary.projectResources}</span>
          <textarea
            rows={3}
            value={draft.resources}
            onChange={(event) => setField("resources", event.target.value)}
          />
        </label>
        <label className="quebec-anchor-field">
          <span>{dictionary.projectTime}</span>
          <input
            type="text"
            value={draft.time}
            onChange={(event) => setField("time", event.target.value)}
          />
        </label>
      </div>

      <div className="quebec-subject-grid">
        {dictionary.projectSubjects.map((subject) => (
          <label key={subject} className="quebec-anchor-field">
            <span>{subject}</span>
            <textarea
              rows={2}
              value={draft.subjects[subject] ?? ""}
              onChange={(event) => setSubject(subject, event.target.value)}
            />
          </label>
        ))}
      </div>

      {missing.length > 0 ? (
        <div className="quebec-missing-list">
          <h3>{dictionary.avisMissing}</h3>
          <ul>
            {missing.map((subject) => (
              <li key={subject}>{subject}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="quebec-doc-actions">
        <button type="button" className="button button-primary" onClick={onSave}>
          {dictionary.projectSave}
        </button>
        {saved ? (
          <span className="quebec-saved">{dictionary.projectSaved}</span>
        ) : null}
      </div>
    </section>
  );
}
