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
import { uid } from '../lib/format';
import {
  SCHEMA_VERSION,
  normalizeActive,
  normalizeSessions,
  normalizeSettings,
  normalizeWorkouts,
} from '../lib/migrate';
import {
  IDLE_TIMER,
  completeSession,
  elapsedMs,
  findSuggestion,
  newActiveSession,
  toggledTimer,
} from '../lib/session';
import type {
  ActiveRecord,
  ActiveSession,
  Exercise,
  SetEntry,
  Session,
  Theme,
  Workout,
} from '../types';

type WorkoutInput = {
  name: string;
  /** `id` present = existing exercise, kept stable across edits. */
  exercises: (Omit<Exercise, 'id'> & { id?: string })[];
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

  /** Replaces any session in progress — callers confirm first. */
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

function withIds(exercises: WorkoutInput['exercises']): Exercise[] {
  return exercises.map((e) => ({ ...e, id: e.id ?? uid() }));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // Every slice is normalised on the way in: the data may predate this build.
  const [workouts, setWorkouts] = useState<Workout[]>(() =>
    normalizeWorkouts(read<unknown>(KEYS.workouts, [])),
  );
  const [sessions, setSessions] = useState<Session[]>(() =>
    normalizeSessions(read<unknown>(KEYS.sessions, [])),
  );
  const [theme, setThemeState] = useState<Theme>(
    () => normalizeSettings(read<unknown>(KEYS.settings, null)).theme,
  );
  const [record, setRecord] = useState<ActiveRecord | null>(() =>
    normalizeActive(read<unknown>(KEYS.active, null)),
  );

  useEffect(() => write(KEYS.schema, SCHEMA_VERSION), []);
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

  // Deleting a template never touches the snapshots in history; only the
  // back-reference is cleared, as README §4 specifies.
  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
    setSessions((prev) =>
      prev.map((s) => (s.workoutId === id ? { ...s, workoutId: null } : s)),
    );
    setRecord((prev) =>
      prev && prev.session.workoutId === id
        ? { ...prev, session: { ...prev.session, workoutId: null } }
        : prev,
    );
  }, []);

  const startSession = useCallback((workout: Workout): ActiveSession => {
    const session = newActiveSession(workout);
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
    setRecord((prev) => (prev ? { ...prev, timer: toggledTimer(prev.timer) } : prev));
  }, []);

  // Kept free of state-updater side effects: a React updater may run twice, and
  // this must append to history exactly once.
  const finishSession = useCallback(() => {
    if (!record) return;
    const done = completeSession(record);
    setSessions((list) => [done, ...list]);
    setRecord(null);
  }, [record]);

  const abandonSession = useCallback(() => setRecord(null), []);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);

  const clearHistory = useCallback(() => setSessions([]), []);

  const suggestion = useCallback(
    (name: string, index: number) => findSuggestion(sessions, name, index),
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

  return elapsedMs(timer);
}
