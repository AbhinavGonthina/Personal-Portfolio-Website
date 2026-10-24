import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * The vortex behind Experience.
 *
 * Eight things were tried in this section before it and eight
 * came back out - four grids, a honeycomb, scanning bands,
 * drawing lines and travelling beams. Every one of them was a
 * repeating texture, and a repeating texture behind a section
 * that already has a rail, coloured bars, logos and stat cards
 * reads as clutter whatever shape it is made of.
 *
 * This is the first thing tried here that does not repeat.
 * Several hundred particles drift along a noise field, leaving
 * short coloured trails. There is no lattice, no tile and
 * nothing to count.
 *
 * It is also affordable in a section four and a half thousand
 * pixels tall, which killed every shader tried here. Two
 * reasons: it is canvas 2D rather than WebGL, and the component
 * sizes its own canvas to the window rather than to its
 * container - so the box is stuck to the top of the section and
 * rides down as you read, exactly one screenful however tall
 * the section gets.
 */
const Field = lazy(() => import("./Vortex").then((m) => ({ default: m.Vortex })));

export default function Swirl() {
  const light = useTheme() === "light";
  const still = useReducedMotion();

  // Nothing to fall back to and nothing lost: the section keeps
  // its dot field and its rail either way.
  if (still) return null;

  return (
    <div
      aria-hidden
      // No `overflow-hidden`: a box with hidden overflow is a
      // scroll container, and a `sticky` child sticks to that
      // box rather than to the window - which pins the canvas
      // to the top of the section and lets the rest scroll past
      // underneath it. A sticky element cannot leave its own
      // containing block, so nothing escapes without it.
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div
        className="sticky top-0 h-screen w-full"
        // The fade goes on the sticky box, not the wrapper: it
        // is the canvas's own top and bottom that sit at the
        // edges of the window and need softening.
        style={{ ...edges(), opacity: light ? 0.3 : 0.42 }}
      >
        <Suspense fallback={null}>
          <Field
            // Transparent rather than the component's black.
            // It clears the canvas and then fills it with this
            // every frame; "transparent" makes that fill a
            // no-op and leaves the page showing through, which
            // a backdrop has to do.
            backgroundColor="transparent"
            // Hues 195 through 295 - the site's cyan at one end
            // and its violet at the other, with the blue
            // between them. The component adds its own hundred
            // degrees of range to the base.
            baseHue={195}
            // Under half the stock seven hundred. Each particle
            // is a stroked line every frame, so this is the one
            // number that decides what it costs, and at three
            // hundred the field is still dense enough to read
            // as a current rather than as a scatter.
            particleCount={300}
            baseSpeed={0.05}
            rangeSpeed={1.1}
            baseRadius={1}
            rangeRadius={1.6}
            containerClassName="size-full"
          />
        </Suspense>
      </div>
    </div>
  );
}
