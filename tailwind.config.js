/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#183D35', light: '#245148', dark: '#10291F' },
        sand: { DEFAULT: '#E9E2D2', deep: '#D3C8AE', pale: '#F1ECDF' },
        ivory: '#F8F6F0',
        sage: { DEFAULT: '#A8B8A0', deep: '#4F6649', pale: '#DCE5D6' },
        terra: { DEFAULT: '#C87958', deep: '#9A4F33', pale: '#F3DFD4' },
        ink: { DEFAULT: '#1F2A26', soft: '#68726D' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(24,61,53,0.05), 0 10px 28px -14px rgba(24,61,53,0.18)',
      },
      keyframes: {
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        rise: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fade: 'fade 180ms ease-out',
        rise: 'rise 240ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
