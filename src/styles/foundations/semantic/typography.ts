// src/styles/foundations/semantic/typography.ts
import { typography as primitiveTypography } from "../primitives/typography";

export const typography = {
  fontFamily: {
    brand: primitiveTypography.family.brand,
    default: primitiveTypography.family.default,
  },
  fontSize: {
    "heading-01": primitiveTypography.size["5xl"],
    "heading-02": primitiveTypography.size["4xl"],
    "heading-03": primitiveTypography.size["3xl"],
    "heading-04": primitiveTypography.size["2xl"],
    "heading-05": primitiveTypography.size.xl,
    "heading-06": primitiveTypography.size.lg,
    "body-01": primitiveTypography.size.md,
    "body-02": primitiveTypography.size.sm,
    "body-03": primitiveTypography.size.xs,
  },
  lineHeight: {
    "heading-01": primitiveTypography.lineHeight["5xl"],
    "heading-02": primitiveTypography.lineHeight["4xl"],
    "heading-03": primitiveTypography.lineHeight["3xl"],
    "heading-04": primitiveTypography.lineHeight["2xl"],
    "heading-05": primitiveTypography.lineHeight.xl,
    "heading-06": primitiveTypography.lineHeight.lg,
    "body-01": primitiveTypography.lineHeight.md,
    "body-02": primitiveTypography.lineHeight.sm,
    "body-03": primitiveTypography.lineHeight.xs,
  },
  fontWeight: {
    bold: primitiveTypography.weight.bold,
    semibold: primitiveTypography.weight.semibold,
    medium: primitiveTypography.weight.medium,
    regular: primitiveTypography.weight.regular,
  },
  letterSpacing: {
    "heading-01": primitiveTypography.letterSpacing.md,
    "heading-02": primitiveTypography.letterSpacing.md,
    "heading-03": primitiveTypography.letterSpacing.xl,
    "heading-04": primitiveTypography.letterSpacing.md,
    "heading-05": primitiveTypography.letterSpacing.md,
    "heading-06": primitiveTypography.letterSpacing.md,
    "body-01": primitiveTypography.letterSpacing.md,
    "body-02": primitiveTypography.letterSpacing.md,
    "body-03": primitiveTypography.letterSpacing.md,
  },
};
