// tailwind.config.ts
import type { Config } from "tailwindcss";
import { colors } from "./src/styles/foundations/semantic/colors";
import { spacing } from "./src/styles/foundations/semantic/spacing";
import { borderRadius } from "./src/styles/foundations/semantic/radius";
import { typography } from "./src/styles/foundations/semantic/typography";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius,
      // Usamos el operador "spread" (...) para añadir todas las propiedades
      // de nuestro objeto typography al tema de Tailwind
      ...typography,
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
