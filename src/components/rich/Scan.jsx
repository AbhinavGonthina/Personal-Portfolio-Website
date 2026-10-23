import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { useBudget, useSwap, worthIt } from "./webgl";

/**
 * The scanning grid behind Experience.
 *
 * The section already is a blueprint - a dated list of roles
 * against a rail - and it was drawn on a ruled sheet that did
 * nothing. This is the same sheet with a sweep moving down it,
 * lighting the cells as it goes, which is the direction a
 * timeline is read in.
 */
const Field = lazy(() => import("./GridScan"));

export default function Scan() {
  const still = useReducedMotion();
  const holds = useBudget();
  const { theme, hidden } = useSwap();
  const light = theme === "light";

  const off = still || holds === "off" || !worthIt();

  return (
    <div
      aria-hidden
      // No `overflow-hidden`, unlike every other backdrop here,
      // and it is load-bearing: a box with hidden overflow is a
      // scroll container, and a `sticky` child sticks to *that*
      // box rather than to the window. With it on, the grid
      // pinned itself to the top of the section and the rest of
      // Experience scrolled past underneath it.
      //
      // No edge mask either, which is the other departure. Every
      // other backdrop is feathered so it does not end on a
      // ruled line, but feathering a grid takes the lines out of
      // the corners - and the corners are where a perspective
      // grid does its work, because that is where the walls
      // meet. Nothing is lost by leaving them: the sticky box is
      // taller than the window at both ends, so its own edges
      // are never on screen to need softening.
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {!off && (
        // Sticky, and this is the one thing here that is not a
        // preference.
        //
        // Experience is by a long way the tallest section on the
        // page - three timelines, the better part of four
        // thousand pixels - and every other backdrop is sized to
        // its section. A canvas that size is five and a half
        // million pixels of shader, against the eight hundred
        // thousand a screenful costs. Stuck to the top at one
        // viewport tall, it draws a screenful and rides down the
        // section as you read, which for a sweep that travels
        // top to bottom anyway is also the better picture.
        <div
          className="sticky -top-[8vh] h-[116vh] w-full transition-opacity duration-200"
          style={{
            opacity: holds === "going" || hidden ? 0 : light ? 0.45 : 0.55,
          }}
        >
          <Field
            linesColor={light ? "#3b55b8" : "#8fa8ff"}
            scanColor={light ? "#0e7f94" : "#6fe3f5"}
            lightMode={light}
            // Few, large cells. The section is read across its
            // full width and a fine grid at this scale turns into
            // moire against the rail and the card edges.
            cells={7}
            lineThickness={1}
            // The shallowest room the component allows.
            //
            // `depth` is how far the box recedes, and at anything
            // above about one the walls, floor and ceiling stack
            // up into a set of concentric rectangles marching to
            // a vanishing point. That is a tunnel, and a tunnel
            // behind a column of reading matter is a second
            // picture competing with the first. At 0.5 the back
            // wall is close enough that what is left reads as a
            // grid with a little depth in it.
            depth={0.5}
            depthFade={0.75}
            parallax={0.4}
            points={false}
            reflection={0.15}
            shading={0.5}
            // A long, slow sweep with a long wait after it. The
            // whole argument for this over a static grid is that
            // something happens; the whole argument for it being
            // bearable under eight hundred words of reading is
            // that it mostly does not.
            scanDirection="forward"
            scanDuration={4.5}
            scanDelay={5}
            scanWidth={1.3}
            trail={0.45}
            glow={0.35}
            autoScan
            // Nothing follows the cursor and nothing answers a
            // click, for the reason every other cursor effect on
            // this page was taken off: movement under the pointer
            // is movement exactly where the reader is looking.
            interactive={false}
            clickEffect="none"
            // Never. The camera and the gyroscope are the two
            // things in this component that ask the reader for
            // something, and a background has no business doing
            // that.
            enableWebcam={false}
            enableGyro={false}
            // No reveal on arrival: the component pauses itself
            // off screen, so an intro does not run at load, it
            // runs when you get here - which looks exactly like a
            // background that had not finished loading.
            intro={false}
            dpr={1}
            className="size-full"
          />
        </div>
      )}
    </div>
  );
}
