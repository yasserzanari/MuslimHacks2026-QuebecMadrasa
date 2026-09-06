/**
 * État partagé des adaptateurs locaux.
 *
 * Les modules de domaine gardent leurs données en mémoire. En développement,
 * Next réévalue un module quand une nouvelle route qui l'importe est compilée :
 * un `let` de module repartirait alors de zéro et le travail du parent
 * disparaîtrait en pleine session. On accroche donc l'état à `globalThis`, comme
 * pour un client de base de données, jusqu'à ce que SQLite prenne le relais.
 */
const registry = globalThis as unknown as { __madrasaStores?: Map<string, unknown> };

export function localStore<T>(key: string, create: () => T): { get: () => T; set: (value: T) => void; reset: () => void } {
  registry.__madrasaStores ??= new Map<string, unknown>();
  const stores = registry.__madrasaStores;
  if (!stores.has(key)) stores.set(key, create());
  return {
    get: () => stores.get(key) as T,
    set: (value: T) => { stores.set(key, value); },
    reset: () => { stores.set(key, create()); },
  };
}
