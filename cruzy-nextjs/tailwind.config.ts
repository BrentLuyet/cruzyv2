import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          light: '#0f2040',
          border: '#1e3a5f',
        },
        teal: {
          DEFAULT: '#00b4d8',
          dark: '#0096b4',
          light: '#90e0ef',
        },
        'gray-mid': '#8a9bb0',
        'gray-text': '#cdd8e8',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
