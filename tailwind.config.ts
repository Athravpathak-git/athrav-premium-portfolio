import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        cream: {
          DEFAULT: '#F5F0E6',
          50: '#FFFDF7',
          100: '#FAF6EE',
          200: '#F5F0E6',
          300: '#EAE3D2',
          400: '#DDD2BD',
          500: '#CFC0A5',
        },
        forest: {
          DEFAULT: '#183D32',
          50: '#F0F5F3',
          100: '#D9E6E1',
          200: '#B0CCC3',
          300: '#7EAEA0',
          400: '#4F8D7B',
          500: '#2A6B5B',
          600: '#225345',
          700: '#183D32',
          800: '#122D25',
          900: '#0E261F',
          950: '#081713',
        },
        sage: {
          DEFAULT: '#A8B9A0',
          50: '#F4F7F3',
          100: '#E7EDE4',
          200: '#D3DFCF',
          300: '#BDCEB7',
          400: '#A8B9A0',
          500: '#8E9F86',
          600: '#73876B',
          700: '#586752',
          800: '#414C3D',
        },
        ivory: {
          DEFAULT: '#FFFDF7',
          card: '#FFFDF7',
          surface: '#FDFBF5',
          border: '#E8E1D1',
        },
        champagne: {
          DEFAULT: '#B49A68',
          50: '#FAF7F0',
          100: '#F2EDE0',
          200: '#E4D9BF',
          300: '#D1BF96',
          400: '#C2AB7D',
          500: '#B49A68',
          600: '#998150',
          700: '#7E683E',
          800: '#5F4E2F',
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Inter',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Cascadia Mono',
          'monospace',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'spin-slow': 'spin 24s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
