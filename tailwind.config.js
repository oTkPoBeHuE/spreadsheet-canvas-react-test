/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e6ff',
          200: '#b2ceff',
          300: '#88b2ff',
          400: '#5b8cff',
          500: '#3665ff',
          600: '#2346d6',
          700: '#1a35a3',
          800: '#132773',
          900: '#0c1947',
        },
        slate: {
          25: '#fbfcfe',
          50: '#f6f7fb',
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        panel: '0px 10px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
