"use client";

/**
 * Le point de suivi combiné.
 *
 * Le ministère traite la rencontre de suivi, le bilan de mi-parcours et l'état
 * de situation en un seul échange. Les trois restent affichés séparément avec
 * leur propre statut : pour une sortie entre janvier et mars, l'état de
 * situation est exigé au 15 juin alors que le bilan de mi-parcours devient
 * facultatif. Fusionner les cartes effacerait cette différence.
 */

import type { ResolvedDeadline } from "../../src/domain/quebec-deadlines";
import type { Locale } from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";
import {
  QuebecDeadlineChip,
  QuebecReasonNote,
} from "./QuebecDeadlineChip";

interface JointCardProps {
  deadlines: readonly ResolvedDeadline[];
  hasDivergence: boolean;
  ministryRecordName: string;
  dictionary: QuebecDictionary;
  locale: Locale;
}

export function QuebecJointCard({
  deadlines,
  hasDivergence,
  ministryRecordName,
  dictionary,
  locale,
}: JointCardProps) {
  if (deadlines.length === 0) return null;

  return (
    <section className="quebec-joint-card" id="quebec-suivi">
      <h2>{dictionary.jointTitle}</h2>
      <p className="quebec-panel-lead">{dictionary.jointLead}</p>
      <p className="quebec-joint-record">
        {dictionary.jointRecord(ministryRecordName)}
      </p>

      {hasDivergence ? (
        <p className="quebec-joint-divergence">{dictionary.jointDivergence}</p>
      ) : null}

      <div className="quebec-joint-grid">
        {deadlines.map((deadline) => (
          <article key={deadline.requirementId} className="quebec-joint-item">
            <h3>{dictionary.requirement[deadline.requirementId]}</h3>
            <span className="tag">
              {dictionary.applicability[deadline.applicability]}
            </span>
            <QuebecDeadlineChip
              deadline={deadline}
              dictionary={dictionary}
              locale={locale}
            />
            <QuebecReasonNote
              deadline={deadline}
              dictionary={dictionary}
              locale={locale}
            />
            <p className="quebec-legal-footnote">
              {dictionary.articleLabel(deadline.legal.article ?? "")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
