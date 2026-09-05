/**
 * Everything read from localStorage passes through here before it reaches
 * React. The data outlives every deploy — an installed PWA can carry records
 * written by any earlier version — so nothing below trusts the shape: bad
 * entries are dropped, missing fields get defaults, and a valid record never
 * white-screens the app.
 *
 * Bump SCHEMA_VERSION whenever the persisted shape changes and add the
 * corresponding defaulting logic in the normaliser for that key.
 *
 *   v1  original shape (README §4)
 *   v2  SetEntry/DraftSet gained `done`; derived from kg/reps when absent
 */
import { uid } from './format';
import { IDLE_TIMER } from './session';
import type {
  ActiveExercise,
  ActiveRecord,
  ActiveSession,
  DraftSet,
  Exercise,
  ExerciseStatus,
  Session,
  SessionExercise,
  SetEntry,
  Settings,
  TimerState,
  Workout,
} from '../types';

export const SCHEMA_VERSION = 2;

type Dict = Record<string, unknown>;

const isDict = (v: unknown): v is Dict => typeof v === 'object' && v !== null;
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown): boolean => v === true;
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Integer no smaller than `min` — set/rep targets. */
function count(v: unknown, fallback: number, min = 1): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= min ? Math.floor(n) : fallback;
}

/** Finite number or null — logged kg/reps. */
function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

const STATUSES: ExerciseStatus[] = ['pending', 'done', 'skipped'];
const status = (v: unknown): ExerciseStatus =>
  STATUSES.includes(v as ExerciseStatus) ? (v as ExerciseStatus) : 'pending';

/* ── Workouts ──────────────────────────────────────────────────────────── */

function exercise(v: unknown): Exercise | null {
  if (!isDict(v)) return null;
  const name = str(v.name).trim();
  if (!name) return null;
  return {
    id: str(v.id) || uid(),
    name,
    sets: count(v.sets, 3),
    reps: count(v.reps, 10),
  };
}

function workout(v: unknown): Workout | null {
  if (!isDict(v)) return null;
  const id = str(v.id);
  const name = str(v.name).trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    exercises: list(v.exercises).map(exercise).filter((e): e is Exercise => e !== null),
    createdAt: str(v.createdAt, new Date(0).toISOString()),
  };
}

export function normalizeWorkouts(raw: unknown): Workout[] {
  return list(raw).map(workout).filter((w): w is Workout => w !== null);
}

/* ── History ───────────────────────────────────────────────────────────── */

function setEntry(v: unknown): SetEntry {
  if (!isDict(v)) return { done: false, kg: null, reps: null };
  const kg = numOrNull(v.kg);
  const reps = numOrNull(v.reps);
  // v1 had no `done`: a set with anything typed in it was the logged one.
  const done = 'done' in v ? bool(v.done) : kg != null || reps != null;
  return { done, kg, reps };
}

function sessionExercise(v: unknown): SessionExercise | null {
  if (!isDict(v)) return null;
  const name = str(v.name).trim();
  if (!name) return null;
  return {
    name,
    targetSets: count(v.targetSets, 1),
    // Ad-hoc exercises legitimately carry a 0 rep target.
    targetReps: count(v.targetReps, 0, 0),
    adhoc: bool(v.adhoc),
    status: status(v.status),
    sets: list(v.sets).map(setEntry),
  };
}

function session(v: unknown): Session | null {
  if (!isDict(v)) return null;
  const id = str(v.id);
  if (!id) return null;
  const duration = typeof v.durationSeconds === 'number' ? v.durationSeconds : 0;
  return {
    id,
    workoutId: typeof v.workoutId === 'string' ? v.workoutId : null,
    workoutName: str(v.workoutName, 'Treino'),
    startedAt: str(v.startedAt, new Date(0).toISOString()),
    durationSeconds: Number.isFinite(duration) && duration >= 0 ? Math.round(duration) : 0,
    exercises: list(v.exercises)
      .map(sessionExercise)
      .filter((e): e is SessionExercise => e !== null),
  };
}

export function normalizeSessions(raw: unknown): Session[] {
  return list(raw).map(session).filter((s): s is Session => s !== null);
}

/* ── Session in progress ───────────────────────────────────────────────── */

function draftSet(v: unknown): DraftSet {
  if (!isDict(v)) return { done: false, kg: '', reps: '' };
  const kg = str(v.kg);
  const reps = str(v.reps);
  const done = 'done' in v ? bool(v.done) : kg !== '' || reps !== '';
  return { done, kg, reps };
}

function activeExercise(v: unknown): ActiveExercise | null {
  if (!isDict(v)) return null;
  const name = str(v.name).trim();
  if (!name) return null;
  return {
    name,
    targetSets: count(v.targetSets, 1),
    targetReps: count(v.targetReps, 0, 0),
    adhoc: bool(v.adhoc),
    status: status(v.status),
    sets: list(v.sets).map(draftSet),
  };
}

function activeSession(v: unknown): ActiveSession | null {
  if (!isDict(v)) return null;
  const id = str(v.id);
  if (!id) return null;
  return {
    id,
    workoutId: typeof v.workoutId === 'string' ? v.workoutId : null,
    workoutName: str(v.workoutName, 'Treino'),
    startedAt: str(v.startedAt, new Date().toISOString()),
    exercises: list(v.exercises)
      .map(activeExercise)
      .filter((e): e is ActiveExercise => e !== null),
  };
}

function timer(v: unknown): TimerState {
  if (!isDict(v)) return { ...IDLE_TIMER };
  const base = typeof v.base === 'number' && v.base >= 0 ? v.base : 0;
  const since = typeof v.since === 'number' && v.since > 0 ? v.since : 0;
  const running = bool(v.running) && since > 0;
  return { running, base, since: running ? since : 0 };
}

export function normalizeActive(raw: unknown): ActiveRecord | null {
  if (!isDict(raw)) return null;
  const s = activeSession(raw.session);
  if (!s) return null;
  return { session: s, timer: timer(raw.timer) };
}

/* ── Settings ──────────────────────────────────────────────────────────── */

export function normalizeSettings(raw: unknown): Settings {
  const theme = isDict(raw) && raw.theme === 'pastel' ? 'pastel' : 'dark';
  return { theme };
}
