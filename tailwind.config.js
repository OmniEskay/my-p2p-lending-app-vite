/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Scans your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all JS, TS, JSX, TSX files in your src folder
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'palette-dark-blue': '#213448',
        'palette-medium-blue': '#547792',
        'palette-light-blue': '#94B4C1',
        'palette-cream': '#ECEFCA',
        // You can keep your existing primary/secondary or replace/supplement them
        primary: { // Example: making the medium blue primary
          light: '#7c9cb5', // Lighter shade of medium-blue
          DEFAULT: '#547792',
          dark: '#3e5a70', // Darker shade of medium-blue
        },
        secondary: { // Example: using the light blue as secondary
            light: '#adc7d1',
            DEFAULT: '#94B4C1',
            dark: '#7398a5',
        },
        accent: '#ECEFCA', // Cream as an accent
        textDark: '#213448', // Dark blue for primary text
        textLight: '#547792', // Medium blue for secondary text
        backgroundLight: '#F7FAFC', // A very light gray or off-white for main backgrounds
        // backgroundCream: '#ECEFCA', // If you want to use the cream as a background
      }
    },
  },
  plugins: [],
}
