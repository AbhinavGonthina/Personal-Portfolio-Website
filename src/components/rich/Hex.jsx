import { useMemo } from "react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";
import { HexagonPattern } from "./HexagonPattern";

/**
 * Honeycomb behind Experience, with colour moving through it.
 *
 * Seven things were tried in this section before it and all
 * seven came back out. Four were grids, which is the first
 * reason this is a hexagon: it is the one tiling on offer that
 * is not a grid, and nothing else on the page uses the shape.
 *
 * The second reason is arithmetic. Experience is four and a
 * half thousand pixels tall, and that height is what killed
 * every shader tried here - sized to the section a canvas is
 * six and a half million pixels, and stuck to the window it
 * hangs outside and bleeds onto the landing. An SVG `<pattern>`
 * is one tile defined once and repeated by the browser, so
 * twice as tall is exactly the same work.
 *
 * The colour is the component's own `hexagons` prop, which
 * fills named cells at their real positions rather than inside
 * the repeating tile. Nothing is hand-drawn here: the comb and
 * the filled cells are both `HexagonPattern`, asked for three
 * times over.
 */

/** The comb, and how many cells of it are lit. */
const RADIUS = 44;
const LIT = 7;

const HUES = {
  dark: ["text-[#6fe3f5]", "text-[#b48bff]", "text-[#6bd99a]"],
  light: ["text-[#0e7f94]", "text-[#6a3fbd]", "text-[#1d7a4c]"],
};

/**
 * Which cells each colour lights, seeded off its index.
 *
 * Fixed rather than random: `Math.random` here would deal a new
 * hand on every render, and in development, where React mounts
 * twice, the pattern would visibly jump the moment the second
 * mount lands.
 */
const cells = (seed) =>
  Array.from({ length: LIT }, (_, i) => {
    const n = seed * 31 + i * 17;
    return [(n * 7) % 26, (n * 11) % 52];
  });

export default function Hex() {
  const light = useTheme() === "light";
  const hues = HUES[light ? "light" : "dark"];
  const sets = useMemo(() => hues.map((_, i) => cells(i)), [hues]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={edges()}
    >
      {/* The comb itself. Radius 44 rather than the stock 40 and
          well under the 84 it started at: at eighty the cells
          were bigger than the cards and the section read as a
          diagram of hexagons, and at forty-four it is a surface
          again without becoming the fine texture that four
          grids already failed at here. */}
      <HexagonPattern
        radius={RADIUS}
        className={`size-full fill-none ${
          light ? "stroke-accent/22" : "stroke-accent/18"
        }`}
      />

      {/* Three more of the same component, each filling seven
          cells in one colour and each fading on its own clock,
          so the colour in the comb is never in the same place
          twice. Three layers of seven polygons is twenty-one
          animated opacities and nothing else - no canvas, no
          shader, and nothing that grows when the section does. */}
      {sets.map((hexagons, i) => (
        <HexagonPattern
          key={i}
          radius={RADIUS}
          hexagons={hexagons}
          className={`size-full stroke-none ${hues[i]} motion-safe:animate-[comb_var(--run)_ease-in-out_var(--wait)_infinite_alternate]`}
          style={{
            fill: "currentColor",
            opacity: 0.12,
            "--run": `${13 + i * 5}s`,
            "--wait": `${i * 3.5}s`,
          }}
        />
      ))}
    </div>
  );
}
