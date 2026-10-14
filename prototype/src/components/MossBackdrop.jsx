import { Box } from "@mui/material";
import { keyframes } from "@mui/system";

/**
 * The ambient layer the Skills and Experience sections share: slow-breathing
 * moss gradients under a fine vellum grain, so a section sits on depth rather
 * than on flat cream.
 *
 * Drop it into a Section's `decor` slot. Anything else that section wants to
 * animate — drifting leaves, falling leaves — goes alongside it as a sibling.
 */

const swell = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.72; }
  50%      { transform: translate3d(0, -12px, 0) scale(1.06); opacity: 1; }
`;

/**
 * Three gradients on one element rather than three elements. Three
 * overlapping ~400px boxes each animating their own transform meant three
 * large composite layers blending every frame; one layer with the gradients
 * baked into its background costs a single texture, and because the whole
 * field breathes together nobody reads the lost independence.
 */
const MOSS_FIELD = [
  "radial-gradient(circle 210px at 14% 28%, rgba(58, 82, 60, 0.10) 0%, transparent 68%)",
  "radial-gradient(circle 180px at 82% 22%, rgba(90, 110, 88, 0.09) 0%, transparent 68%)",
  "radial-gradient(circle 230px at 58% 88%, rgba(44, 64, 50, 0.08) 0%, transparent 68%)",
].join(", ");

/**
 * Vellum grain as a repeating 120px tile instead of a live `feTurbulence`
 * filter stretched over the section. The filter had to be re-run against the
 * full ~1200x660 box whenever anything above it repainted, and it was
 * multiply-blended on top, which took the whole stack off the fast path. As a
 * tile it is rasterised once, at 1/55th the area, and reused.
 */
const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function MossBackdrop() {
  return (
    // `contain` walls the decoration off from the rest of the page's layout
    // and paint pass, so the ambient loop can never invalidate anything else.
    <Box
      aria-hidden
      sx={{ position: "absolute", inset: 0, contain: "layout style paint" }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: MOSS_FIELD,
          willChange: "transform, opacity",
          animation: `${swell} 21s ease-in-out infinite`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            willChange: "auto",
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: GRAIN_TILE,
          backgroundRepeat: "repeat",
          opacity: 0.045,
        }}
      />
    </Box>
  );
}
