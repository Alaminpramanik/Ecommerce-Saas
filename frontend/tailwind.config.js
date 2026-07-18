/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0c",
          950: "#050506",
          900: "#0a0a0c",
          800: "#121216",
          700: "#1a1a20",
          600: "#26262e",
        },
        gold: {
          DEFAULT: "#d4af37",
          50: "#fdf8ea",
          100: "#faedc4",
          200: "#f3da88",
          300: "#eec54f",
          400: "#e2b53c",
          500: "#d4af37",
          600: "#b3872a",
          700: "#8c6620",
          800: "#6b4d18",
          900: "#463210",
        },
        cream: "#f8f6f1",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f3da88 0%, #d4af37 45%, #a97c1f 100%)",
        "ink-radial": "radial-gradient(circle at 20% -10%, rgba(212,175,55,0.15), transparent 45%), radial-gradient(circle at 90% 10%, rgba(212,175,55,0.08), transparent 40%)",
      },
      boxShadow: {
        gold: "0 8px 30px -8px rgba(212, 175, 55, 0.45)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        fadeIn: "fadeIn 0.6s ease forwards",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        pulseGlow: "pulseGlow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
