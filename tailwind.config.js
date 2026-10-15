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
          green: "var(--theme-accent, #DC2626)",
          "green-hover": "var(--theme-accent-hover, #B91C1C)",
          "green-dark": "var(--theme-accent-dark, #991B1B)",
          sidebar: "var(--theme-sidebar, #0F1115)",
          "sidebar-hover": "var(--theme-sidebar-hover, #1E232B)",
          "sidebar-active": "var(--theme-sidebar-active, #2A303C)",
          chatbg: "var(--theme-chatbg, #F8FAFC)",
          "chatbg-dark": "var(--theme-chatbg-dark, #0A0C0F)",
          bubble: "var(--theme-bubble, #FFFFFF)",
          "bubble-me": "var(--theme-bubble-me, #DC2626)",
          "bubble-dark": "var(--theme-bubble-dark, #1E222A)",
          "bubble-me-dark": "var(--theme-bubble-me-dark, #B91C1C)",
          gold: "var(--theme-gold, #D4AF37)",
          "gold-hover": "var(--theme-gold-hover, #B89628)",
          "gold-light": "var(--theme-gold-light, #FEF08A)",
        }
      }
    },
  },
  plugins: [],
}
