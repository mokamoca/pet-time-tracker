/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff9eb0",
        accent: "#ffd166",
        bg: "#f7f1e3",
        card: "#ffffff",
        mint: "#a7e6c2",
      },
    },
  },
  plugins: [],
};
