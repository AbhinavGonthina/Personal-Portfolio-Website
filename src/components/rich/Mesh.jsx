import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * A fixed grid with the section's own colours drifting through
 * its lines.
 *
 * Seven things were tried behind Experience before this and six
 * came back out. They failed in two ways. The shaders failed on
 * arithmetic: the section is four and a half thousand pixels
 * tall, which makes a full-height canvas five times the cost of
 * a screenful and forces a sticky trick that hangs outside the
 * section. The rest failed on being generic - a texture laid
 * over a section that is already dense and already structured.
 *
 * This answers both. It is the grid that was there first, which
 * is the one nobody objected to the look of, tiled so height is
 * free; and the colour in it is not decoration, it is the jobs.
 *
 * How it is built, because the order matters:
 *
 *   outer   the section's box, with the vertical edge fade
 *           every backdrop here wears
 *   middle  masked to the grid - a one-pixel line every 44 in
 *           both directions, and nothing anywhere else
 *   inner   one tall ramp through the role colours, in the
 *           order the roles appear down the page
 *
 * So the colour is painted across the whole section and shown
 * only where the lines are. Scrolling past athenahealth the
 * mesh is their purple; by Quak it has gone orange; through the
 * Northeastern group it is their red. The background is a chart
 * of where the reader is in your history rather than a pattern
 * that happens to be behind it.
 *
 * It costs one transform on one element. No canvas, no shader,
 * no GPU budget, nothing per cell, and no JavaScript beyond
 * reading the palette. 83 ms a frame, against 350 for the
 * scanning bands this replaced and 600 for them sized to the
 * section.
 */

/** The grid: a line every `STEP`, in both directions. */
const STEP = 44;
const line = (dir) =>
  `repeating-linear-gradient(to ${dir}, #000 0 1px, transparent 1px ${STEP}px)`;
// Added rather than intersected: the union of the horizontals
// and the verticals is a grid, and the intersection of them is
// a field of dots where they cross.
const GRID = `${line("bottom")}, ${line("right")}`;

export default function Mesh({ hues }) {
  const light = useTheme() === "light";

  // 172 degrees rather than 180: near enough to vertical that
  // each colour still sits against the role it belongs to, off
  // enough that sliding the layer sideways moves the boundaries
  // instead of doing nothing at all.
  const ramp = `linear-gradient(172deg, ${hues.join(", ")})`;

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
          // drawn over it - the lines come out brighter than the
          // card borders they run behind, which is backwards.
          // Daylight takes less again: these are strong brand
          // colours and they carry further on white.
          opacity: light ? 0.3 : 0.4,
        }}
      >
        {/* Full height, half again as wide, sliding sideways.
            Only sideways: the vertical placement is the whole
            point, so the ramp must not travel up or down the
            section or a role would drift out from under its own
            colour. */}
        <div
          className="absolute inset-y-0 -left-1/4 w-[150%] motion-safe:animate-[wander_38s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: ramp }}
        />
      </div>
    </div>
  );
}
