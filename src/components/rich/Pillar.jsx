import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { useBudget, useSwap, worthIt } from "./webgl";
import { edges } from "./edges";

/**
 * The column of light behind Contact.
 *
 * Everything tried in this section and the one above it has
 * been a pattern - a lattice, a run of bars, a tunnel made of
 * grids - and every one of them came back out. This is not a
 * pattern. It is one object standing in the middle of the view,
 * twisting slowly as it rises, and there is nothing in it to
 * count or to follow.
 *
 * It also suits the section. The last thing on the page is an
 * invitation to get in touch, and a light left standing in the
 * dark is the only backdrop here that reads as somebody being
 * in.
 *
 * It is WebGL, so unlike the vortex above it this one is on the
 * shared budget with the landing and the contour map: the
 * watchdog takes all of them or none.
 */
const Column = lazy(() => import("./LightPillar"));

export default function Pillar() {
  const holds = useBudget();
  const { theme, hidden } = useSwap();
  const light = theme === "light";
  const still = useReducedMotion();

  const off = still || holds === "off" || !worthIt();
  if (off) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      // The same feather every backdrop on this page wears. The
      // pillar stands clear of the top and bottom edges on its
      // own, but the haze around its foot does not.
      style={edges()}
    >
      <Suspense fallback={null}>
        <div
          className="size-full transition-opacity duration-200"
          style={{
            opacity: holds === "going" || hidden ? 0 : light ? 0.55 : 0.62,
            // Screen on the dark read, so the light adds to the
            // page the way light does. Multiply on the light
            // one, because in daylight the shader paints white
            // everywhere it is not lit, and screening white over
            // white is a blank section.
            mixBlendMode: light ? "multiply" : "screen",
          }}
        >
          <Column
            // The site's two colours, top and bottom of the
            // column: the cyan the whole page is keyed to, and
            // the violet the project cards and the timeline rail
            // already use. Daylight takes the mixed versions of
            // both, the same pair the contour map takes.
            topColor={light ? "#0e7f94" : "#00d4f5"}
            bottomColor={light ? "#6a3fbd" : "#7042ff"}
            lightMode={light}
            // Two thirds on the dark read. At the stock 1.0 the
            // core of the column saturates to white and screens
            // over the sentence in front of it - the colour is
            // all at the edges and the middle is a hole burnt in
            // the page. Daylight does not have the problem,
            // because `multiply` cannot go brighter than the
            // paper.
            intensity={light ? 0.9 : 0.7}
            // Half the stock speed. This sits directly under the
            // one sentence on the page addressed to somebody.
            rotationSpeed={0.15}
            flow={0.7}
            // Nothing follows the cursor. Every cursor-reactive
            // background on this page has been taken off it, for
            // the same reason each time: movement under the
            // pointer is movement exactly where the reader is
            // already looking.
            interactive={false}
            clickPulse={false}
            // Well under the stock half. Bloom is the soft
            // diffuse look that the washes were removed for, and
            // a column of light needs a little of it or it is a
            // shape rather than a light - but only a little.
            bloom={0.12}
            // A third of stock.
            //
            // This is how much light the ray picks up away from
            // the filament itself, and at 0.002 it filled the
            // whole section: a flat teal block on the left and
            // a flat violet one on the right, with the thing
            // they were supposed to be coming off lost in the
            // middle of them. Turned down, what is left is the
            // ribbon.
            glowAmount={0.0006}
            pillarWidth={2.4}
            pillarHeight={0.4}
            // Laid over, not stood up.
            //
            // A column is the component's own posture and it is
            // the wrong one here: this section is twice as wide
            // as it is tall, so a vertical pillar is cropped at
            // both ends and runs straight down the middle of
            // the one sentence on the page addressed to
            // somebody. Past ninety it lies down and sweeps,
            // and the fifteen degrees over is what keeps it
            // from being a horizontal bar - it enters at the
            // top left in cyan and leaves at the bottom right
            // in violet, which also puts the brightest part of
            // it below the reading and behind the buttons.
            pillarRotation={105}
            twist={0.35}
            // Three turns of the noise loop rather than four.
            // This is a raymarch - eighty steps a pixel, each
            // running this loop - so the fourth octave costs
            // more than everything above it put together and
            // adds detail at a scale nobody reads in a
            // backdrop.
            detail={3}
            noiseIntensity={0.45}
            // Two fifths of the section's own size, in CSS
            // pixels - so about 580 by 300 on a wide screen,
            // whatever the display's density. The raymarch runs
            // eighty steps per pixel of that target, so this is
            // the single number that decides what the component
            // costs, and unlike the contour map there is
            // nothing thin in here to lose by under-sampling
            // it: it is all soft gradient. A contour is a
            // one-pixel line and could not take this; a column
            // of light does not notice.
            //
            // The component has its own governor on top, which
            // drops this further when it sees long frames, and
            // the page's watchdog can still take the whole
            // layer away.
            resolution={0.4}
            // No intro, for the same reason the contour map has
            // none: it pauses itself off screen, so a two-second
            // reveal does not run at load - it runs the moment
            // somebody scrolls here, which is indistinguishable
            // from the background still loading.
            intro={false}
            // Set from the wrapper instead, alongside the
            // opacity, so the theme swap moves one layer rather
            // than two.
            mixBlendMode="normal"
            className="size-full"
          />
        </div>
      </Suspense>
    </div>
  );
}
