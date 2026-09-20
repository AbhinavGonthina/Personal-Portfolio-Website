import { createTheme } from "@mui/material/styles";

// Cream & camel. Every colour on the site comes from here.
export const palette = {
  bg: "#FBF8F3", // page background, cream
  surface: "#F3EDE3", // cards, raised panels, warm sand
  surfaceAlt: "#EFE7DA", // hover / secondary fill
  border: "#E2D7C6", // hairlines
  accent: "#B08968", // camel — links, buttons, active states
  accentDark: "#8F6B4C", // accent hover / pressed
  text: "#2E2620", // espresso, primary text
  muted: "#8A7B6B", // taupe, secondary text
};

// Fluid type: scales with the viewport but clamped at both ends, so nothing
// collapses on a phone or balloons on a 4K monitor. Replaces the old vh sizing.
const fluid = (minRem, maxRem, minVw = 20, maxVw = 90) => {
  const slope = (maxRem - minRem) / (maxVw - minVw);
  const intercept = minRem - slope * minVw;
  return `clamp(${minRem}rem, ${intercept.toFixed(3)}rem + ${(slope * 100).toFixed(3)}vw, ${maxRem}rem)`;
};

const theme = createTheme({
  palette: {
    mode: "light",
    background: { default: palette.bg, paper: palette.surface },
    primary: { main: palette.accent, dark: palette.accentDark, contrastText: "#FFFFFF" },
    text: { primary: palette.text, secondary: palette.muted },
    divider: palette.border,
  },

  shape: { borderRadius: 12 },

  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },

  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    // Fraunces carries the headings; Inter handles everything read in bulk.
    h1: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: fluid(2.5, 4.75),
      fontWeight: 600,
      lineHeight: 1.05,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: fluid(1.875, 2.75),
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: fluid(1.375, 1.75),
      fontWeight: 600,
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: '"Fraunces", Georgia, serif',
      fontSize: fluid(1.125, 1.375),
      fontWeight: 600,
      lineHeight: 1.3,
    },
    subtitle1: { fontSize: fluid(1.0625, 1.25), lineHeight: 1.6, color: palette.muted },
    body1: { fontSize: "1rem", lineHeight: 1.7 },
    body2: { fontSize: "0.9375rem", lineHeight: 1.65 },
    caption: { fontSize: "0.8125rem", letterSpacing: "0.02em" },
    button: { textTransform: "none", fontWeight: 500 },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: "smooth" },
        body: { backgroundColor: palette.bg, color: palette.text },
        "::selection": { background: palette.accent, color: "#fff" },
        "@media (prefers-reduced-motion: reduce)": {
          html: { scrollBehavior: "auto" },
          "*": { animationDuration: "0.01ms !important", transitionDuration: "0.01ms !important" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 22, paddingBlock: 10 },
        containedPrimary: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
        outlinedPrimary: { borderColor: palette.border, color: palette.text },
      },
    },
  },
});

export default theme;
