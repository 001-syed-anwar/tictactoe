/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.js",
  ],
 theme: {
    extend: {
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        slideIn: {
          'from': { 
            transform: 'scale(0.9) translateY(-20px)', 
            opacity: '0' 
          },
          'to': { 
            transform: 'scale(1) translateY(0)', 
            opacity: '1' 
          }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        slideIn: 'slideIn 0.3s ease-out',
      }
    }
  },
  plugins: [],
}