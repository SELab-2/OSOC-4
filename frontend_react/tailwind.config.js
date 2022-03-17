module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'darkblue': '#0A0839',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}