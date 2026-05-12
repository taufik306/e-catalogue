/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#fdfbfb',
          DEFAULT: '#ebedee',
          dark: '#e2ebf0',
        }
      }
    },
  },
  plugins: [],
}
