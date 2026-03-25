/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        gnostic: ['Cinzel', 'serif'], // Approximation or custom
      },
      colors: {
        gold: {
          500: '#eab308',
          200: '#fef08a',
        }
      },
      boxShadow: {
        glow: '0 0 10px #eab308, 0 0 20px #eab308',
      }
    },
  },
  plugins: [],
}
