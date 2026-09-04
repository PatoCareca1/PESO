/**
 * Design tokens from PESO.dc.html / README §2.
 * Colours resolve to CSS custom properties so the Dark <-> Pastel switch is a
 * single `data-pastel` flip on <html>, exactly like the prototype.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Touch devices should not latch onto :hover after a tap.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-alt': 'var(--surface-alt)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        'accent-text': 'var(--accent-text)',
        line: 'var(--border)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // name: [size, { lineHeight, letterSpacing }]
        display: ['44px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        screen: ['32px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'card-title': ['28px', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'modal-title': ['22px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'history-title': ['18px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        timer: ['64px', { lineHeight: '1', letterSpacing: '-0.02em' }],
        label: ['11px', { lineHeight: '1', letterSpacing: '0.12em' }],
      },
      borderRadius: {
        card: '20px',
        modal: '24px',
        field: '14px',
        chip: '12px',
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
      maxWidth: {
        app: '540px',
        modal: '420px',
      },
      transitionDuration: {
        160: '160ms',
      },
      keyframes: {
        pesoIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        pesoFade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'peso-in': 'pesoIn 200ms ease-out',
        'peso-fade': 'pesoFade 180ms ease-out',
      },
    },
  },
  plugins: [],
};
