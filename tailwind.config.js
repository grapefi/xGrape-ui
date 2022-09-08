/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at top, var(--tw-gradient-stops))',
      },
      fontWeight: {
        'chonk': 400
      },
      colors: {
        'brand-1': '#930993',
        'brand-2': '#330083',
        'brand-3': '#ccf',
        'brand-4': 'rgb(23, 25, 35, 0.65)',
        'brand-success': '#14B236',
        'brand-error': '#C00A26',
      },
      fontFamily: {
        brand: ['Superstar', '"sans-serif"'],
        secondary: ['Tommy', 'sans-serif'],
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: "#930993",
          secondary: '#330083',
          accent: '#ccf',
        },
      }
    ],
  },
  plugins: [require("daisyui")],
}
