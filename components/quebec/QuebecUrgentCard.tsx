"use client";

/**
 * La seule chose à lire en premier : l'obligation la plus urgente, sa date, le
 * nombre de jours restants, l'article, et une action.
 */

import type { ResolvedDeadline } from "../../src/domain/quebec-deadlines";
import type { Locale } from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";
import { formatIsoDate } from "./quebec-format";
import {
  QuebecAnchorNote,
  QuebecDaysBadge,
  QuebecDeadlineChip,
  QuebecLegalFootnote,
  QuebecSupersededNote,
  QuebecUncertainNote,
} from "./QuebecDeadlineChip";

interface UrgentCardProps {
  urgent: ResolvedDeadline | null;
  second: ResolvedDeadline | null;
  dictionary: QuebecDictionary;
  locale: Locale;
}

export function QuebecUrgentCard({
  urgent,
  second,
  dictionary,
  locale,
}: UrgentCardProps) {
  if (!urgent) {
    return (
      <section className="quebec-urgent quebec-urgent-empty">
        <h2>{dictionary.urgentTitle}</h2>
        <p className="quebec-urgent-headline">{dictionary.urgentEmpty}</p>
        <p className="quebec-urgent-help">{dictionary.urgentEmptyHelp}</p>
      </section>
    );
  }

  const toneClass =
    urgent.urgency === "overdue"
      ? "quebec-urgent-overdue"
      : urgent.urgency === "due_soon"
        ? "quebec-urgent-soon"
        : "";

  return (
    <section className={`quebec-urgent ${toneClass}`}>
      <div className="quebec-urgent-top">
        <h2>{dictionary.urgentTitle}</h2>
        <QuebecDaysBadge deadline={urgent} dictionary={dictionary} />
      </div>

      <p className="quebec-urgent-headline">
        {dictionary.requirement[urgent.requirementId]}
      </p>

      <QuebecDeadlineChip
        deadline={urgent}
        dictionary={dictionary}
        locale={locale}
      />
      <QuebecUncertainNote
        deadline={urgent}
        dictionary={dictionary}
        locale={locale}
      />
      <QuebecAnchorNote
        deadline={urgent}
        dictionary={dictionary}
        locale={locale}
      />
      <QuebecSupersededNote
        deadline={urgent}
        dictionary={dictionary}
        locale={locale}
      />

      <a className="button button-primary quebec-urgent-cta" href="#quebec-avis">
        {dictionary.openAction}
      </a>

      {second ? (
        <p className="quebec-urgent-second">
          {dictionary.urgentSecondClock(
            dictionary.requirement[second.requirementId],
            formatIsoDate(second.effectiveDate, locale),
          )}
        </p>
      ) : null}

      <QuebecLegalFootnote
        deadline={urgent}
        dictionary={dictionary}
        locale={locale}
      />
    </section>
  );
}
