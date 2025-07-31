// tailwind.config.js

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui'],
    },
      colors: {
         sweetstake: '#060A23',
      },
    },
  },
  plugins: [

  ],
}