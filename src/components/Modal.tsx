import { useEffect, useId, useRef, type ReactNode } from 'react';
import { QuietButton } from './ui';

type ModalProps = {
  title: string;
  /** Rendered under the title in muted 13px. */
  subtitle?: ReactNode;
  children?: ReactNode;
  onClose: () => void;
  /** Confirmations sit above the sheet that opened them. */
  layer?: 'sheet' | 'confirm';
  /** Shows a `fechar` link next to the title and lets the card scroll. */
  scrollable?: boolean;
};

export function Modal({
  title,
  subtitle,
  children,
  onClose,
  layer = 'sheet',
  scrollable = false,
}: ModalProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className={[
        'fixed inset-0 flex items-center justify-center bg-black/45 p-6',
        'backdrop-blur-[10px] animate-peso-fade',
        layer === 'confirm' ? 'z-[90]' : 'z-[80]',
      ].join(' ')}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          'w-full max-w-modal rounded-modal bg-surface px-6 py-[26px] outline-none',
          'animate-peso-in',
          scrollable ? 'max-h-full overflow-auto' : '',
        ].join(' ')}
      >
        {scrollable ? (
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <h2
              id={titleId}
              className="text-modal-title font-semibold [text-wrap:pretty]"
            >
              {title}
            </h2>
            <QuietButton className="mt-1 flex-none" onClick={onClose}>
              fechar
            </QuietButton>
          </div>
        ) : (
          <h2
            id={titleId}
            className="mb-2 text-modal-title font-semibold [text-wrap:pretty]"
          >
            {title}
          </h2>
        )}

        {subtitle != null && (
          <p
            className={[
              'text-[13px] text-muted [text-wrap:pretty]',
              scrollable ? 'mb-[22px]' : 'mb-6',
            ].join(' ')}
          >
            {subtitle}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
