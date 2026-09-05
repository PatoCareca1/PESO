/**
 * Pure session logic — everything the store does to a session that does not
 * involve React. Kept free of side effects so it can be unit-tested directly.
 */
import { toNumberOrNull, uid } from './format';
import type {
  ActiveExercise,
  ActiveRecord,
  ActiveSession,
  DraftSet,
  Session,
  SetEntry,
  TimerState,
  Workout,
} from '../types';

export const IDLE_TIMER: TimerState = { running: false, base: 0, since: 0 };

export function blankSet(): DraftSet {
  return { done: false, kg: '', reps: '' };
}

export function blankSets(count: number): DraftSet[] {
  return Array.from({ length: count }, blankSet);
}

export function newActiveSession(workout: Workout, now = new Date()): ActiveSession {
  return {
    id: uid(),
    workoutId: workout.id,
    workoutName: workout.name,
    startedAt: now.toISOString(),
    exercises: workout.exercises.map((e) => ({
      name: e.name,
      targetSets: e.sets,
      targetReps: e.reps,
      adhoc: false,
      status: 'pending',
      sets: blankSets(e.sets),
    })),
  };
}

export function newAdhocExercise(name: string, sets: number): ActiveExercise {
  return {
    name,
    targetSets: sets,
    targetReps: 0,
    adhoc: true,
    status: 'pending',
    sets: blankSets(sets),
  };
}

/* ── Timer ─────────────────────────────────────────────────────────────── */

export function toggledTimer(t: TimerState, now = Date.now()): TimerState {
  return t.running
    ? { running: false, base: t.base + (now - t.since), since: 0 }
    : { running: true, base: t.base, since: now };
}

export function elapsedMs(t: TimerState, now = Date.now()): number {
  return t.base + (t.running ? now - t.since : 0);
}

/* ── Sets ──────────────────────────────────────────────────────────────── */

export function doneCount(exercise: { sets: { done: boolean }[] }): number {
  return exercise.sets.filter((s) => s.done).length;
}

/** "Séries" on a history card: done sets summed across all exercises. */
export function loggedSets(session: Session): number {
  return session.exercises.reduce((total, e) => total + doneCount(e), 0);
}

/** Typing a load or a rep count is an implicit "I did this one". */
export function withValue(set: DraftSet, field: 'kg' | 'reps', value: string): DraftSet {
  return { ...set, [field]: value, done: set.done || value !== '' };
}

/* ── Finishing ─────────────────────────────────────────────────────────── */

export function completeSession(record: ActiveRecord, now = Date.now()): Session {
  const { session, timer } = record;
  return {
    id: session.id,
    workoutId: session.workoutId,
    workoutName: session.workoutName,
    startedAt: session.startedAt,
    durationSeconds: Math.round(elapsedMs(timer, now) / 1000),
    exercises: session.exercises.map((e) => ({
      name: e.name,
      targetSets: e.targetSets,
      targetReps: e.targetReps,
      adhoc: e.adhoc,
      status: e.status,
      sets: e.sets.map((s) => ({
        done: s.done,
        kg: toNumberOrNull(s.kg),
        reps: toNumberOrNull(s.reps),
      })),
    })),
  };
}

/* ── Suggestions ───────────────────────────────────────────────────────── */

/**
 * Last logged numbers for this exercise at this set index. `sessions` is
 * newest-first; the first session with a value for that row wins, so rows
 * can come from different sessions when the last one was cut short.
 */
export function findSuggestion(
  sessions: Session[],
  name: string,
  index: number,
): SetEntry | null {
  for (const session of sessions) {
    const match = session.exercises.find((e) => e.name === name);
    const set = match?.sets[index];
    if (set && (set.kg != null || set.reps != null)) return set;
  }
  return null;
}
