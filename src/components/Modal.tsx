import { useEffect, useId, useRef, type ReactNode } from 'react';
import { QuietButton } from './ui';

type ModalProps = {
  title: string;
  /** Rendered under the title in muted 13px. */
  subtitle?: ReactNode;
  /** Scrolls when taller than the viewport; header and footer never move. */
  children?: ReactNode;
  /** Actions, pinned below the body. */
  footer?: ReactNode;
  onClose: () => void;
  /** Confirmations sit above the sheet that opened them. */
  layer?: 'sheet' | 'confirm';
  /** Label of a close link next to the title, e.g. "fechar". */
  closeLabel?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** How many modals are open — the body scroll lock survives stacking. */
let openCount = 0;

export function Modal({
  title,
  subtitle,
  children,
  footer,
  onClose,
  layer = 'sheet',
  closeLabel,
}: ModalProps) {
  const titleId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  // The latest `onClose` is read through a ref so the mount effect below never
  // re-runs. Re-running it stole focus from whatever input the user was typing
  // in — on a phone that closes the keyboard after every digit.
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const card = cardRef.current;
    const opener = document.activeElement as HTMLElement | null;

    // A child with `autoFocus` has already claimed focus; leave it alone.
    if (card && !card.contains(document.activeElement)) card.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !card) return;
      const items = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === card)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    openCount += 1;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      openCount -= 1;
      if (openCount === 0) document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, []);

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
        className="flex max-h-full w-full max-w-modal flex-col rounded-modal bg-surface px-6 py-[26px] outline-none animate-peso-in"
      >
        <div className="flex-none">
          <div className="flex items-start justify-between gap-3">
            <h2
              id={titleId}
              className="text-modal-title font-semibold [text-wrap:pretty]"
            >
              {title}
            </h2>
            {closeLabel && (
              <QuietButton className="mt-1 flex-none" onClick={onClose}>
                {closeLabel}
              </QuietButton>
            )}
          </div>
          {subtitle != null && (
            <p className="mt-1.5 text-[13px] text-muted [text-wrap:pretty]">
              {subtitle}
            </p>
          )}
        </div>

        {children != null && (
          <div className="mt-[22px] min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        )}

        {footer != null && <div className="mt-6 flex-none">{footer}</div>}
      </div>
    </div>
  );
}
