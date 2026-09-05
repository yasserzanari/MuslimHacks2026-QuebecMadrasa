"use client";

/**
 * Affichage d'une échéance : la date, l'ancre qui l'a produite, et l'article.
 * Une date ne s'affiche jamais sans dire d'où elle vient.
 */

import type { ResolvedDeadline } from "../../src/domain/quebec-deadlines";
import type { Locale } from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";
import { formatIsoDate } from "./quebec-format";

interface DeadlineProps {
  deadline: ResolvedDeadline;
  dictionary: QuebecDictionary;
  locale: Locale;
}

export function QuebecDeadlineChip({
  deadline,
  dictionary,
  locale,
}: DeadlineProps) {
  if (deadline.window) {
    return (
      <span className="quebec-deadline-chip quebec-deadline-window">
        {dictionary.windowLabel(
          formatIsoDate(deadline.window.opensOn, locale),
          formatIsoDate(deadline.window.closesOn, locale),
        )}
      </span>
    );
  }
  if (deadline.dueOn) {
    return (
      <span className="quebec-deadline-chip">
        {dictionary.dueLabel(formatIsoDate(deadline.dueOn, locale))}
      </span>
    );
  }
  return (
    <span className="quebec-deadline-chip quebec-deadline-none">
      {dictionary.noDateLabel}
    </span>
  );
}

export function QuebecAnchorNote({
  deadline,
  dictionary,
  locale,
}: DeadlineProps) {
  if (!deadline.anchorValue) return null;
  return (
    <p className="quebec-anchor-note">
      {dictionary.anchorSentence[deadline.anchor](
        formatIsoDate(deadline.anchorValue, locale),
      )}
      {deadline.anchorDerivation === "derived_from_art5" ? (
        <span className="quebec-derived"> {dictionary.derivedFromArt5}</span>
      ) : null}
    </p>
  );
}

export function QuebecSupersededNote({
  deadline,
  dictionary,
  locale,
}: DeadlineProps) {
  if (deadline.supersededRules.length === 0) return null;
  const [first] = deadline.supersededRules;
  return (
    <p className="quebec-superseded-note">
      {first.wouldHaveBeenDueOn
        ? dictionary.supersededSentence(
            formatIsoDate(first.wouldHaveBeenDueOn, locale),
          )
        : dictionary.supersededNoDate}
    </p>
  );
}

export function QuebecLegalFootnote({ deadline, dictionary }: DeadlineProps) {
  const { legal } = deadline;
  return (
    <p className="quebec-legal-footnote">
      {legal.basis === "practice" ? (
        <span className="quebec-practice-tag">{dictionary.practiceLabel}</span>
      ) : (
        <span>{dictionary.articleLabel(legal.article ?? "")}</span>
      )}{" "}
      <a href={legal.sourceUrl} target="_blank" rel="noreferrer">
        {dictionary.sourceLink}
      </a>{" "}
      <span className="quebec-verified">
        {dictionary.verifiedOn(legal.legalVerifiedOn)}
      </span>
    </p>
  );
}

export function QuebecUncertainNote({ deadline, dictionary }: DeadlineProps) {
  if (!deadline.uncertain) return null;
  return (
    <p className="quebec-deadline-uncertain">{dictionary.uncertainLabel}</p>
  );
}

export function QuebecReasonNote({ deadline, dictionary }: DeadlineProps) {
  if (!deadline.reasonCode) return null;
  return <p className="quebec-reason">{dictionary.reason[deadline.reasonCode]}</p>;
}

export function QuebecDaysBadge({
  deadline,
  dictionary,
}: Omit<DeadlineProps, "locale">) {
  const days = deadline.daysUntilEffectiveDate;
  if (days === null) return null;
  if (days === 0) {
    return <span className="quebec-days quebec-days-today">{dictionary.dueToday}</span>;
  }
  if (days < 0) {
    return (
      <span className="quebec-days quebec-days-overdue">
        {dictionary.daysOverdue(Math.abs(days))}
      </span>
    );
  }
  return <span className="quebec-days">{dictionary.daysRemaining(days)}</span>;
}
