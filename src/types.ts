export type Theme = 'dark' | 'pastel';

export type Settings = {
  theme: Theme;
};

/* ── Templates ─────────────────────────────────────────────────────────── */

export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
};

export type Workout = {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string; // ISO
};

/* ── History ───────────────────────────────────────────────────────────── */

export type ExerciseStatus = 'pending' | 'done' | 'skipped';

export type SetEntry = {
  kg: number | null;
  reps: number | null;
};

export type SessionExercise = {
  name: string;
  targetSets: number;
  targetReps: number;
  /** true = added during this session only; never written to a template. */
  adhoc: boolean;
  status: ExerciseStatus;
  sets: SetEntry[];
};

export type Session = {
  id: string;
  /** null once the template it came from is deleted. */
  workoutId: string | null;
  /** Snapshot — survives deletion of the template. */
  workoutName: string;
  startedAt: string; // ISO
  durationSeconds: number;
  exercises: SessionExercise[];
};

/* ── Session in progress ───────────────────────────────────────────────── */

/**
 * While a session runs, kg/reps are held as raw strings: the field is empty
 * until the user types, and "" must stay distinct from 0. They are coerced to
 * `number | null` once the session is written to history.
 */
export type DraftSet = {
  kg: string;
  reps: string;
};

export type ActiveExercise = Omit<SessionExercise, 'sets'> & {
  sets: DraftSet[];
};

export type ActiveSession = Omit<Session, 'durationSeconds' | 'exercises'> & {
  exercises: ActiveExercise[];
};

/**
 * Elapsed time is derived from a start timestamp, never incremented, so a
 * backgrounded tab does not lose time (README §6).
 */
export type TimerState = {
  running: boolean;
  /** Milliseconds banked from previous runs. */
  base: number;
  /** Date.now() when the current run started; 0 when paused. */
  since: number;
};

export type ActiveRecord = {
  session: ActiveSession;
  timer: TimerState;
};
