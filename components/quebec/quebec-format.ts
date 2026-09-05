/**
 * Formatage selon la locale.
 *
 * Une échéance est la seule chose qui ne doit jamais être ambiguë, donc chaque
 * date est construite à midi UTC et rendue avec `timeZone: "UTC"`. Sans cela,
 * `new Date("2027-06-15")` est interprété à minuit UTC et s'affiche « 14 juin »
 * pour toute personne située à l'ouest de Greenwich — c'est-à-dire tout le
 * Québec.
 */

import type { IsoDate, Locale } from "../../src/domain/quebec-types";

const INTL_LOCALES: Record<Locale, string> = {
  fr: "fr-CA",
  en: "en-CA",
};

const LONG_DATE: Intl.DateTimeFormatOptions = {
  timeZone: "UTC",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export function formatIsoDate(iso: IsoDate | null, locale: Locale): string {
  if (!iso) return "";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(
    INTL_LOCALES[locale],
    LONG_DATE,
  );
}
