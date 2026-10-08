import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca RumboBarato: atardecer (coral), noche (tinta), arena (fondo).
        coral: {
          50: '#FFF3EF', 100: '#FFE3DA', 200: '#FFC4B2', 300: '#FF9C80', 400: '#FF7552',
          500: '#FF5A36', 600: '#ED3F1B', 700: '#C52F12', 800: '#9C2713', 900: '#7E2415',
        },
        tinta: {
          50: '#F2F5FA', 100: '#E2E8F2', 200: '#C3CEE0', 300: '#93A5C4', 400: '#5D76A0',
          500: '#3D5582', 600: '#2C4068', 700: '#203155', 800: '#152341', 900: '#0B1730',
        },
        arena: { 50: '#FFFDF9', 100: '#FAF6F0', 200: '#F3EBDF' },
        selva: { 50: '#E9F8F2', 500: '#12A06E', 600: '#0B8459', 700: '#086747' },
        cielo: { 50: '#EEF3FF', 500: '#2F6BFF', 600: '#1E54E0' },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgba(11,23,48,.06), 0 8px 24px -12px rgba(11,23,48,.18)',
        elevada: '0 2px 4px rgba(11,23,48,.06), 0 24px 48px -20px rgba(11,23,48,.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
