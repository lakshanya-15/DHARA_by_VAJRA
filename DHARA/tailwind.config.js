/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adding some custom colors as per "Rural Uber" theme
        // We can refine these later, but good to have placeholders or use default green/earth tones
      }
    },
  },
  plugins: [],
}
