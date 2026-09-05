import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { ChevronIcon, PersonIcon, PlusIcon } from '../components/icons';
import { exerciseCount, mmss } from '../lib/format';
import { useElapsedMs, useStore } from '../store/store';

/**
 * A session in progress is never hidden: whichever way the user got back
 * here, the card on top takes them straight back into it.
 */
function ActiveBanner() {
  const { active } = useStore();
  const navigate = useNavigate();
  const elapsed = useElapsedMs();
  if (!active) return null;

  return (
    <button
      type="button"
      onClick={() => navigate(`/sessao/${active.id}`)}
      className="mb-3 flex w-full items-center gap-[14px] rounded-card bg-accent p-5 text-left text-accent-text transition-opacity duration-160 ease-out hover:opacity-[0.88]"
    >
      <span className="min-w-0 flex-1">
        <span className="mb-[9px] block text-label font-semibold uppercase opacity-70">
          Em andamento · {mmss(elapsed)}
        </span>
        <span className="block truncate text-card-title font-bold">
          {active.workoutName}
        </span>
      </span>
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-full border"
        style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}
      >
        <ChevronIcon />
      </span>
    </button>
  );
}

export function Home() {
  const { workouts } = useStore();
  const navigate = useNavigate();

  return (
    <Screen
      header={
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Perfil"
            onClick={() => navigate('/perfil')}
            className="flex h-11 w-11 items-center justify-center rounded-full border bg-surface text-text shadow-card transition-colors duration-160 ease-out hover:bg-surface-alt"
          >
            <PersonIcon />
          </button>
          <button
            type="button"
            aria-label="Novo treino"
            onClick={() => navigate('/novo')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-text transition-opacity duration-160 ease-out hover:opacity-[0.88]"
          >
            <PlusIcon />
          </button>
        </div>
      }
    >
      <h1 className="mb-2 mt-5 text-display font-bold">Treinos</h1>
      <p className="mb-8 text-[14px] font-normal text-muted">Escolha um e comece.</p>

      <ActiveBanner />

      {workouts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {workouts.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => navigate(`/treino/${w.id}`)}
              className="flex w-full items-center gap-[14px] rounded-card bg-surface p-5 text-left shadow-card transition-colors duration-160 ease-out hover:bg-surface-alt"
            >
              <span className="min-w-0 flex-1">
                <span className="mb-[9px] block text-label font-semibold uppercase text-muted">
                  {exerciseCount(w.exercises.length)}
                </span>
                <span className="block text-card-title font-bold">{w.name}</span>
              </span>
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full border text-muted">
                <ChevronIcon />
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[14px] text-muted">Nenhum treino ainda.</p>
      )}
    </Screen>
  );
}
