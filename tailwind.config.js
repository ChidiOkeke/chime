/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          light: '#115e4f',
          DEFAULT: '#064e3b',
          dark: '#022c22',
        },
        burgundy: {
          light: '#911d30',
          DEFAULT: '#58111A',
          dark: '#30050a',
        },
        ivory: {
          DEFAULT: '#FDFBF7',
          dark: '#F5F2EB',
        },
        beige: {
          DEFAULT: '#E6DFD3',
          dark: '#D5C9B3',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}