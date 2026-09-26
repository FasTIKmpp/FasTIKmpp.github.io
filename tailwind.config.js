/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          alt: 'rgb(var(--color-surface-alt) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          dim: 'rgb(var(--color-ink-dim) / <alpha-value>)',
        },
        gold: '#C9A05C',
        category: {
          investment: '#4FB286',
          required: '#5B8DEF',
          recovery: '#D9A63E',
          leak: '#E2555B',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'balance-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ring-fill': {
          from: { strokeDashoffset: 'var(--ring-from)' },
          to: { strokeDashoffset: 'var(--ring-to)' },
        },
      },
      animation: {
        'balance-pulse': 'balance-pulse 2.4s ease-in-out infinite',
        'slide-up': 'slide-up 0.35s ease-out',
        'ring-fill': 'ring-fill 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
    },
  },
  plugins: [],
}
