import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { ConfirmDialog, type Confirmation } from '../components/ConfirmDialog';
import { BackButton, PrimaryButton, QuietButton } from '../components/ui';
import { useStore } from '../store/store';

export function WorkoutDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { workouts, active, deleteWorkout, startSession } = useStore();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const workout = workouts.find((w) => w.id === id);
  if (!workout) return <Navigate to="/" replace />;

  const askDelete = () =>
    setConfirmation({
      title: 'Excluir treino?',
      message:
        'O molde sai da lista. As sessões já registradas continuam no histórico.',
      cta: 'Excluir',
      onConfirm: () => {
        deleteWorkout(workout.id);
        navigate('/', { replace: true });
      },
    });

  const start = () => {
    const session = startSession(workout);
    navigate(`/sessao/${session.id}`);
  };

  // Starting over the top of a running session used to wipe it silently.
  const begin = () => {
    if (!active) return start();
    setConfirmation({
      title: 'Treino em andamento',
      message: `${active.workoutName} ainda não foi finalizado. Começar outro descarta o que já foi registrado nele.`,
      cta: 'Descartar e começar',
      onConfirm: start,
      alt: {
        label: 'Retomar o que está aberto',
        onClick: () => navigate(`/sessao/${active.id}`),
      },
    });
  };

  return (
    <>
      <Screen
        header={<BackButton className="block" onClick={() => navigate('/')} />}
        footer={
          <>
            <PrimaryButton onClick={begin}>Começar</PrimaryButton>
            <div className="mt-[22px] flex items-center justify-center gap-4">
              <QuietButton onClick={() => navigate(`/treino/${workout.id}/editar`)}>
                editar treino
              </QuietButton>
              <span className="h-3 w-px bg-line" />
              <QuietButton onClick={askDelete}>excluir treino</QuietButton>
            </div>
          </>
        }
      >
        <h1 className="mb-7 mt-2 text-screen font-bold">{workout.name}</h1>

        <div className="flex flex-col gap-3">
          {workout.exercises.map((e) => (
            <div
              key={e.id}
              className="flex min-h-[60px] items-center justify-between gap-3 rounded-card bg-surface px-5 shadow-card"
            >
              <span className="text-[16px] font-medium">{e.name}</span>
              <span className="whitespace-nowrap text-[16px] font-medium text-muted">
                {e.sets}
                <span className="mx-[3px] text-[12px] opacity-60">×</span>
                {e.reps}
              </span>
            </div>
          ))}
        </div>
      </Screen>

      {confirmation && (
        <ConfirmDialog
          confirmation={confirmation}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </>
  );
}
