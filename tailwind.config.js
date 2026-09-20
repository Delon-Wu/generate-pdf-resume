/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'resume-dark': '#1a1a2e',
        'resume-accent': '#4fc3f7',
        'resume-tag': '#e8f4fd',
        'resume-tag-text': '#1565c0',
      }
    },
  },
  plugins: [],
}
