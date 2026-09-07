/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          bg: "#121319",
          card: "#1b1c24",
          cardHover: "#232530",
          border: "#2b2d3b",
          primary: "#f6a354",
          primaryHover: "#ffb46e",
          accent: "#ff6584",
          violet: "#a78bfa",
          fur: "#fcd581",
          nose: "#ff9fb2",
          eyes: "#34d399",
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'Courier New', 'monospace'],
      },
      animation: {
        'bounce-gentle': 'bounceGentle 2s infinite ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
      },
      keyframes: {
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
