import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { ConfirmDialog, type Confirmation } from '../components/ConfirmDialog';
import { BackButton, FieldLabel, QuietButton } from '../components/ui';
import { dateLabel, mmss } from '../lib/format';
import { useStore } from '../store/store';
import type { Theme } from '../types';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'pastel', label: 'Pastel' },
];

export function Profile() {
  const navigate = useNavigate();
  const { sessions, theme, setTheme, clearHistory } = useStore();
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const askClear = () =>
    setConfirmation({
      title: 'Limpar histórico?',
      message: 'Todas as sessões registradas serão apagadas. Os treinos ficam.',
      cta: 'Limpar',
      onConfirm: () => {
        clearHistory();
        setConfirmation(null);
      },
    });

  return (
    <>
      <Screen>
        <BackButton className="mb-7 block" onClick={() => navigate('/')} />

        <h1 className="mb-9 text-display font-bold">Perfil</h1>

        <FieldLabel className="mb-3">Tema</FieldLabel>
        <div
          role="radiogroup"
          aria-label="Tema"
          className="mb-10 flex gap-1 rounded-full border bg-surface p-1"
        >
          {THEMES.map((t) => {
            const on = theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(t.value)}
                className={[
                  'h-11 flex-1 rounded-full text-[15px] font-semibold',
                  'transition-colors duration-160 ease-out',
                  on ? 'bg-accent text-accent-text' : 'bg-transparent text-muted',
                ].join(' ')}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="mb-[14px] flex items-baseline justify-between">
          <FieldLabel>Histórico</FieldLabel>
          <QuietButton onClick={askClear}>limpar</QuietButton>
        </div>

        {sessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => {
              const logged = s.exercises.reduce(
                (total, e) =>
                  total + e.sets.filter((x) => x.kg != null || x.reps != null).length,
                0,
              );
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-card bg-surface px-5 py-[18px] shadow-card"
                >
                  <div className="min-w-0">
                    <div className="mb-1 text-history-title font-semibold">
                      {s.workoutName}
                    </div>
                    <div className="text-[13px] font-normal text-muted">
                      {dateLabel(s.startedAt)} · {logged} séries
                    </div>
                  </div>
                  <div className="text-[16px] font-medium text-muted tabular-nums">
                    {mmss(s.durationSeconds * 1000)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[14px] text-muted">Nenhum treino registrado.</p>
        )}
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
