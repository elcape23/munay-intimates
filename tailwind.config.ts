// tailwind.config.ts
import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/* --- TOKENS SEMÁNTICOS --- */
import { colors } from "./src/styles/foundations/semantic/colors";
import {
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  fontWeight,
} from "./src/styles/foundations/semantic/typography";
import { spacing } from "./src/styles/foundations/semantic/spacing";
import { borderRadius } from "./src/styles/foundations/semantic/radius";

const config: Config = {
  /** Rutas a todos tus componentes / páginas */
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],

  /** Extiende el tema con tus tokens */
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      lineHeight,
      letterSpacing,
      fontWeight,
      spacing,
      borderRadius,
    },
  },

  /** Plugins */
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const fontBrand = theme("fontFamily.brand") as string[] | string;

      addUtilities({
        ".heading-01": {
          fontFamily: Array.isArray(fontBrand)
            ? fontBrand.join(",")
            : fontBrand,
          fontSize: theme("fontSize.heading-01"),
          lineHeight: theme("lineHeight.heading-01"),
          letterSpacing: theme("letterSpacing.heading-01"),
          fontWeight: theme("fontWeight.heading-01"),
        },
      });
    }),
  ],
};

export default config;
