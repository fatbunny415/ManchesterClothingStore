/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        manchester: {
          black:     "#0F0F0F",
          dark:      "#1A1A1A",
          gold:      "#C9A96A",
          goldLight: "#DFC48E",
          cream:     "#F5F5F0",
          blue:      "#0b293f",
          blueLight: "#124366",
          white:     "#F5F5F5",
          gray:      "#E5E5E5",
        }
      },
      fontFamily: {
        sans:  ['Manrope', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
