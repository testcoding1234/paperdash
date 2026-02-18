/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'epaper-black': '#000000',
        'epaper-white': '#FFFFFF',
        'epaper-red': '#FF0000',
        'epaper-yellow': '#FFFF00',
      },
    },
  },
  plugins: [],
}
