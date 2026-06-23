/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charte Sarintany'COLOC
        'sc-y1': '#CCCC33',
        'sc-y2': '#99CC33',
        'sc-cy': '#46BDD6',
        'sc-cy-d': '#3aadca',
        'sc-dark': '#2C2C2C',
        'sc-gr1': '#666666',
        'sc-gr2': '#999999',
        'sc-bd': '#e8e8e8',
        'sc-bg': '#f5f7f2',
        'sc-cy-lt': '#E8F7FA',
        'sc-g-lt': '#F4F8E8',
        'sc-red': '#cc3333',
        'sc-red-lt': '#fdeced',
        'sc-warn': '#E2B53A',
        'sc-danger': '#E0604E',
        'sc-mag': '#CD6CA8',
        // Backoffice dark
        'bo-bg': '#1f2023',
        'bo-panel': '#26272b',
        'bo-panel2': '#2c2e33',
        'bo-line': '#3a3c42',
        'bo-txt': '#e9eaec',
        'bo-muted': '#9a9da4',
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'Arial', 'sans-serif'],
        'sans': ['Arial', 'Helvetica', 'sans-serif'],
      },
      letterSpacing: {
        'bebas': '0.03em',
      },
      borderRadius: {
        'sc': '12px',
        'sc-lg': '16px',
      },
      boxShadow: {
        'sc': '0 4px 18px rgba(44,44,44,.08)',
        'sc-lg': '0 6px 24px rgba(0,0,0,.14)',
      },
    },
  },
  plugins: [],
}
