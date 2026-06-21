/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        service: {
          navy: "#12324a",
          blue: "#2563eb",
          soft: "#e8f1fb",
          teal: "#0f766e",
          amber: "#b45309",
          red: "#b91c1c"
        }
      },
      boxShadow: {
        calm: "0 10px 30px rgba(15, 23, 42, 0.07)"
      }
    }
  },
  plugins: []
};
