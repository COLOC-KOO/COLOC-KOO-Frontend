/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', '"Inter"', 'sans-serif'],
        sans: ['"Inter"', 'Arial', 'sans-serif']
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        'brand-cyan': 'var(--brand-cyan)',
        'brand-cyan-dark': 'var(--brand-cyan-dark)',
        'brand-cyan-light': 'var(--brand-cyan-light)',
        'brand-green': 'var(--brand-green)',
        'brand-green-dark': 'var(--brand-green-dark)',
        'brand-green-light': 'var(--brand-green-light)',
        'brand-olive': 'var(--brand-olive)',
        'brand-magenta': 'var(--brand-magenta)',
        'brand-dark': 'var(--brand-dark)',
        'brand-sand': 'var(--brand-sand)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)'
      }
    }
  },
  plugins: []
}
