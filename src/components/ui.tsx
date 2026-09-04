import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function cx(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Full-width pill on the accent. Height 52px. */
export function PrimaryButton({ className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'h-[52px] w-full rounded-full bg-accent text-[16px] font-semibold text-accent-text',
        'transition-opacity duration-160 ease-out hover:opacity-[0.88]',
        'disabled:cursor-default disabled:opacity-40',
        className,
      )}
    />
  );
}

/** Full-width pill, transparent with a hairline border. Height 52px. */
export function OutlineButton({
  className,
  hoverSurface = 'surface',
  ...props
}: ButtonProps & { hoverSurface?: 'surface' | 'surface-alt' }) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'h-[52px] w-full rounded-full border bg-transparent text-[16px] font-medium text-text',
        'transition-colors duration-160 ease-out',
        hoverSurface === 'surface' ? 'hover:bg-surface' : 'hover:bg-surface-alt',
        className,
      )}
    />
  );
}

/** Bare 13px text link — used for every secondary and destructive action. */
export function QuietButton({ className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'p-0 text-[13px] text-muted transition-colors duration-160 ease-out hover:text-text',
        className,
      )}
    />
  );
}

/** `← VOLTAR` at the top of every secondary screen. */
export function BackButton({ className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'p-0 text-label font-semibold uppercase text-muted',
        'transition-colors duration-160 ease-out hover:text-text',
        className,
      )}
    >
      ← voltar
    </button>
  );
}

export function FieldLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'text-label font-semibold uppercase text-muted',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 52px form input, radius 14px. */
export function TextField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        'h-[52px] w-full rounded-field border bg-surface-alt px-4 text-[16px] font-medium text-text',
        'outline-none transition-colors duration-160 ease-out focus:border-accent',
        className,
      )}
    />
  );
}

/** Card surface: radius 20px, soft shadow in Pastel only. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('rounded-card bg-surface shadow-card', className)}>
      {children}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cx('h-px bg-line', className)} />;
}
