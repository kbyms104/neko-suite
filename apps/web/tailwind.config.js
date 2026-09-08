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
          card: "#1a1c26",
          cardHover: "#232634",
          border: "#2b2e40",
          primary: "#f6a354",
          primaryHover: "#ffb469",
          accent: "#ff6584",
          fur: "#fcd581",
          nose: "#ff9fb2",
          eyes: "#34d399",
          violet: "#a855f7",
          cyan: "#38bdf8",
        }
      },
      animation: {
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2.5s infinite ease-in-out',
        'munch': 'munch 0.22s infinite alternate ease-in-out',
        'punch': 'cutePunch 1.8s ease-in-out forwards',
        'pop-hearts': 'popHearts 1.8s ease-in-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'knead-left': 'kneadLeft 1.2s infinite ease-in-out',
        'knead-right': 'kneadRight 1.2s infinite ease-in-out',
        'purr-vibrate': 'purrVibrate 0.15s infinite alternate',
        'breathe': 'breathe 4s infinite ease-in-out',
      },
      keyframes: {
        kneadLeft: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(4px) scale(1.12)' },
        },
        kneadRight: {
          '0%, 100%': { transform: 'translateY(4px) scale(1.12)' },
          '50%': { transform: 'translateY(0) scale(1)' },
        },
        purrVibrate: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(0.5px, -0.5px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.025)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        munch: {
          '0%': { transform: 'scale(1) translateY(0)' },
          '100%': { transform: 'scale(1.08, 0.92) translateY(5px)' },
        },
        cutePunch: {
          '0%': { transform: 'translateX(140px) scale(0.6) rotate(15deg)', opacity: '0' },
          '15%': { transform: 'translateX(-15px) scale(1.22) rotate(-8deg)', opacity: '1' },
          '30%': { transform: 'translateX(-5px) scale(1.15) rotate(5deg)', opacity: '1' },
          '45%': { transform: 'translateX(-10px) scale(1.18) rotate(-4deg)', opacity: '1' },
          '60%': { transform: 'translateX(-5px) scale(1.12) rotate(3deg)', opacity: '1' },
          '75%': { transform: 'translateX(-2px) scale(1.08) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateX(30px) scale(0.8)', opacity: '0' },
        },
        popHearts: {
          '0%': { transform: 'scale(0.3) translateY(0)', opacity: '0' },
          '18%': { transform: 'scale(1.25) translateY(-14px)', opacity: '1' },
          '40%': { transform: 'scale(1.15) translateY(-18px) rotate(-3deg)', opacity: '1' },
          '65%': { transform: 'scale(1.2) translateY(-22px) rotate(3deg)', opacity: '1' },
          '80%': { transform: 'scale(1.1) translateY(-25px)', opacity: '0.9' },
          '100%': { transform: 'scale(1.3) translateY(-35px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(246, 163, 84, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(246, 163, 84, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
