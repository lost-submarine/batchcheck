/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effaf8',
          100: '#d5f2ee',
          200: '#aee5de',
          300: '#7bd0c8',
          400: '#48b5ac',
          500: '#2a998f',
          600: '#1f7b75',
          700: '#1c6360',
          800: '#1a5050',
          900: '#184343',
          950: '#0a2a2b',
        },
        cream: '#faf8f4',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
