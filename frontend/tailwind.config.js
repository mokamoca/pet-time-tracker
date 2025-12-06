/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5c8f6b", // muted green
        accent: "#c2aa8e",  // warm beige
        bg: "#f6efe6",      // soft background
        card: "#f9f4ec",    // card base
        mint: "#d4b46b",    // warm accent for buttons
        ink: "#2f2a25",     // text
      },
    },
  },
  plugins: [],
};
