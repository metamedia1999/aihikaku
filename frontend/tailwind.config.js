/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0E77FF',
          light: '#3E93FF',
          dark: '#0A5FCB',
        },
        neutral: {
          DEFAULT: '#f5f7fa',
          100: '#f5f7fa',
          200: '#e4e7eb',
          300: '#cbd2d9',
          400: '#9aa5b1',
          500: '#7b8794',
          600: '#616e7c',
          700: '#52606d',
          800: '#3e4c59',
          900: '#323f4b',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
      },
      boxShadow: {
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};