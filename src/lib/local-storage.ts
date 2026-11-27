/** Tiny shared localStorage helpers + cross-hook sync (no Context). */

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, unknown>();

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  cache.set(key, value);
  notify(key);
}

export function removeKey(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
  cache.delete(key);
  notify(key);
}

/** Cached read for useSyncExternalStore — stable reference until write/remove. */
export function getCachedJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (!cache.has(key)) {
    cache.set(key, readJson(key, fallback));
  }
  return cache.get(key) as T;
}

export function subscribeKey(key: string, onChange: () => void) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(onChange);
  return () => {
    set!.delete(onChange);
  };
}
