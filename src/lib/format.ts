const MONTHS = [
  'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
  'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Milliseconds -> "MM:SS" (minutes are not capped at 60). */
export function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = String(Math.floor(total / 60)).padStart(2, '0');
  const sec = String(total % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

/** ISO -> "04 de set." */
export function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} de ${MONTHS[d.getMonth()]}`;
}

export function exerciseCount(n: number): string {
  return `${n} ${n === 1 ? 'exercício' : 'exercícios'}`;
}

export function setCount(n: number): string {
  return `${n} ${n === 1 ? 'série' : 'séries'}`;
}

/** Digits only — for reps and set counts. */
export function digits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/**
 * Digits plus at most one decimal separator, normalised to a dot — for kg.
 * Anything this returns is guaranteed to parse with `toNumberOrNull`, so a
 * load typed as "1,2,3" can never be silently dropped on save.
 */
export function decimal(value: string): string {
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(/,/g, '.');
  const dot = cleaned.indexOf('.');
  if (dot === -1) return cleaned;
  return cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '');
}

export function toNumberOrNull(value: string): number | null {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
