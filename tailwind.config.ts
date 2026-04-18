import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0B5FFF',
          dark: '#0944BF',
          light: '#3E82FF',
          soft: '#EEF4FF'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        float: '0 12px 40px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(15, 23, 42, 0.06)'
      },
      keyframes: {
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateY(6px) translateX(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0) translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateY(6px) translateX(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0) translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseDot: {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'scale(0.85)' },
          '30%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'slide-in-left': 'slideInLeft 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slideInRight 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 300ms ease-out both',
        'pulse-dot': 'pulseDot 1200ms ease-in-out infinite'
      }
    }
  },
  plugins: []
};

export default config;
