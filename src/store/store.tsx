import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { KEYS, read, remove, write } from '../lib/storage';
import { toNumberOrNull, uid } from '../lib/format';
import type {
  ActiveRecord,
  ActiveSession,
  Exercise,
  SetEntry,
  Session,
  Theme,
  Workout,
} from '../types';

const IDLE_TIMER = { running: false, base: 0, since: 0 } as const;

type WorkoutInput = {
  name: string;
  exercises: Omit<Exercise, 'id'>[];
};

type StoreValue = {
  workouts: Workout[];
  sessions: Session[];
  theme: Theme;
  active: ActiveSession | null;
  timer: ActiveRecord['timer'];

  createWorkout: (input: WorkoutInput) => Workout;
  updateWorkout: (id: string, input: WorkoutInput) => void;
  deleteWorkout: (id: string) => void;

  startSession: (workout: Workout) => ActiveSession;
  updateActive: (recipe: (session: ActiveSession) => void) => void;
  finishSession: () => void;
  abandonSession: () => void;
  toggleTimer: () => void;

  setTheme: (theme: Theme) => void;
  clearHistory: () => void;
  /** Last logged values for this exercise at this set index, if any. */
  suggestion: (name: string, index: number) => SetEntry | null;
};

const StoreContext = createContext<StoreValue | null>(null);

function withIds(exercises: Omit<Exercise, 'id'>[]): Exercise[] {
  return exercises.map((e) => ({ ...e, id: uid() }));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>(() =>
    read<Workout[]>(KEYS.workouts, []),
  );
  const [sessions, setSessions] = useState<Session[]>(() =>
    read<Session[]>(KEYS.sessions, []),
  );
  const [theme, setThemeState] = useState<Theme>(
    () => read(KEYS.settings, { theme: 'dark' as Theme }).theme ?? 'dark',
  );
  const [record, setRecord] = useState<ActiveRecord | null>(() =>
    read<ActiveRecord | null>(KEYS.active, null),
  );

  useEffect(() => write(KEYS.workouts, workouts), [workouts]);
  useEffect(() => write(KEYS.sessions, sessions), [sessions]);
  useEffect(() => write(KEYS.settings, { theme }), [theme]);

  // The session in progress is persisted on every change so an accidental
  // refresh resumes exactly where it left off (README §6).
  useEffect(() => {
    if (record) write(KEYS.active, record);
    else remove(KEYS.active);
  }, [record]);

  // Theme drives a single attribute; every colour is a CSS custom property.
  useEffect(() => {
    document.documentElement.dataset.pastel = theme === 'pastel' ? '1' : '0';
    const meta = document.querySelector('meta[name="theme-color"]');
    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--bg')
      .trim();
    if (meta && bg) meta.setAttribute('content', bg);
  }, [theme]);

  const createWorkout = useCallback((input: WorkoutInput): Workout => {
    const workout: Workout = {
      id: uid(),
      name: input.name,
      exercises: withIds(input.exercises),
      createdAt: new Date().toISOString(),
    };
    setWorkouts((prev) => [...prev, workout]);
    return workout;
  }, []);

  const updateWorkout = useCallback((id: string, input: WorkoutInput) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, name: input.name, exercises: withIds(input.exercises) }
          : w,
      ),
    );
  }, []);

  // Deleting a template never touches history: sessions keep their snapshot.
  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const startSession = useCallback((workout: Workout): ActiveSession => {
    const session: ActiveSession = {
      id: uid(),
      workoutId: workout.id,
      workoutName: workout.name,
      startedAt: new Date().toISOString(),
      exercises: workout.exercises.map((e) => ({
        name: e.name,
        targetSets: e.sets,
        targetReps: e.reps,
        adhoc: false,
        status: 'pending',
        sets: Array.from({ length: e.sets }, () => ({ kg: '', reps: '' })),
      })),
    };
    setRecord({ session, timer: { ...IDLE_TIMER } });
    return session;
  }, []);

  const updateActive = useCallback(
    (recipe: (session: ActiveSession) => void) => {
      setRecord((prev) => {
        if (!prev) return prev;
        const session = structuredClone(prev.session);
        recipe(session);
        return { ...prev, session };
      });
    },
    [],
  );

  const toggleTimer = useCallback(() => {
    setRecord((prev) => {
      if (!prev) return prev;
      const t = prev.timer;
      const timer = t.running
        ? { running: false, base: t.base + (Date.now() - t.since), since: 0 }
        : { running: true, base: t.base, since: Date.now() };
      return { ...prev, timer };
    });
  }, []);

  // Kept free of state-updater side effects: a React updater may run twice, and
  // this must append to history exactly once.
  const finishSession = useCallback(() => {
    if (!record) return;
    const { session, timer } = record;
    const elapsed = timer.base + (timer.running ? Date.now() - timer.since : 0);
    const done: Session = {
      id: session.id,
      workoutId: session.workoutId,
      workoutName: session.workoutName,
      startedAt: session.startedAt,
      durationSeconds: Math.round(elapsed / 1000),
      exercises: session.exercises.map((e) => ({
        name: e.name,
        targetSets: e.targetSets,
        targetReps: e.targetReps,
        adhoc: e.adhoc,
        status: e.status,
        sets: e.sets.map((s) => ({
          kg: toNumberOrNull(s.kg),
          reps: toNumberOrNull(s.reps),
        })),
      })),
    };
    setSessions((list) => [done, ...list]);
    setRecord(null);
  }, [record]);

  const abandonSession = useCallback(() => setRecord(null), []);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);

  const clearHistory = useCallback(() => setSessions([]), []);

  const suggestion = useCallback(
    (name: string, index: number): SetEntry | null => {
      for (const session of sessions) {
        const match = session.exercises.find((e) => e.name === name);
        const set = match?.sets[index];
        if (set && (set.kg != null || set.reps != null)) return set;
      }
      return null;
    },
    [sessions],
  );

  const value = useMemo<StoreValue>(
    () => ({
      workouts,
      sessions,
      theme,
      active: record?.session ?? null,
      timer: record?.timer ?? IDLE_TIMER,
      createWorkout,
      updateWorkout,
      deleteWorkout,
      startSession,
      updateActive,
      finishSession,
      abandonSession,
      toggleTimer,
      setTheme,
      clearHistory,
      suggestion,
    }),
    [
      workouts,
      sessions,
      theme,
      record,
      createWorkout,
      updateWorkout,
      deleteWorkout,
      startSession,
      updateActive,
      finishSession,
      abandonSession,
      toggleTimer,
      setTheme,
      clearHistory,
      suggestion,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

/**
 * Elapsed milliseconds, recomputed from the start timestamp twice a second
 * while running. Never accumulates, so background tabs stay accurate.
 */
export function useElapsedMs(): number {
  const { timer } = useStore();
  const [, tick] = useState(0);

  useEffect(() => {
    if (!timer.running) return;
    const iv = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(iv);
  }, [timer.running]);

  return timer.base + (timer.running ? Date.now() - timer.since : 0);
}
