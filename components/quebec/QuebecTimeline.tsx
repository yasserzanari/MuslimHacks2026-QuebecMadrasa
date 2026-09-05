"use client";

/**
 * Toutes les obligations de l'année, passées et à venir, chacune avec son
 * article et l'ancre qui a produit sa date. Les obligations facultatives
 * restent affichées : les retirer priverait un parent qui souhaite tout de
 * même produire le document.
 */

import type { ResolvedDeadline } from "../../src/domain/quebec-deadlines";
import {
  submissionTransitions,
  type Locale,
  type RequirementId,
  type SubmissionStatus,
} from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";
import {
  QuebecAnchorNote,
  QuebecDaysBadge,
  QuebecDeadlineChip,
  QuebecLegalFootnote,
  QuebecReasonNote,
  QuebecSupersededNote,
  QuebecUncertainNote,
} from "./QuebecDeadlineChip";

interface TimelineProps {
  deadlines: readonly ResolvedDeadline[];
  statuses: Readonly<Partial<Record<RequirementId, SubmissionStatus>>>;
  onAdvance: (requirementId: RequirementId, next: SubmissionStatus) => void;
  dictionary: QuebecDictionary;
  locale: Locale;
}

export function QuebecTimeline({
  deadlines,
  statuses,
  onAdvance,
  dictionary,
  locale,
}: TimelineProps) {
  return (
    <section className="quebec-timeline" id="quebec-timeline">
      <h2>{dictionary.timelineTitle}</h2>
      <ol className="quebec-timeline-list">
        {deadlines.map((deadline) => {
          const status = statuses[deadline.requirementId] ?? "todo";
          const nextStatuses = submissionTransitions[status];
          const modifiers = [
            deadline.applicability === "optional" ? "quebec-req-optional" : "",
            deadline.applicability === "not_applicable"
              ? "quebec-req-inactive"
              : "",
            deadline.legal.basis === "practice" ? "quebec-req-practice" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li
              key={deadline.requirementId}
              className={`quebec-req-card ${modifiers}`}
            >
              <div className="quebec-req-top">
                <h3>{dictionary.requirement[deadline.requirementId]}</h3>
                <span className="quebec-status-badge">
                  {dictionary.status[status]}
                </span>
              </div>

              <div className="quebec-req-meta">
                <span className="tag">
                  {dictionary.applicability[deadline.applicability]}
                </span>
                <QuebecDeadlineChip
                  deadline={deadline}
                  dictionary={dictionary}
                  locale={locale}
                />
                <QuebecDaysBadge
                  deadline={deadline}
                  dictionary={dictionary}
                />
              </div>

              <p className="quebec-rule">{dictionary.rule[deadline.ruleId]}</p>

              <QuebecReasonNote
                deadline={deadline}
                dictionary={dictionary}
                locale={locale}
              />
              <QuebecUncertainNote
                deadline={deadline}
                dictionary={dictionary}
                locale={locale}
              />
              <QuebecAnchorNote
                deadline={deadline}
                dictionary={dictionary}
                locale={locale}
              />
              <QuebecSupersededNote
                deadline={deadline}
                dictionary={dictionary}
                locale={locale}
              />

              {nextStatuses.length > 0 ? (
                <div className="quebec-status-actions">
                  <span>{dictionary.statusAdvance}</span>
                  {nextStatuses.map((next) => (
                    <button
                      key={next}
                      type="button"
                      className="button button-soft"
                      onClick={() => onAdvance(deadline.requirementId, next)}
                    >
                      {dictionary.status[next]}
                    </button>
                  ))}
                </div>
              ) : null}

              <QuebecLegalFootnote
                deadline={deadline}
                dictionary={dictionary}
                locale={locale}
              />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
