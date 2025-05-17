/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-sarif"],
      },
      gridTemplateColumns: {
        "70-30": "70% 28%",
      },
      colors: {
        background: "#217FBE",
      },
      fontSize: {
        'xs': '0.75rem',  // Custom size smaller than text-sm 
        'xxs': '0.625rem', // Even smaller size
      },
    },
  },
  plugins: [],
};
