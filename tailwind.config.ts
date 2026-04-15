import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#0066CC',
          hover: '#0052a3',
          foreground: '#ffffff',
        },
        'success': {
          DEFAULT: colors.emerald[600],
          hover: colors.emerald[700],
          foreground: colors.emerald[50],
          background: colors.emerald[50], // for subtle backgrounds
          border: colors.emerald[200],
        },
        'warning': {
          DEFAULT: colors.amber[500],
          hover: colors.amber[600],
          foreground: colors.amber[900],
          background: colors.amber[50],
          border: colors.amber[200],
        },
        'error': {
          DEFAULT: colors.red[600],
          hover: colors.red[700],
          foreground: colors.red[50],
          background: colors.red[50],
          border: colors.red[200],
        },
        'surface': {
          DEFAULT: '#ffffff',
          fluid: '#f8fafc',
          muted: '#f1f5f9',
          border: '#e2e8f0',
        },
        // Legacy colors (kept for backwards compatibility while migrating)
        'background-light': '#ffffff',
        'card-light': '#f5f5f5',
        'text-light': '#1a1a1a',
        'text-muted-light': '#555555',
        'border-light': '#e0e0e0',
      },
      fontFamily: {
        arabic: ['Cairo', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
        display: ['Cairo', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
