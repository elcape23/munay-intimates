// src/styles/foundations/colors.ts
import { text } from "stream/consumers";
import { palette } from "../primitives/colors";

export const colors = {
  background: {
    primary: {
      // Tailwind usa la clave DEFAULT para generar la clase
      DEFAULT: palette.neutral["100"], // bg-background-primary
    },
    surface: {
      primary: {
        DEFAULT: palette.neutral["300"], // bg-background-surface-primary
        hover: palette.neutral["400"], // bg-background-surface-primary-hover
        invert: palette.neutral["800"], // bg-background-surface-primary-invert
      },
      success: {
        DEFAULT: palette.success["100"], // bg-background-surface-success
        hover: palette.success["200"], // bg-background-surface-success-hover
      },
      warning: {
        DEFAULT: palette.warning["100"], // bg-background-surface-warning
        hover: palette.warning["200"], // bg-background-surface-warning-hover
      },
      danger: {
        DEFAULT: palette.danger["100"], // bg-background-surface-danger
        hover: palette.danger["200"], // bg-background-surface-danger-hover
      },
      utilities: {
        DEFAULT: palette.utilities["100"], // bg-background-surface-utilities
        hover: palette.utilities["200"], // bg-background-surface-utilities-hover
      },
    },
    fill: {
      neutral: {
        default: palette.neutral["800"], // bg-background-fill-neutral
        secondary: palette.neutral["600"], // bg-background-fill-secondary
        tertiary: palette.neutral["300"], // bg-background-fill-tertiary
        hover: palette.neutral["600"], // bg-background-fill-hover
        invert: palette.neutral["100"], // bg-background-fill-invert
      },
    },
  },
  text: {
    primary: {
      DEFAULT: palette.neutral["800"], // text-text-primary
      hover: palette.neutral["700"], // text-text-primary-hover
      press: palette.neutral["300"], // text-text-primary-press
      disable: palette.neutral["400"], // text-text-primary-disable
      invert: palette.neutral["100"], // text-text-primary-invert
    },
    secondary: {
      DEFAULT: palette.neutral["600"], // text-text-primary
      hover: palette.neutral["700"], // text-text-primary-hover
      invert: palette.neutral["300"], // text-text-primary-invert
    },
    success: {
      DEFAULT: palette.success["400"], // text-text-success
      hover: palette.success["300"], // text-text-success-hover
    },
    warning: {
      DEFAULT: palette.warning["400"], // text-text-warning
      hover: palette.warning["300"], // text-text-warning-hover
    },
    danger: {
      DEFAULT: palette.danger["400"], // text-text-danger
      hover: palette.danger["300"], // text-text-danger-hover
    },
    utilities: {
      DEFAULT: palette.utilities["400"], // text-text-utilities
      hover: palette.utilities["300"], // text-text-utilities-hover
    },
  },
  border: {
    primary: {
      DEFAULT: palette.neutral["700"], // border-border-primary
      hover: palette.neutral["600"], // border-border-primary-hover
      press: palette.neutral["800"], // border-border-primary-press
      invert: palette.neutral["200"], // border-border-primary-invert
    },
    secondary: {
      DEFAULT: palette.neutral["300"], // border-border-secondary
      selected: palette.neutral["700"], // border-border-secondary-selected
    },
    tertiary: {
      DEFAULT: palette.neutral["200"], // border-border-tertiary
      hover: palette.neutral["300"], // border-border-tertiary-hover
    },
    invert: {
      DEFAULT: palette.neutral["100"], // border-border-invert
    },
    success: {
      DEFAULT: palette.success["200"], // border-border-success
      hover: palette.success["300"], // border-border-success-hover
    },
    warning: {
      DEFAULT: palette.warning["200"], // border-border-warning
      hover: palette.warning["300"], // border-border-warning-hover
    },
    danger: {
      DEFAULT: palette.danger["200"], // border-border-danger
      hover: palette.danger["300"], // border-border-danger-hover
    },
    utilities: {
      DEFAULT: palette.utilities["200"], // border-border-utilities
      hover: palette.utilities["300"], // border-border-utilities-hover
    },
  },
  icon: {
    primary: {
      DEFAULT: palette.neutral["800"], // icon-icon-primary
      hover: palette.neutral["700"], // icon-icon-primary-hover
      press: palette.neutral["300"], // icon-icon-primary-press
      disable: palette.neutral["400"], // icon-icon-primary-disable
      invert: palette.neutral["100"], // icon-icon-primary-invert
    },
    secondary: {
      DEFAULT: palette.neutral["600"], // icon-icon-secondary
      hover: palette.neutral["500"], // icon-icon-secondary-hover
    },
    success: {
      DEFAULT: palette.success["400"], // icon-icon-success
      hover: palette.success["300"], // icon-icon-success-hover
    },
    warning: {
      DEFAULT: palette.warning["400"], // icon-icon-warning
      hover: palette.warning["300"], // icon-icon-warning-hover
    },
    danger: {
      DEFAULT: palette.danger["400"], // icon-icon-danger
      hover: palette.danger["300"], // icon-icon-danger-hover
    },
    utilities: {
      DEFAULT: palette.utilities["400"], // icon-icon-utilities
      hover: palette.utilities["300"], // icon-icon-utilities-hover
    },
  },
};
