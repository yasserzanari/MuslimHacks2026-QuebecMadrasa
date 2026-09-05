import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { forest: "#174a3b", mint: "#e6f6ec", cream: "#fffdf7" },
      fontFamily: { display: ["Georgia", "serif"] },
      boxShadow: { soft: "0 18px 45px rgba(23,74,59,.11)" },
    },
  },
  plugins: [],
};

export default config;
