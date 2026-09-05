"use client";

/**
 * Choix de langue, mémorisé pour le navigateur.
 *
 * La lecture de `localStorage` se fait dans un effet, jamais pendant le rendu :
 * le HTML rendu côté serveur ne connaît pas le stockage local, et lire pendant
 * le rendu produirait une divergence d'hydratation.
 */

import { useCallback, useEffect, useState } from "react";

import type { Locale } from "../../src/domain/quebec-types";

export const LOCALE_STORAGE_KEY = "madrasa-locale";

function isLocale(value: string | null): value is Locale {
  return value === "fr" || value === "en";
}

export function useQuebecLocale(): {
  locale: Locale;
  setLocale: (next: Locale) => void;
} {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      // Navigation privée ou stockage bloqué : le français par défaut suffit.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Le choix reste actif pour la session même si l'écriture échoue.
    }
  }, []);

  return { locale, setLocale };
}

/**
 * `now` n'est lu qu'après le montage. Tant qu'il vaut null, aucune urgence
 * n'est calculée, ce qui évite une divergence d'hydratation au passage de
 * minuit.
 */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const year = String(now.getFullYear()).padStart(4, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    setToday(`${year}-${month}-${day}`);
  }, []);

  return today;
}
