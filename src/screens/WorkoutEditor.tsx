import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Screen } from '../components/Screen';
import {
  BackButton,
  FieldLabel,
  OutlineButton,
  PrimaryButton,
  QuietButton,
  TextField,
} from '../components/ui';
import { digits, uid } from '../lib/format';
import { useStore } from '../store/store';

type DraftExercise = {
  key: string;
  /** Set when the row came from the saved template; keeps its id on save. */
  id?: string;
  name: string;
  sets: string;
  reps: string;
};

const blankExercise = (): DraftExercise => ({
  key: uid(),
  name: '',
  sets: '3',
  reps: '10',
});

export function WorkoutEditor({ mode }: { mode: 'create' | 'edit' }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { workouts, createWorkout, updateWorkout } = useStore();

  const editing = mode === 'edit';
  const workout = editing ? workouts.find((w) => w.id === id) : undefined;

  const [name, setName] = useState(() => workout?.name ?? '');
  const [exercises, setExercises] = useState<DraftExercise[]>(() =>
    workout
      ? workout.exercises.map((e) => ({
          key: e.id,
          id: e.id,
          name: e.name,
          sets: String(e.sets),
          reps: String(e.reps),
        }))
      : [blankExercise()],
  );
  const [error, setError] = useState('');

  if (editing && !workout) return <Navigate to="/" replace />;

  const back = () =>
    navigate(editing ? `/treino/${id}` : '/', { replace: true });

  const patch = (index: number, field: keyof DraftExercise, value: string) => {
    setExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
    setError('');
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError('Dê um nome ao treino.');

    const filled = exercises.filter((e) => e.name.trim());
    if (!filled.length) {
      return setError('Adicione ao menos um exercício com nome.');
    }

    const input = {
      name: trimmed,
      exercises: filled.map((e) => ({
        id: e.id,
        name: e.name.trim(),
        sets: Math.max(1, parseInt(e.sets, 10) || 3),
        reps: Math.max(1, parseInt(e.reps, 10) || 10),
      })),
    };

    if (editing) {
      updateWorkout(id, input);
      navigate(`/treino/${id}`, { replace: true });
    } else {
      createWorkout(input);
      navigate('/', { replace: true });
    }
  };

  return (
    <Screen
      header={<BackButton className="block" onClick={back} />}
      footer={
        <>
          <OutlineButton
            className="mb-3"
            onClick={() => setExercises((prev) => [...prev, blankExercise()])}
          >
            + exercício
          </OutlineButton>
          <PrimaryButton onClick={save}>
            {editing ? 'Salvar alterações' : 'Salvar treino'}
          </PrimaryButton>
          {error && (
            <p role="alert" className="mt-4 text-center text-[13px] text-muted">
              {error}
            </p>
          )}
        </>
      }
    >
      <h1 className="mb-8 mt-2 text-display font-bold">
        {editing ? 'Editar treino' : 'Novo treino'}
      </h1>

      <FieldLabel className="mb-[9px]">Nome</FieldLabel>
      <TextField
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError('');
        }}
        placeholder="Full Body C"
        className="mb-8"
        aria-label="Nome do treino"
      />

      <div className="flex flex-col gap-3">
        {exercises.map((e, i) => (
          <div key={e.key} className="rounded-card bg-surface p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <FieldLabel>Exercício {i + 1}</FieldLabel>
              {exercises.length > 1 && (
                <QuietButton
                  onClick={() =>
                    setExercises((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  remover
                </QuietButton>
              )}
            </div>

            <FieldLabel className="mb-2">Nome</FieldLabel>
            <TextField
              value={e.name}
              onChange={(ev) => patch(i, 'name', ev.target.value)}
              placeholder="Agachamento"
              className="mb-4"
              aria-label={`Nome do exercício ${i + 1}`}
            />

            <div className="flex gap-3">
              <div className="min-w-0 flex-1">
                <FieldLabel className="mb-2">Séries</FieldLabel>
                <TextField
                  value={e.sets}
                  onChange={(ev) => patch(i, 'sets', digits(ev.target.value))}
                  inputMode="numeric"
                  className="tabular-nums"
                  aria-label={`Séries do exercício ${i + 1}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <FieldLabel className="mb-2">Reps</FieldLabel>
                <TextField
                  value={e.reps}
                  onChange={(ev) => patch(i, 'reps', digits(ev.target.value))}
                  inputMode="numeric"
                  className="tabular-nums"
                  aria-label={`Reps do exercício ${i + 1}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
