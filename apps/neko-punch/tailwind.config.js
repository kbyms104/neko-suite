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
      animation: {
        'punch': 'cutePunch 1.8s ease-in-out forwards',
        'pop-hearts': 'popHearts 1.8s ease-in-out forwards',
        'shake': 'shake 0.4s ease-in-out',
        'bounce-gentle': 'bounceGentle 2s infinite ease-in-out',
      },
      keyframes: {
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
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-5px)' },
          '40%, 80%': { transform: 'translateX(5px)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      }
    },
  },
  plugins: [],
}
