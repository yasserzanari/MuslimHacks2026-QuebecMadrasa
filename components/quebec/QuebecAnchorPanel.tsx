"use client";

/**
 * La question d'entrée et les deux autres ancres. Ce panneau est le seul
 * endroit de la page qui déplace des dates.
 */

import type {
  DeadlineIssue,
  ExitClassification,
} from "../../src/domain/quebec-deadlines";
import { quebecEvaluationModes } from "../../src/domain/quebec-requirements";
import type { EvaluationMode } from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";

interface AnchorPanelProps {
  dictionary: QuebecDictionary;
  schoolYear: string;
  schoolYearOptions: readonly string[];
  onSchoolYearChange: (value: string) => void;
  hasLeftSchool: boolean;
  onHasLeftSchoolChange: (value: boolean) => void;
  exitDate: string;
  onExitDateChange: (value: string) => void;
  implementationDate: string;
  onImplementationDateChange: (value: string) => void;
  evaluationMode: EvaluationMode | "";
  onEvaluationModeChange: (value: EvaluationMode | "") => void;
  issues: readonly DeadlineIssue[];
  exitClassification: ExitClassification;
}

export function QuebecAnchorPanel(props: AnchorPanelProps) {
  const { dictionary } = props;
  const examsSelected = props.evaluationMode === "epreuves-ministerielles";

  return (
    <section className="quebec-anchor-panel" id="quebec-situation">
      <h2>{dictionary.anchorsTitle}</h2>
      <p className="quebec-panel-lead">{dictionary.anchorsLead}</p>

      <fieldset className="quebec-anchor-field quebec-entry-question">
        <legend>{dictionary.exitQuestion}</legend>
        <label className="quebec-radio">
          <input
            type="radio"
            name="quebec-has-left"
            checked={!props.hasLeftSchool}
            onChange={() => props.onHasLeftSchoolChange(false)}
          />
          <span>{dictionary.exitNo}</span>
        </label>
        <label className="quebec-radio">
          <input
            type="radio"
            name="quebec-has-left"
            checked={props.hasLeftSchool}
            onChange={() => props.onHasLeftSchoolChange(true)}
          />
          <span>{dictionary.exitYes}</span>
        </label>

        {props.hasLeftSchool ? (
          <label className="quebec-anchor-field">
            <span>{dictionary.exitDateLabel}</span>
            <input
              type="date"
              value={props.exitDate}
              onChange={(event) => props.onExitDateChange(event.target.value)}
            />
          </label>
        ) : null}
      </fieldset>

      <div className="quebec-anchor-grid">
        <label className="quebec-anchor-field">
          <span>{dictionary.schoolYearLabel}</span>
          <select
            value={props.schoolYear}
            onChange={(event) => props.onSchoolYearChange(event.target.value)}
          >
            {props.schoolYearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="quebec-anchor-field">
          <span>{dictionary.implementationLabel}</span>
          <input
            type="date"
            value={props.implementationDate}
            onChange={(event) =>
              props.onImplementationDateChange(event.target.value)
            }
          />
          <small>{dictionary.implementationHelp}</small>
        </label>

        <label className="quebec-anchor-field">
          <span>{dictionary.evaluationLabel}</span>
          <select
            value={props.evaluationMode}
            onChange={(event) =>
              props.onEvaluationModeChange(
                event.target.value as EvaluationMode | "",
              )
            }
          >
            <option value="">{dictionary.evaluationUnset}</option>
            {quebecEvaluationModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {dictionary.evaluationMode[mode.id]}
              </option>
            ))}
          </select>
          {examsSelected ? (
            <small className="quebec-warning">
              {dictionary.examsNoDesUnits}
            </small>
          ) : null}
        </label>
      </div>

      {props.issues.length > 0 ? (
        <div className="quebec-issue-list">
          <h3>{dictionary.issuesTitle}</h3>
          <ul>
            {props.issues.map((issue) => (
              <li key={`${issue.code}-${issue.anchor}`}>
                {dictionary.issue[issue.code]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
