import { createTheme } from "@mui/material/styles";

// Cream & camel. Every colour on the site comes from here.
export const palette = {
  bg: "#FBF8F3", // page background, cream
  surface: "#F3EDE3", // cards, raised panels, warm sand
  surfaceAlt: "#EFE7DA", // hover / secondary fill
  border: "#E2D7C6", // hairlines
  accent: "#B08968", // camel — decorative accent: eyebrows, links, foliage
  accentDark: "#8F6B4C", // accent hover / pressed

  // Two-tone system: camel reads as "warm accent", olive reads as "clickable".
  action: "#3A4D39", // deep olive — buttons and other primary actions
  actionDark: "#2E3B2B", // action hover / pressed
  actionSoft: "rgba(58, 77, 57, 0.16)", // olive hairlines

  text: "#2E2620", // espresso, primary text
  // Was #8A7B6B, which only reached ~3:1 on cream — under the 4.5:1 floor.
  muted: "#6B6054", // taupe, secondary text
  bodyStrong: "#2B2825", // lead paragraphs

  // Tree-specific: a darker bark than the camel accent, for contrast against cream.
  bark: "#4A403A",
  barkDeep: "#352E29",
  cardFill: "rgba(255, 255, 255, 0.7)",

  // Foliage greens for the decorative plants — varied so vines read with depth
  // rather than as one flat silhouette.
  forest: "#2E3B2B",
  olive: "#5B6E58",
  sage: "#8A9A86",

  cardStroke: "#E4DED4",
  inkStrong: "#1C1A18",
  inkMuted: "#6B655E",
};

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

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
    // MUI "primary" drives buttons, so it maps to the action colour, not the
    // decorative accent.
    primary: { main: palette.action, dark: palette.actionDark, contrastText: "#FFFFFF" },
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
    subtitle1: { fontSize: fluid(1.0625, 1.25), lineHeight: 1.6, color: palette.bodyStrong },
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
        // SVG nodes are focusable groups; swap the default UA outline for a
        // ring that only appears for keyboard users.
        'g[role="button"]': { outline: "none" },
        'g[role="button"]:focus-visible .focus-ring': { opacity: 1 },
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
