export const KEYS = {
  workouts: 'peso:workouts',
  sessions: 'peso:sessions',
  settings: 'peso:settings',
  active: 'peso:activeSession',
  /** Version of the persisted shape; see lib/migrate.ts. */
  schema: 'peso:schema',
} as const;

/** Reads and parses a key, falling back on anything unexpected. */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / quota — the app keeps working in memory. */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

/** Wipes every PESO key. Last resort, offered only by the error screen. */
export function clearAll(): void {
  Object.values(KEYS).forEach(remove);
}
