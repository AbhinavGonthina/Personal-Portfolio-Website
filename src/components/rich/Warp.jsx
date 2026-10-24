import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";
import { WarpBackground } from "./WarpBackground";

/**
 * The tunnel behind Contact.
 *
 * The brief for this one was that it must not look like the
 * section above it. Projects is a contour map: close grey lines
 * lying flat on the page, no depth and no colour. This is the
 * opposite on both counts - a grid folded away from you into a
 * vanishing point, with colour arriving out of it.
 *
 * It suits the section besides. The last thing on the page is an
 * invitation to get in touch, and a corridor with light coming
 * up it is the one backdrop on this site that points somewhere
 * rather than sitting there.
 *
 * Nothing here opens a GPU context, so unlike the landing and
 * Projects it is not on the WebGL budget: four CSS gradients and
 * twenty transformed divs, all of which the compositor animates
 * without touching layout.
 */
export default function Warp() {
  const light = useTheme() === "light";
  const still = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      // Clipped with `clip-path` rather than `overflow-hidden`,
      // for the reason it is done that way everywhere else on
      // this page: hidden overflow makes a scroll container, and
      // the `sticky` box below would then stick to that instead
      // of to the window.
      style={{ clipPath: "inset(0)" }}
    >
      {/* One screenful, riding down with the reader.
          The perspective is the whole point of this component,
          and perspective is measured from the box it is set on:
          stretch that box over the full height of the section
          and the vanishing point sits somewhere off the top of
          the window, which is a sheared grid rather than a
          tunnel. Stuck to the window, the far end of it is
          always where the reader is looking. */}
      <div
        className="sticky top-0 h-screen w-full"
        style={{ ...edges(), opacity: light ? 0.75 : 0.62 }}
      >
        <WarpBackground
          className="size-full"
          // A step darker on the light read. The ink scale
          // flips with the theme, so one token would do - but
          // it does not flip symmetrically: ink-700 against
          // near-black is a clear line and the same token
          // against white is almost nothing.
          gridColor={light ? "var(--color-ink-600)" : "var(--color-ink-700)"}
          // A deeper fold than the stock hundred. At 100 the
          // walls come in so steeply that the middle of the
          // window is one flat rectangle with a frame of grid
          // around it; at 200 the lines carry most of the way
          // in and the floor reads as a floor.
          perspective={200}
          // Five per side rather than three, and slower. These
          // are behind reading matter, so what is wanted is a
          // steady drift of colour up the walls, not traffic.
          beamsPerSide={still ? 0 : 5}
          beamSize={4}
          beamDuration={6}
          // Long and thin, and never solid. Upstream's bars can
          // come out square and opaque, and at this scale that
          // is a coloured card sliding across the invitation.
          beamLength={[5, 14]}
          beamAlpha={light ? 0.6 : 0.9}
          beamDelayMin={0}
          beamDelayMax={7}
          // Cyan through violet, the same arc the vortex under
          // Experience runs through.
          hues={[190, 290]}
        />
      </div>
    </div>
  );
}
