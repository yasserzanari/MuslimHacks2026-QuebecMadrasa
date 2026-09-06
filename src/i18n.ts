/**
 * Ponctuation selon la langue : le français met une espace avant les deux-points,
 * l'anglais non. Sans cela, une page traduite affiche « Level : Beginner ».
 */
export function colon(locale: "fr" | "en"): string {
  return locale === "fr" ? " : " : ": ";
}
