import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { ConfirmDialog, type Confirmation } from '../components/ConfirmDialog';
import { Divider, OutlineButton, PrimaryButton, QuietButton } from '../components/ui';
import { AdhocModal } from '../modals/AdhocModal';
import { LogModal } from '../modals/LogModal';
import { mmss } from '../lib/format';
import { doneCount } from '../lib/session';
import { useElapsedMs, useStore } from '../store/store';

export function Session() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { active, timer, toggleTimer, finishSession, abandonSession } = useStore();
  const elapsed = useElapsedMs();

  const [sheet, setSheet] = useState<'adhoc' | { log: number } | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // The session is the source of truth; a stale URL just goes home.
  if (!active || active.id !== id) return <Navigate to="/" replace />;

  const timerLabel = timer.running
    ? 'Pausar'
    : timer.base > 0
      ? 'Retomar'
      : 'Iniciar cronômetro';

  const askAbandon = () =>
    setConfirmation({
      title: 'Sair sem salvar?',
      message: 'Nada desta sessão vai para o histórico.',
      cta: 'Sair',
      onConfirm: () => {
        abandonSession();
        navigate('/', { replace: true });
      },
    });

  const finish = () => {
    finishSession();
    navigate('/', { replace: true });
  };

  const logIndex = typeof sheet === 'object' && sheet !== null ? sheet.log : null;
  const logExercise = logIndex != null ? active.exercises[logIndex] : undefined;

  return (
    <>
      <Screen
        footer={
          <>
            <OutlineButton className="mb-3" onClick={() => setSheet('adhoc')}>
              + exercício nesta sessão
            </OutlineButton>
            <PrimaryButton onClick={finish}>Finalizar treino</PrimaryButton>
            <QuietButton
              className="mt-[22px] block w-full text-center"
              onClick={askAbandon}
            >
              sair sem salvar
            </QuietButton>
          </>
        }
      >
        <div className="mb-[22px] text-center text-label font-semibold uppercase text-muted">
          {active.workoutName}
        </div>

        <div
          className="mb-[22px] text-center text-timer font-bold tabular-nums"
          role="timer"
          aria-live="off"
        >
          {mmss(elapsed)}
        </div>

        <button
          type="button"
          onClick={toggleTimer}
          className="mx-auto mb-8 block h-11 rounded-full border bg-transparent px-[26px] text-[15px] font-medium text-text transition-colors duration-160 ease-out hover:bg-surface"
        >
          {timerLabel}
        </button>

        <Divider className="mb-7" />

        <div className="flex flex-col gap-3">
          {active.exercises.map((e, i) => (
            <button
              key={`${e.name}-${i}`}
              type="button"
              onClick={() => setSheet({ log: i })}
              className="flex min-h-[60px] w-full items-center justify-between gap-3 rounded-card bg-surface px-5 text-left shadow-card transition-colors duration-160 ease-out hover:bg-surface-alt"
            >
              <span
                className={[
                  'text-[16px] font-medium',
                  e.status === 'pending' ? 'opacity-100' : 'opacity-[0.45]',
                  e.status === 'skipped' ? 'line-through' : '',
                ].join(' ')}
              >
                {e.name}
              </span>
              <span className="text-[15px] font-medium text-muted tabular-nums">
                {doneCount(e)}/{e.targetSets}
              </span>
            </button>
          ))}
        </div>
      </Screen>

      {sheet === 'adhoc' && <AdhocModal onClose={() => setSheet(null)} />}

      {logExercise && logIndex != null && (
        <LogModal
          exercise={logExercise}
          index={logIndex}
          onClose={() => setSheet(null)}
        />
      )}

      {confirmation && (
        <ConfirmDialog
          confirmation={confirmation}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </>
  );
}
