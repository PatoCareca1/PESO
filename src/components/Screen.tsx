import type { CSSProperties, ReactNode } from 'react';

/**
 * The single column every screen lives in.
 *
 * Only the middle scrolls. `header` and `footer` stay put — pinned to the top
 * and bottom of the viewport — so the actions are always in the same place
 * no matter how long the list in between gets. Each pinned band fades into
 * the background so content slides under it instead of being cut off.
 *
 * The prototype ran inside a 402pt device frame whose status bar is exactly
 * 62px tall. Here that becomes the real safe area, with a floor so the layout
 * still breathes in a plain browser tab where the insets are 0.
 */
const SAFE_TOP = 'max(env(safe-area-inset-top, 0px), 28px)';
const SAFE_BOTTOM = 'max(calc(env(safe-area-inset-bottom, 0px) + 14px), 48px)';

const headerBand: CSSProperties = {
  paddingTop: SAFE_TOP,
  background:
    'linear-gradient(to bottom, var(--bg) 0%, var(--bg) calc(100% - 20px), transparent 100%)',
};

const footerBand: CSSProperties = {
  paddingBottom: SAFE_BOTTOM,
  background:
    'linear-gradient(to top, var(--bg) 0%, var(--bg) calc(100% - 24px), transparent 100%)',
};

export function Screen({
  header,
  children,
  footer,
}: {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-app flex-col">
      {header && (
        <div className="sticky top-0 z-20 px-6 pb-5" style={headerBand}>
          {header}
        </div>
      )}

      <div
        className="flex-1 px-6"
        style={{
          paddingTop: header ? 0 : SAFE_TOP,
          paddingBottom: footer ? 8 : SAFE_BOTTOM,
        }}
      >
        {children}
      </div>

      {footer && (
        <div className="sticky bottom-0 z-20 px-6 pt-6" style={footerBand}>
          {footer}
        </div>
      )}
    </div>
  );
}
