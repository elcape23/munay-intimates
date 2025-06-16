// src/styles/primitives/typography.ts
export const typography = {
  family: {
    default: ["var(--font-manrope)", "ui-sans-serif", "system-ui"],
    brand: ["var(--font-manrope)", "ui-sans-serif", "system-ui"],
    // puedes añadir serif, mono, etc.
  },

  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  size: {
    xs: "11px",
    sm: "13px",
    md: "16px",
    lg: "19px",
    xl: "23px",
    "2xl": "28px",
    "3xl": "33px",
    "4xl": "40px",
    "5xl": "48px",
  },

  lineHeight: {
    xs: "12px",
    sm: "16px",
    md: "20px",
    lg: "24px",
    xl: "28px",
    "2xl": "32px",
    "3xl": "40px",
    "4xl": "48px",
    "5xl": "60px",
  },

  letterSpacing: {
    xs: "-2%",
    sm: "-1%",
    md: "0%",
    lg: "1%",
    xl: "2%",
    "2xl": "3%",
  },
};
