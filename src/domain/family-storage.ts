import type { AgeBand, Jurisdiction, Level, Locale } from "@/src/domain/family";

const STORAGE_KEY = "madrasa:family";

export type StoredChild = { id: string; displayName: string; ageBand: AgeBand; level: Level };
export type StoredFamily = { id: string; name: string; locale: Locale; jurisdiction: Jurisdiction; schoolYear: string; children: StoredChild[] };

export function saveFamily(family: StoredFamily) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(family));
}

export function loadFamily(): StoredFamily | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredFamily;
  } catch {
    return null;
  }
}
