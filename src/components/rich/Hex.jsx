import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * Honeycomb behind Experience.
 *
 * Seven things were tried in this section before it and all
 * seven came back out. Four of them were grids, which is the
 * first reason this is a hexagon: it is the one tiling on offer
 * that is not a grid, and nothing else on the page uses the
 * shape.
 *
 * The second reason is arithmetic. Experience is four and a
 * half thousand pixels tall, and that height is what killed the
 * shaders - sized to the section a canvas is six and a half
 * million pixels, and stuck to the window it hangs outside and
 * bleeds onto the landing. This is an SVG `<pattern>`: one tile
 * defined once and repeated by the browser the way it repeats a
 * background image. No element per cell, nothing animating, and
 * twice as tall is exactly the same work.
 */
import { HexagonPattern } from "./HexagonPattern";

export default function Hex() {
  const light = useTheme() === "light";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={edges()}
    >
      <HexagonPattern
        // Big cells. At the stock forty the comb is fine enough
        // to read as texture, and texture is what four grids
        // already failed at here; at eighty-four you see the
        // shape, which is the only reason to have chosen it.
        radius={84}
        gap={0}
        className={`size-full fill-none ${
          light ? "stroke-accent/25" : "stroke-accent/20"
        }`}
      />
    </div>
  );
}
