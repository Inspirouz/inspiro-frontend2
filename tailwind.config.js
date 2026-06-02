/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'sans-serif'],
      },
      colors: {
        primary: '#D9F743',
        background: {
          DEFAULT: '#111111',
          secondary: '#161616',
          tertiary: '#242424',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#7C7C7C',
          tertiary: '#888888',
        },
        hover: '#2B310D',
      },
      borderRadius: {
        'xl': '50px',
        'lg': '30px',
      },
    },
  },
  plugins: [],
}












