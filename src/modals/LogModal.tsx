import { Modal } from '../components/Modal';
import { OutlineButton, PrimaryButton, QuietButton } from '../components/ui';
import { decimal, digits } from '../lib/format';
import { useStore } from '../store/store';
import type { ActiveExercise } from '../types';

const CELL =
  'h-11 min-w-0 flex-1 rounded-chip border bg-surface-alt px-[14px] text-center text-[15px] font-medium text-text tabular-nums outline-none transition-colors duration-160 ease-out focus:border-accent';

export function LogModal({
  exercise,
  index,
  onClose,
}: {
  exercise: ActiveExercise;
  index: number;
  onClose: () => void;
}) {
  const { updateActive, suggestion } = useStore();

  const target = exercise.adhoc
    ? `exercício avulso · ${exercise.targetSets} séries`
    : `alvo: ${exercise.targetSets} × ${exercise.targetReps}`;

  const setField = (row: number, field: 'kg' | 'reps', value: string) =>
    updateActive((session) => {
      const set = session.exercises[index]?.sets[row];
      if (set) set[field] = value;
    });

  const addSet = () =>
    updateActive((session) => {
      session.exercises[index]?.sets.push({ kg: '', reps: '' });
    });

  const removeSet = () =>
    updateActive((session) => {
      const target = session.exercises[index];
      if (target && target.sets.length > 1) target.sets.pop();
    });

  const mark = (status: 'done' | 'skipped') => {
    updateActive((session) => {
      const target = session.exercises[index];
      if (target) target.status = status;
    });
    onClose();
  };

  const drop = () => {
    updateActive((session) => {
      session.exercises.splice(index, 1);
    });
    onClose();
  };

  return (
    <Modal title={exercise.name} subtitle={target} onClose={onClose} scrollable>
      <div className="mb-[14px] flex flex-col gap-[10px]">
        {exercise.sets.map((set, row) => {
          // Last time's numbers show as an editable grey suggestion.
          const hint = suggestion(exercise.name, row);
          return (
            <div key={row} className="flex items-center gap-[10px]">
              <div className="flex h-11 w-9 flex-none items-center justify-center rounded-chip border bg-surface-alt text-[14px] font-semibold text-muted tabular-nums">
                {row + 1}
              </div>
              <input
                value={set.kg}
                onChange={(e) => setField(row, 'kg', decimal(e.target.value))}
                placeholder={hint?.kg != null ? String(hint.kg) : 'kg'}
                inputMode="decimal"
                aria-label={`Série ${row + 1}, carga em kg`}
                className={CELL}
              />
              <input
                value={set.reps}
                onChange={(e) => setField(row, 'reps', digits(e.target.value))}
                placeholder={hint?.reps != null ? String(hint.reps) : 'reps'}
                inputMode="numeric"
                aria-label={`Série ${row + 1}, repetições`}
                className={CELL}
              />
            </div>
          );
        })}
      </div>

      <div className="mb-6 flex justify-between">
        <QuietButton onClick={addSet}>+ série</QuietButton>
        <QuietButton onClick={removeSet}>– série</QuietButton>
      </div>

      <PrimaryButton className="mb-3" onClick={() => mark('done')}>
        Concluir exercício
      </PrimaryButton>
      <OutlineButton hoverSurface="surface-alt" onClick={() => mark('skipped')}>
        Não fiz esse
      </OutlineButton>
      <QuietButton className="mt-[18px] block w-full text-center" onClick={drop}>
        tirar da sessão
      </QuietButton>
    </Modal>
  );
}
