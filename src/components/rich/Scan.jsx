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
 * Sized to its section like everything else here, which is
 * affordable because Projects is a screenful and a bit. The
 * same component under Experience would be six million pixels.
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
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={edges()}
    >
      {!off && (
        <div
          className="size-full transition-opacity duration-200"
          style={{
            opacity: holds === "going" || hidden ? 0 : light ? 0.4 : 0.5,
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
