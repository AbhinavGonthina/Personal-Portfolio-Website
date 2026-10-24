import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { edges } from "./Backdrop";
import { useBudget, useSwap, worthIt } from "./webgl";

/**
 * The scanning bands behind Projects.
 *
 * A fixed field of horizontal lines with a sweep travelling
 * down through it - static geometry, moving light, which is the
 * one kind of motion this page keeps coming back to: it is what
 * the Experience rail does, what the featured card's border
 * does, and what the skill bands do.
 *
 * It replaces the contour map. Both are line fields; the
 * difference is that this one has something happening in it,
 * and that a rail of screenshots reads better over rules than
 * over topography.
 *
 * One screenful, stuck to the window, and that is the whole of
 * why it can be in this section at all. Experience is four and
 * a half thousand pixels tall; a canvas sized to it is six and
 * a half million pixels of shader, measured at 600 ms a frame
 * against 170 for a screen. Stuck to the top it draws a screen
 * and rides down as you read, which for a sweep that travels
 * top to bottom anyway is also the better picture.
 *
 * Two details that are not preferences, both learned the hard
 * way by a component that was here before:
 *
 * No `overflow-hidden` on the wrapper. A box with hidden
 * overflow is a scroll container, and a `sticky` child sticks
 * to that box rather than to the window - which pins the canvas
 * to the top of the section and lets the rest scroll past
 * underneath it.
 *
 * And `top-0 h-screen` exactly, with no overhang. The previous
 * attempt hung the box an eighth of a screen above the window
 * so its own top edge was never visible; what that actually did
 * was put the canvas above the section's own top, so scrolled
 * to the landing you could see a band of it over the hero. The
 * fade below handles the edges instead.
 */
const Field = lazy(() => import("./Scanner"));

export default function Scan() {
  const still = useReducedMotion();
  const holds = useBudget();
  const { theme, hidden } = useSwap();
  const light = theme === "light";

  const off = still || holds === "off" || !worthIt();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {!off && (
        <div
          className="sticky top-0 h-screen w-full transition-opacity duration-200"
          style={{
            opacity: holds === "going" || hidden ? 0 : light ? 0.4 : 0.5,
            // The fade goes on the sticky box, not the wrapper.
            // It is the canvas's own top and bottom that need
            // softening - they sit at the top and bottom of the
            // window - and the wrapper is the section, whose
            // edges the canvas never reaches.
            ...edges(),
          }}
        >
          <Field
            // Three of the site's accents rather than the stock
            // violet, pink and white.
            color1={light ? "#0e7f94" : "#6fe3f5"}
            color2={light ? "#6a3fbd" : "#b48bff"}
            color3={light ? "#3b55b8" : "#8fa8ff"}
            lightMode={light}
            // Down the page, slowly, with a wide soft sweep. The
            // section is read top to bottom and the sweep should
            // go the same way.
            scanDirection="vertical"
            speed={0.3}
            sweepSpeed={0.12}
            sweepWidth={2.2}
            trail={0.55}
            // Fewer, wider bands. The stock eleven at this width
            // moire against the card edges.
            bandDensity={7}
            lineWidth={1}
            frequency={1.4}
            ripple={0.12}
            scale={1.4}
            // No bloom to speak of, no vignette, no film grain
            // and no scanlines. Every one of those is a second
            // pass over the whole canvas, and all four are the
            // soft diffuse look this page has spent a week
            // being taken off.
            glow={0.25}
            vignette={0}
            scanline={false}
            grain={false}
            brightness={0.9}
            colorSpread={0.8}
            // Nothing follows the cursor and nothing answers a
            // click: movement under the pointer is movement
            // exactly where the reader is already looking.
            mouseInteraction={false}
            clickEffect="none"
            // No reveal on arrival. It pauses itself off screen,
            // so an intro does not run at load - it runs when
            // you get here, which looks like a background that
            // had not finished loading.
            intro={false}
            dpr={1}
            className="size-full"
          />
        </div>
      )}
    </div>
  );
}
