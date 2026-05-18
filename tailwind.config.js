/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f5f0',
          100: '#e8e8e0',
          200: '#d0d0c4',
          300: '#a8a898',
          400: '#78786a',
          500: '#585850',
          600: '#404038',
          700: '#303028',
          800: '#202018',
          900: '#141410',
          950: '#0a0a08',
        },
        ember: {
          50: '#fff5ed',
          100: '#ffe8d0',
          200: '#ffcc9a',
          300: '#ffa860',
          400: '#ff7e28',
          500: '#ff5a00',
          600: '#e04200',
          700: '#b83200',
          800: '#932800',
          900: '#782200',
        },
        gold: {
          300: '#f5d87a',
          400: '#edc84a',
          500: '#d4a900',
          600: '#a88400',
        },
        slate: {
          850: '#0f172a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
