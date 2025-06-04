// tailwind.config.js
export default {
  // ... content array ...
  theme: {
    extend: {
      colors: {
        'palette-dark-blue': '#213448',
        'palette-medium-blue': '#547792',
        'palette-light-blue': '#94B4C1',
        'palette-cream': '#ECEFCA',

        primary: {
          DEFAULT: '#547792', // palette-medium-blue
          dark: '#3e5a70',    // A darker shade of medium blue
        },
        // secondary: { ... } // Define if used elsewhere
        textDark: '#213448',
        textLight: '#547792',
        // ... any other colors
      },
      // ... fontFamily etc.
    },
  },
  plugins: [],
}