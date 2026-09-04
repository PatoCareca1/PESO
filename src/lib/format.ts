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

/** Digits only — for reps and set counts. */
export function digits(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** Digits plus one decimal separator, normalised to a dot — for kg. */
export function decimal(value: string): string {
  return value.replace(/[^0-9.,]/g, '').replace(',', '.');
}

export function toNumberOrNull(value: string): number | null {
  if (value === '' || value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
