import { useNavigate } from 'react-router-dom';
import { Screen } from '../components/Screen';
import { ChevronIcon, PersonIcon, PlusIcon } from '../components/icons';
import { exerciseCount } from '../lib/format';
import { useStore } from '../store/store';

export function Home() {
  const { workouts } = useStore();
  const navigate = useNavigate();

  return (
    <Screen>
      <div className="mb-10 flex items-center justify-between">
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

      <h1 className="mb-2 text-display font-bold">Treinos</h1>
      <p className="mb-8 text-[14px] font-normal text-muted">Escolha um e comece.</p>

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
