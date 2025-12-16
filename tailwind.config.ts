import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Темная тема OLED
        background: "#050505", 
        surface: "#121212",
        primary: "#00E0FF", // Неоновый акцент
        secondary: "#7000FF",
        success: "#00FF94",
        danger: "#FF2E2E",
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        // Здесь можно подключить Inter или Geist (Swiss Style)
        sans: ['var(--font-geist-sans)'],
      }
    },
  },
  plugins: [],
};
export default config;