/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        line: {
          green: "#06C755",
          "green-hover": "#05B24C",
          "green-dark": "#048C3C",
          sidebar: "#1E232A",
          "sidebar-hover": "#2B323C",
          "sidebar-active": "#353D49",
          chatbg: "#ABC1D1",
          "chatbg-dark": "#181B20",
          bubble: "#FFFFFF",
          "bubble-me": "#9EEA6A",
          "bubble-dark": "#2E333D",
          "bubble-me-dark": "#057A36",
        }
      }
    },
  },
  plugins: [],
}
