/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan the markup and the script: todo items are built in app.js, so any
  // utility class used there also has to be picked up by the compiler.
  content: ["./index.html", "./app.js"],
  // Follow the operating system / browser preference for dark mode.
  darkMode: "media",
  theme: {
    extend: {}
  },
  plugins: []
};
