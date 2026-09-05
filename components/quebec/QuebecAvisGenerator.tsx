"use client";

/**
 * Générateur d'avis à deux destinataires.
 *
 * L'article 3 exige que l'avis parvienne au ministre ET au centre de services
 * scolaire compétent. C'est l'endroit où les familles se font le plus souvent
 * prendre, donc un seul formulaire produit deux brouillons adressés séparément.
 */

import { useState } from "react";

import {
  buildAvisDocuments,
  renderNoticeText,
  type FieldValues,
  type NoticeDocument,
} from "../../src/domain/quebec-export";
import { quebecFieldSpecs } from "../../src/domain/quebec-requirements";
import type { Locale, QuebecFieldId } from "../../src/domain/quebec-types";
import type { QuebecDictionary } from "./quebec-dictionary";

interface AvisGeneratorProps {
  fieldValues: FieldValues;
  onFieldChange: (id: QuebecFieldId, value: string) => void;
  dictionary: QuebecDictionary;
  locale: Locale;
  now: string;
}

const HELP_FIELDS: Partial<Record<QuebecFieldId, keyof QuebecDictionary>> = {
  childPermanentCode: "permanentCodeHelp",
  parentTwoFullName: "parentTwoHelp",
};

function inputTypeFor(kind: string): string {
  return kind === "date" ? "date" : "text";
}

export function QuebecAvisGenerator({
  fieldValues,
  onFieldChange,
  dictionary,
  locale,
  now,
}: AvisGeneratorProps) {
  const documents = buildAvisDocuments({ fieldValues, locale, now });
  const missing = documents.minister.missingFieldIds;

  return (
    <section className="quebec-avis" id="quebec-avis">
      <h2>{dictionary.avisTitle}</h2>
      <p className="quebec-panel-lead">{dictionary.avisLead}</p>

      <div className="quebec-avis-grid">
        {quebecFieldSpecs.map((field) => {
          const helpKey = HELP_FIELDS[field.id];
          const help = helpKey ? dictionary[helpKey] : null;
          return (
            <label key={field.id} className="quebec-anchor-field">
              <span>{dictionary.field[field.id]}</span>
              <input
                type={inputTypeFor(field.inputKind)}
                value={fieldValues[field.id] ?? ""}
                onChange={(event) => onFieldChange(field.id, event.target.value)}
              />
              {typeof help === "string" ? <small>{help}</small> : null}
            </label>
          );
        })}
      </div>

      {missing.length > 0 ? (
        <div className="quebec-missing-list">
          <h3>{dictionary.avisMissing}</h3>
          <ul>
            {missing.map((id) => (
              <li key={id}>{dictionary.field[id]}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="quebec-avis-ready">{dictionary.avisReady}</p>
      )}

      <div className="quebec-recipient-grid">
        <RecipientCard
          document={documents.minister}
          dictionary={dictionary}
          blocked={missing.length > 0}
        />
        <RecipientCard
          document={documents.schoolServiceCentre}
          dictionary={dictionary}
          blocked={missing.length > 0}
        />
      </div>
    </section>
  );
}

interface RecipientCardProps {
  document: NoticeDocument;
  dictionary: QuebecDictionary;
  blocked: boolean;
}

function RecipientCard({ document, dictionary, blocked }: RecipientCardProps) {
  const [copied, setCopied] = useState(false);
  const text = renderNoticeText(document);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Presse-papiers refusé : le texte reste visible et sélectionnable.
      setCopied(false);
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `avis-${document.recipientId}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="quebec-recipient-card">
      <h3>{dictionary.recipient[document.recipientId]}</h3>
      <p className="quebec-addressee">{document.addressee}</p>
      <p className="quebec-watermark">{document.watermark}</p>
      <pre className="quebec-document-preview">{text}</pre>
      <p className="quebec-channel-note">{document.channelNote}</p>
      <div className="quebec-doc-actions">
        <button type="button" className="button button-soft" onClick={copy}>
          {copied ? dictionary.copied : dictionary.copyDocument}
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={download}
          disabled={blocked}
        >
          {dictionary.downloadDocument}
        </button>
      </div>
    </article>
  );
}
