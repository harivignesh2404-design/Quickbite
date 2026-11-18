/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        cream: {
          50: '#fffdf9',
          100: '#fff8f0',
          200: '#fef1e1',
        },
        charcoal: {
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px -6px rgba(17, 24, 39, 0.08)',
        'card-hover': '0 16px 32px -8px rgba(234, 88, 12, 0.16)',
      },
    },
  },
  plugins: [],
};
