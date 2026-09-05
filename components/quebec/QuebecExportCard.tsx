"use client";

/**
 * Export du parcours. Rien n'est transmis : le fichier est un brouillon que le
 * parent envoie lui-même, et il conserve la version des règles utilisée.
 */

import {
  buildDraftExport,
  buildExportFilename,
  serializeDraftExportJson,
} from "../../src/domain/quebec-export";
import type { ResolvedDeadline } from "../../src/domain/quebec-deadlines";
import type { Locale, SchoolYear } from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";

interface ExportCardProps {
  schoolYear: SchoolYear;
  deadlines: readonly ResolvedDeadline[];
  dictionary: QuebecDictionary;
  locale: Locale;
  now: string;
  catalogueVersion: string;
}

export function QuebecExportCard({
  schoolYear,
  deadlines,
  dictionary,
  locale,
  now,
  catalogueVersion,
}: ExportCardProps) {
  const draft = buildDraftExport({
    schoolYear,
    deadlines,
    locale,
    now: `${now}T12:00:00.000Z`,
  });

  const download = () => {
    const blob = new Blob([serializeDraftExportJson(draft)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = buildExportFilename(schoolYear.id, draft.generatedAt);
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="quebec-export-card" id="quebec-export">
      <h2>{dictionary.exportTitle}</h2>
      <p className="quebec-panel-lead">{dictionary.exportLead}</p>
      <p className="quebec-watermark">{draft.watermark}</p>
      <p className="quebec-channel-note">{draft.noFilingNotice}</p>
      <p className="quebec-verified">
        {dictionary.catalogueVersion(catalogueVersion)}
      </p>
      <button type="button" className="button button-primary" onClick={download}>
        {dictionary.exportButton}
      </button>
    </section>
  );
}
