/**
 * Locale contract shared by every AI feature.
 *
 * Product rule (docs/architecture/05-internationalisation-fr-en.md): French is the
 * default in Quebec, English must be reachable everywhere, and no visible string
 * may be hardcoded in a component. The backend also receives the locale so a
 * generation job and its exported document are produced in the chosen language.
 */

export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Accepts anything (query string, header, stored preference) and never throws. */
export function resolveLocale(value: unknown): Locale {
  if (isLocale(value)) return value;
  if (typeof value === "string") {
    const base = value.split(",")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function localeTag(locale: Locale): string {
  return locale === "fr" ? "fr-CA" : "en-CA";
}

export function formatDateTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale)).format(value);
}

/** Localised duration, because "25 min" and "25 mins" are not the same string. */
export function formatMinutes(minutes: number, locale: Locale): string {
  const rounded = Math.max(0, Math.round(minutes));
  return locale === "fr"
    ? `${formatNumber(rounded, "fr")} min`
    : `${formatNumber(rounded, "en")} min`;
}
