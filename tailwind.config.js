/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6FAFF',
        surface: '#FFFFFF',
        ink: '#0B1B46',
        muted: '#64748B',
        primary: {
          DEFAULT: '#6754E8',
          2: '#5B8DEF',
        },
        green: '#45B36B',
        yellow: '#FFD166',
        orange: '#FF9F43',
        coral: '#FF6B7A',
        line: '#E2E8F0',
      },
      borderRadius: {
        xl: '24px',
        '2xl': '28px',
      },
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, .08)',
        card: '0 4px 16px rgba(15, 23, 42, .06)',
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        display: ['"Baloo 2"', 'Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
