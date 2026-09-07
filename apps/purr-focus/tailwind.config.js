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
          calm: "#38bdf8",
        }
      },
      animation: {
        'knead-left': 'kneadLeft 1.2s infinite ease-in-out',
        'knead-right': 'kneadRight 1.2s infinite ease-in-out',
        'purr-vibrate': 'purrVibrate 0.15s infinite alternate',
        'breathe': 'breathe 4s infinite ease-in-out',
        'float-bubble': 'floatBubble 3s infinite ease-in-out',
      },
      keyframes: {
        kneadLeft: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(5px) scale(1.15)' },
        },
        kneadRight: {
          '0%, 100%': { transform: 'translateY(5px) scale(1.15)' },
          '50%': { transform: 'translateY(0) scale(1)' },
        },
        purrVibrate: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(0.5px, -0.5px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        floatBubble: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
