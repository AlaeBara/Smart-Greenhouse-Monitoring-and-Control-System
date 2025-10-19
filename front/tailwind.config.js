/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6b73ff',
          dark: '#000dff'
        }
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.15)'
      },
      backgroundImage: {
        'grid': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
      }
    }
  },
  plugins: []
};