module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'indigo': {
          600: '#4f46e5',
          700: '#4338ca',
        },
        'green': {
          600: '#16a34a',
          700: '#15803d',
        }
      }
    },
  },
  plugins: [],
}