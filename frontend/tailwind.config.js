/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        "rabbit-red":"#ea2e0c",
      }
    },
  },
  plugins: [require('tailwind-scrollbar-hide'),],
}