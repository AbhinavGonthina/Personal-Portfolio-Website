import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * A fixed grid with colour drifting through its lines.
 *
 * Six things have been behind Experience and come back out, and
 * they failed in two ways. The shaders failed on arithmetic:
 * the section is four and a half thousand pixels tall, which
 * makes a full-height canvas five times the cost of a screenful
 * and forces a sticky trick that hangs outside the section. The
 * rest failed on being generic - a texture laid over a section
 * that is already dense and already structured.
 *
 * This is the grid that was there first, which was the one
 * nobody objected to the look of, with the one thing it was
 * missing: colour, moving.
 *
 * How it is built, because the order matters:
 *
 *   outer   the section's own box, with the vertical edge fade
 *           every backdrop here wears
 *   middle  masked to the grid - a one-pixel line every 44 in
 *           both directions, and nothing anywhere else
 *   inner   a single large gradient of the site's accents,
 *           twice the size of the box, sliding diagonally
 *
 * So the colour is painted across the whole section and then
 * shown only where the grid lines are. What you see is a fixed
 * mesh whose lines slowly change hue along their length.
 *
 * It costs one transform on one element. No canvas, no shader,
 * no WebGL budget, nothing per cell, and no JavaScript at all
 * beyond reading which palette to use. Tiling means the height
 * is free: twice as tall is the same work, which is the whole
 * reason it suits this section when nothing else did.
 */

/** The grid: a line every `STEP`, in both directions. */
const STEP = 44;
const line = (dir) =>
  `repeating-linear-gradient(to ${dir}, #000 0 1px, transparent 1px ${STEP}px)`;
// Two layers, added rather than intersected - the union of the
// horizontals and the verticals is a grid; the intersection of
// them would be a field of dots where they cross.
const GRID = `${line("bottom")}, ${line("right")}`;

/**
 * The colour, as one long diagonal ramp through the five
 * accents and back to the first, so the loop closes on itself.
 */
const RAMP = {
  dark: ["#6fe3f5", "#8fa8ff", "#b48bff", "#6bd99a", "#ffb86b"],
  light: ["#0e7f94", "#3b55b8", "#6a3fbd", "#1d7a4c", "#a0621a"],
};

export default function Mesh() {
  const light = useTheme() === "light";
  const hues = RAMP[light ? "light" : "dark"];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={edges()}
    >
      <div
        className="size-full"
        style={{
          maskImage: GRID,
          WebkitMaskImage: GRID,
          maskComposite: "add",
          WebkitMaskComposite: "source-over",
          // Low. At anything near half, a lit grid stops being
          // the surface the section is on and becomes a thing
          // drawn over it - the lines read as brighter than the
          // card borders they run behind, which is exactly
          // backwards.
          opacity: light ? 0.26 : 0.3,
        }}
      >
        {/* Twice the size of the box, sliding by a tenth of
            itself, so the end of the ramp is never inside the
            frame. Twice and not three times: this is the
            tallest section on the page, and a promoted layer
            three times its height is a lot of memory for a
            gradient.

            `alternate` rather than a loop, because a ramp that
            has to return to its start either jumps or has to be
            twice as long again. */}
        <div
          className="absolute -inset-1/2 motion-safe:animate-[wander_34s_ease-in-out_infinite_alternate]"
          style={{
            backgroundImage: `linear-gradient(115deg, ${hues.join(", ")}, ${hues[0]})`,
          }}
        />
      </div>
    </div>
  );
}
