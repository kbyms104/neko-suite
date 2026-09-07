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
          bg: "#16171d",
          card: "#20222c",
          primary: "#f6a354",
          accent: "#ff6584",
          fur: "#fcd581",
          nose: "#ff9fb2",
          eyes: "#34d399",
        }
      },
      animation: {
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'bounce-gentle': 'bounceGentle 2s infinite ease-in-out',
        'munch': 'munch 0.25s infinite alternate ease-in-out',
        'punch': 'punch 0.35s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
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
          '100%': { transform: 'scale(1.06, 0.94) translateY(4px)' },
        },
        punch: {
          '0%': { transform: 'translateX(100px) rotate(20deg)', opacity: '0' },
          '50%': { transform: 'translateX(-10px) rotate(-10deg)', opacity: '1' },
          '100%': { transform: 'translateX(0) rotate(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
