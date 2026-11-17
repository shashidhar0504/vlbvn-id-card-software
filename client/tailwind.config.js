/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#FAF7F0',
          200: '#F4EFE6',
          300: '#EAE1D2',
        },
        gold: {
          50: '#FCF9EE',
          100: '#F7F0D4',
          200: '#EEDDA9',
          300: '#E3C777',
          400: '#D4AF37', // signature metallic gold
          500: '#B8860B', // rich gold
          600: '#996515',
          700: '#7B4F0E',
        },
        charcoal: {
          50: '#F6F6F6',
          100: '#E7E7E7',
          700: '#3D3835',
          800: '#2A2624',
          900: '#1A1816',
          950: '#11100E',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
