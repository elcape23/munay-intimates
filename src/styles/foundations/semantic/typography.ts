import { typography } from "../primitives/typography";

/* — Familia “brand” — */
export const fontFamily = {
  brand: typography.family.default, // Manrope
};

/* — Heading 01 — */
export const fontSize = {
  "heading-01": typography.size["5xl"], // 48 px
  "heading-02": typography.size["4xl"], // 40 px
  "heading-03": typography.size["3xl"], // 33 px
  "heading-04": typography.size["2xl"], // 28 px
  "heading-05": typography.size.xl, // 23 px
  "heading-06": typography.size.lg, // 19 px
  "body-01": typography.size.md, // 16 px
  "body-02": typography.size.sm, // 13 px
  "body-03": typography.size.xs, // 11 px
};
export const lineHeight = {
  "heading-01": typography.lineHeight["5xl"], // 60 px
  "heading-02": typography.lineHeight["4xl"], // 48 px
  "heading-03": typography.lineHeight["3xl"], // 40 px
  "heading-04": typography.lineHeight["2xl"], // 32 px
  "heading-05": typography.lineHeight.xl, // 28 px
  "heading-06": typography.lineHeight.lg, // 24 px
  "body-01": typography.lineHeight.md, // 20 px
  "body-02": typography.lineHeight.sm, // 16 px
  "body-03": typography.lineHeight.xs, // 12 px
};
export const fontWeight = {
  bold: typography.weight.bold, // 700
  semibold: typography.weight.semibold, // 600
  medium: typography.weight.medium, // 500
  regular: typography.weight.regular, // 400
};
export const letterSpacing = {
  "heading-01": typography.letterSpacing.md,
  "heading-02": typography.letterSpacing.md,
  "heading-03": typography.letterSpacing.xl,
  "heading-04": typography.letterSpacing.md,
  "heading-05": typography.letterSpacing.md,
  "heading-06": typography.letterSpacing.md,
  "body-01": typography.letterSpacing.md,
  "body-02": typography.letterSpacing.md,
  "body-03": typography.letterSpacing.md,
};
