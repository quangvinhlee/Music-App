/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // If you're using the app directory (Next.js 13+):
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
    "./app/types/**/*.{js,ts,jsx,tsx}",
    "./app/utils/**/*.{js,ts,jsx,tsx}",
    "./app/provider/**/*.{js,ts,jsx,tsx}",
    "./app/query/**/*.{js,ts,jsx,tsx}",
    "./app/mutations/**/*.{js,ts,jsx,tsx}",
    "./app/hooks/**/*.{js,ts,jsx,tsx}",
    "./app/store/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
