import { describe, expect, it } from 'vitest';
import {
  IDLE_TIMER,
  completeSession,
  doneCount,
  elapsedMs,
  findSuggestion,
  loggedSets,
  newActiveSession,
  newAdhocExercise,
  toggledTimer,
  withValue,
} from './session';
import type { ActiveRecord, Session, Workout } from '../types';

const workout: Workout = {
  id: 'w1',
  name: 'Full Body A',
  createdAt: '2026-09-01T10:00:00.000Z',
  exercises: [
    { id: 'e1', name: 'Agachamento', sets: 2, reps: 8 },
    { id: 'e2', name: 'Supino', sets: 3, reps: 10 },
  ],
};

describe('newActiveSession', () => {
  it('snapshots the template with blank, undone sets', () => {
    const s = newActiveSession(workout, new Date('2026-09-05T08:00:00Z'));
    expect(s.workoutId).toBe('w1');
    expect(s.workoutName).toBe('Full Body A');
    expect(s.startedAt).toBe('2026-09-05T08:00:00.000Z');
    expect(s.exercises).toHaveLength(2);
    expect(s.exercises[0]).toMatchObject({
      name: 'Agachamento',
      targetSets: 2,
      targetReps: 8,
      adhoc: false,
      status: 'pending',
    });
    expect(s.exercises[0]!.sets).toEqual([
      { done: false, kg: '', reps: '' },
      { done: false, kg: '', reps: '' },
    ]);
    expect(s.exercises[1]!.sets).toHaveLength(3);
  });

  it('gives every session its own id', () => {
    expect(newActiveSession(workout).id).not.toBe(newActiveSession(workout).id);
  });
});

describe('newAdhocExercise', () => {
  it('is flagged adhoc with no rep target', () => {
    const e = newAdhocExercise('Cadeira extensora', 3);
    expect(e).toMatchObject({ adhoc: true, targetSets: 3, targetReps: 0, status: 'pending' });
    expect(e.sets).toHaveLength(3);
  });
});

describe('timer', () => {
  it('starts from idle, banks time on pause, resumes from the bank', () => {
    const t1 = toggledTimer(IDLE_TIMER, 1_000);
    expect(t1).toEqual({ running: true, base: 0, since: 1_000 });
    expect(elapsedMs(t1, 4_000)).toBe(3_000);

    const t2 = toggledTimer(t1, 4_000);
    expect(t2).toEqual({ running: false, base: 3_000, since: 0 });
    expect(elapsedMs(t2, 99_000)).toBe(3_000);

    const t3 = toggledTimer(t2, 10_000);
    expect(elapsedMs(t3, 12_500)).toBe(5_500);
  });

  it('derives elapsed time from the timestamp, so a gap in ticks loses nothing', () => {
    const t = toggledTimer(IDLE_TIMER, 0);
    expect(elapsedMs(t, 3_600_000)).toBe(3_600_000);
  });
});

describe('sets', () => {
  it('typing a value marks the set done; clearing it does not undo that', () => {
    const blank = { done: false, kg: '', reps: '' };
    const typed = withValue(blank, 'kg', '80');
    expect(typed).toEqual({ done: true, kg: '80', reps: '' });
    expect(withValue(typed, 'kg', '')).toEqual({ done: true, kg: '', reps: '' });
    expect(withValue(blank, 'reps', '')).toEqual(blank);
  });

  it('counts only done sets, regardless of values', () => {
    expect(
      doneCount({
        sets: [
          { done: true },
          { done: false },
          { done: true },
        ],
      }),
    ).toBe(2);
  });
});

describe('completeSession', () => {
  const record: ActiveRecord = {
    session: {
      id: 's1',
      workoutId: 'w1',
      workoutName: 'Full Body A',
      startedAt: '2026-09-05T08:00:00.000Z',
      exercises: [
        {
          name: 'Agachamento',
          targetSets: 2,
          targetReps: 8,
          adhoc: false,
          status: 'done',
          sets: [
            { done: true, kg: '80', reps: '8' },
            { done: true, kg: '', reps: '' },
          ],
        },
        {
          name: 'Cadeira',
          targetSets: 1,
          targetReps: 0,
          adhoc: true,
          status: 'pending',
          sets: [{ done: false, kg: '12,5', reps: '' }],
        },
      ],
    },
    timer: { running: true, base: 10_000, since: 100_000 },
  };

  it('coerces strings, keeps done flags and rounds the duration', () => {
    const done = completeSession(record, 107_400);
    expect(done.durationSeconds).toBe(17);
    expect(done.exercises[0]!.sets).toEqual([
      { done: true, kg: 80, reps: 8 },
      { done: true, kg: null, reps: null },
    ]);
    expect(done.exercises[1]!.adhoc).toBe(true);
    expect(done.exercises[1]!.sets[0]!.done).toBe(false);
  });

  it('never lets an unparsable draft through as NaN', () => {
    const done = completeSession(record, 107_400);
    // "12,5" only reaches the draft when the mask is bypassed; it must still
    // become null rather than NaN.
    expect(done.exercises[1]!.sets[0]!.kg).toBe(null);
  });

  it('counts history sets as done sets across all exercises', () => {
    expect(loggedSets(completeSession(record, 107_400))).toBe(2);
  });
});

describe('findSuggestion', () => {
  const session = (id: string, sets: { kg: number | null; reps: number | null }[]): Session => ({
    id,
    workoutId: 'w1',
    workoutName: 'A',
    startedAt: '2026-09-01T00:00:00.000Z',
    durationSeconds: 0,
    exercises: [
      {
        name: 'Agachamento',
        targetSets: sets.length,
        targetReps: 8,
        adhoc: false,
        status: 'done',
        sets: sets.map((s) => ({ done: true, ...s })),
      },
    ],
  });

  const newest = session('new', [{ kg: 90, reps: 6 }]);
  const older = session('old', [
    { kg: 80, reps: 8 },
    { kg: 80, reps: 8 },
  ]);

  it('prefers the newest session that has a value for that row', () => {
    expect(findSuggestion([newest, older], 'Agachamento', 0)).toEqual({
      done: true,
      kg: 90,
      reps: 6,
    });
  });

  it('falls back to an older session when the newest was cut short', () => {
    expect(findSuggestion([newest, older], 'Agachamento', 1)).toEqual({
      done: true,
      kg: 80,
      reps: 8,
    });
  });

  it('returns null for unknown exercises and empty rows', () => {
    expect(findSuggestion([newest, older], 'Remada', 0)).toBe(null);
    expect(findSuggestion([session('x', [{ kg: null, reps: null }])], 'Agachamento', 0)).toBe(
      null,
    );
  });
});
