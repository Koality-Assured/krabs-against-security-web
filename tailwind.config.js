/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#030b17',
          900: '#07162c',
          800: '#0c274c',
          700: '#143d73',
          600: '#1d579f',
          500: '#2570ce',
          400: '#4c93eb',
          300: '#83b8f3',
        },
        krabs: {
          red: '#dc2626',
          gold: '#f59e0b',
          amber: '#d97706',
          patty: '#854d0e',
          chum: '#4ade80',
          kelp: '#10b981',
          deckRed: '#b91c1c',
          deckAmber: '#d97706',
          deckPurple: '#7c3aed',
          deckBrown: '#92400e',
          deckBlue: '#0284c7',
          deckSlate: '#475569'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Baskerville', 'serif'],
        mono: ['Courier New', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
