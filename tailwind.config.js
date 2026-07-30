/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#12121a',
        surface2: '#1a1a24',
        primary: '#ff6b35',
        primaryDark: '#e55a2b',
        secondary: '#00d4aa',
        text: '#ffffff',
        textSecondary: '#a0a0b0',
        border: '#2a2a3a',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
