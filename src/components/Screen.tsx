import type { ReactNode } from 'react';

/**
 * The single column every screen lives in.
 *
 * The prototype ran inside a 402pt device frame whose status bar is exactly
 * 62px tall, and its content padding of `62px 24px 48px` sits flush against
 * it. Here that becomes the real safe area, with a floor so the layout still
 * breathes in a plain browser tab where the insets are 0.
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto w-full max-w-app px-6"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 28px)',
        paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 14px), 48px)',
      }}
    >
      {children}
    </div>
  );
}
