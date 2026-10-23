import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * The flickering grid behind Experience.
 *
 * The section was a ruled sheet that did nothing, and the two
 * things tried in its place both failed on the same fact: it is
 * four and a half thousand pixels tall. A shader sized to that
 * is five times the work of a screenful, and the version stuck
 * to the window to avoid paying for it hung above the section
 * and showed through on the landing.
 *
 * This one is canvas 2D. Ten thousand small rectangles redrawn
 * per frame is cheap in a way a full-screen fragment shader at
 * that height is not, so the canvas can simply be the size of
 * its section like every other backdrop here - no sticky, no
 * overhang, nothing outside the box.
 *
 * It is also the only background on this page that is not
 * WebGL, which means it does not sit under the GPU budget: no
 * device check, no frame-time watchdog, and `?gl=0` does not
 * turn it off. It is a canvas drawing squares.
 */
const Field = lazy(() =>
  import("./FlickeringGrid").then((m) => ({ default: m.FlickeringGrid })),
);

export default function Flicker() {
  const light = useTheme() === "light";
  const still = useReducedMotion();

  // Nothing to fall back to and nothing lost: the section keeps
  // its dot field and its rail either way.
  if (still) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={edges()}
    >
      <Suspense fallback={null}>
        <Field
          // The accent, and the blue the roles already use.
          // Daylight takes the mixed version of the same hue.
          color={light ? "#3b55b8" : "#8fa8ff"}
          // Three pixel squares twenty-five apart.
          //
          // The gap is the cost. Every square is redrawn every
          // frame, and at the stock ten pixel cell this section
          // would be sixty-four thousand of them; at twenty-eight
          // it is eight thousand. It also happens to be the right
          // density - the stock setting at this size reads as
          // static on a screen rather than as a grid.
          squareSize={3}
          gridGap={25}
          // One cell in thirty changes per second. Slow enough
          // that nothing is ever obviously moving and the
          // section is never quite the same twice.
          flickerChance={0.035}
          maxOpacity={light ? 0.38 : 0.45}
          className="size-full"
        />
      </Suspense>
    </div>
  );
}
