export const KEYS = {
  workouts: 'peso:workouts',
  sessions: 'peso:sessions',
  settings: 'peso:settings',
  active: 'peso:activeSession',
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
