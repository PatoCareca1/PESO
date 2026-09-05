import { Component, type ErrorInfo, type ReactNode } from 'react';
import { clearAll } from '../lib/storage';
import { OutlineButton, PrimaryButton } from './ui';

type State = { error: Error | null; confirmingReset: boolean };

/**
 * Everything lives in localStorage, so a render crash with no way out would
 * lock the user away from their own data for good. This screen offers a
 * reload first and a full reset only behind a second tap.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, confirmingReset: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PESO crashed', error, info.componentStack);
  }

  private reload = () => window.location.reload();

  private reset = () => {
    if (!this.state.confirmingReset) {
      this.setState({ confirmingReset: true });
      return;
    }
    clearAll();
    window.location.replace('/');
  };

  render() {
    const { error, confirmingReset } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col justify-center px-6 py-12">
        <h1 className="mb-2 text-screen font-bold">Algo deu errado.</h1>
        <p className="mb-8 text-[14px] text-muted [text-wrap:pretty]">
          O app travou ao abrir. Seus treinos continuam salvos neste aparelho —
          tente recarregar primeiro.
        </p>

        <PrimaryButton className="mb-3" onClick={this.reload}>
          Recarregar
        </PrimaryButton>
        <OutlineButton onClick={this.reset}>
          {confirmingReset ? 'Confirmar: apagar tudo' : 'Apagar dados e recomeçar'}
        </OutlineButton>

        {confirmingReset && (
          <p role="alert" className="mt-4 text-center text-[13px] text-muted">
            Isso apaga treinos, histórico e a sessão em andamento. Não tem volta.
          </p>
        )}

        <pre className="mt-10 overflow-x-auto whitespace-pre-wrap break-words text-[11px] text-muted opacity-60">
          {error.message}
        </pre>
      </div>
    );
  }
}
