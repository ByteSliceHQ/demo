/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,html}"],
  theme: {
    extend: {
      colors: {
        bg: "#f6f7fb",
        surface: "#ffffff",
        borderc: "#e6e8ef",
        textc: "#1f2430",
        muted: "#6b7280",
        faint: "#9aa1ae",
        accent: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          soft: "#eef0ff",
        },
        danger: "#e11d48",
      },
      borderRadius: {
        card: "16px",
      },
      boxShadow: {
        card: "0 18px 40px -22px rgba(31, 36, 48, 0.35)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
