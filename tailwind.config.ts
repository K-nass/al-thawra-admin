import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#0066CC',
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
