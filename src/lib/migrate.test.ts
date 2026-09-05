import { describe, expect, it } from 'vitest';
import {
  normalizeActive,
  normalizeSessions,
  normalizeSettings,
  normalizeWorkouts,
} from './migrate';

describe('normalizeWorkouts', () => {
  it('passes a well-formed list through unchanged', () => {
    const input = [
      {
        id: 'w1',
        name: 'Full Body A',
        createdAt: '2026-09-01T00:00:00.000Z',
        exercises: [{ id: 'e1', name: 'Agachamento', sets: 4, reps: 8 }],
      },
    ];
    expect(normalizeWorkouts(input)).toEqual(input);
  });

  it('survives every shape that used to white-screen the app', () => {
    expect(normalizeWorkouts(null)).toEqual([]);
    expect(normalizeWorkouts({ bad: 'shape' })).toEqual([]);
    expect(normalizeWorkouts('[]')).toEqual([]);
    expect(normalizeWorkouts([{ id: 'x', name: 'Sem exercícios' }])).toEqual([
      { id: 'x', name: 'Sem exercícios', exercises: [], createdAt: '1970-01-01T00:00:00.000Z' },
    ]);
  });

  it('drops entries without id or name and exercises without a name', () => {
    const out = normalizeWorkouts([
      { id: 'w1', name: 'A', exercises: [{ name: '' }, { name: 'ok' }, 'junk', null] },
      { name: 'no id' },
      { id: 'no name' },
      42,
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.exercises).toHaveLength(1);
    expect(out[0]!.exercises[0]).toMatchObject({ name: 'ok', sets: 3, reps: 10 });
    expect(out[0]!.exercises[0]!.id).toBeTruthy();
  });

  it('coerces numeric strings and floors non-positive targets to defaults', () => {
    const out = normalizeWorkouts([
      { id: 'w', name: 'A', exercises: [{ id: 'e', name: 'x', sets: '5', reps: 0 }] },
    ]);
    expect(out[0]!.exercises[0]).toMatchObject({ sets: 5, reps: 10 });
  });
});

describe('normalizeSessions', () => {
  it('upgrades v1 sets — `done` derived from a typed value', () => {
    const out = normalizeSessions([
      {
        id: 's1',
        workoutId: 'w1',
        workoutName: 'A',
        startedAt: '2026-09-01T00:00:00.000Z',
        durationSeconds: 17,
        exercises: [
          {
            name: 'Agachamento',
            targetSets: 3,
            targetReps: 8,
            adhoc: false,
            status: 'done',
            sets: [
              { kg: 80, reps: 8 },
              { kg: null, reps: 10 },
              { kg: null, reps: null },
            ],
          },
        ],
      },
    ]);
    expect(out[0]!.exercises[0]!.sets).toEqual([
      { done: true, kg: 80, reps: 8 },
      { done: true, kg: null, reps: 10 },
      { done: false, kg: null, reps: null },
    ]);
  });

  it('respects an explicit v2 `done` even with no values', () => {
    const out = normalizeSessions([
      {
        id: 's',
        exercises: [{ name: 'x', sets: [{ done: true, kg: null, reps: null }, { done: false, kg: 5, reps: 5 }] }],
      },
    ]);
    expect(out[0]!.exercises[0]!.sets.map((s) => s.done)).toEqual([true, false]);
  });

  it('fills defaults and keeps a 0 rep target for adhoc exercises', () => {
    const out = normalizeSessions([
      { id: 's', exercises: [{ name: 'Cadeira', adhoc: true, targetReps: 0, sets: [] }] },
    ]);
    expect(out[0]).toMatchObject({
      workoutId: null,
      workoutName: 'Treino',
      durationSeconds: 0,
    });
    expect(out[0]!.exercises[0]).toMatchObject({
      targetSets: 1,
      targetReps: 0,
      adhoc: true,
      status: 'pending',
    });
  });

  it('drops sessions without an id and unknown statuses fall back to pending', () => {
    const out = normalizeSessions([
      { exercises: [] },
      { id: 's', exercises: [{ name: 'x', status: 'weird' }] },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0]!.exercises[0]!.status).toBe('pending');
  });
});

describe('normalizeActive', () => {
  it('upgrades v1 drafts and drops a running timer with no start stamp', () => {
    const out = normalizeActive({
      session: {
        id: 's1',
        workoutId: 'w1',
        workoutName: 'A',
        startedAt: '2026-09-05T08:00:00.000Z',
        exercises: [
          {
            name: 'Agachamento',
            targetSets: 2,
            targetReps: 8,
            adhoc: false,
            status: 'pending',
            sets: [
              { kg: '80', reps: '' },
              { kg: '', reps: '' },
            ],
          },
        ],
      },
      timer: { running: true, base: 5_000, since: 0 },
    });
    expect(out?.session.exercises[0]!.sets).toEqual([
      { done: true, kg: '80', reps: '' },
      { done: false, kg: '', reps: '' },
    ]);
    expect(out?.timer).toEqual({ running: false, base: 5_000, since: 0 });
  });

  it('keeps a legitimately running timer', () => {
    const out = normalizeActive({
      session: { id: 's', exercises: [] },
      timer: { running: true, base: 0, since: 123 },
    });
    expect(out?.timer).toEqual({ running: true, base: 0, since: 123 });
  });

  it('is null for anything that is not a session', () => {
    expect(normalizeActive(null)).toBe(null);
    expect(normalizeActive({})).toBe(null);
    expect(normalizeActive({ session: { exercises: [] } })).toBe(null);
    expect(normalizeActive('x')).toBe(null);
  });
});

describe('normalizeSettings', () => {
  it('only ever yields a known theme', () => {
    expect(normalizeSettings({ theme: 'pastel' })).toEqual({ theme: 'pastel' });
    expect(normalizeSettings({ theme: 'neon' })).toEqual({ theme: 'dark' });
    expect(normalizeSettings(null)).toEqual({ theme: 'dark' });
  });
});
