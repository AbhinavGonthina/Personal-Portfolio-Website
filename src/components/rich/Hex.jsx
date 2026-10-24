import { motion, useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";
import { HexagonPattern } from "./HexagonPattern";

/**
 * Honeycomb behind Experience, with colour running along the
 * lines of it.
 *
 * Seven things were tried in this section before it and all
 * seven came back out. Four were grids, which is the first
 * reason this is a hexagon: it is the one tiling on offer that
 * is not a grid, and nothing else on the page uses the shape.
 *
 * The second reason is arithmetic. Experience is four and a
 * half thousand pixels tall, and that height killed every
 * shader tried here - sized to the section a canvas is six and
 * a half million pixels, and stuck to the window it hangs
 * outside and bleeds onto the landing. An SVG `<pattern>` is
 * one tile defined once and repeated by the browser, so twice
 * as tall is exactly the same work.
 *
 * The colour is a paint server rather than a fill. An earlier
 * version used the component's `hexagons` prop to shade some
 * cells in and leave others out, which reads as a scatter of
 * highlights rather than as colour in the comb. This instead
 * hands the whole pattern a gradient to be stroked with, and
 * animates the gradient - so every line is coloured, and the
 * colour slides across the section.
 *
 * One gradient's four coordinates on the main thread. That is
 * the entire cost of the motion: the comb itself never
 * redraws, because nothing about it changes.
 */

/** The cells, and the gradient the lines are painted with. */
const RADIUS = 17;
const RAMP = "hexramp";

const HUES = {
  dark: ["#6fe3f5", "#8fa8ff", "#b48bff", "#6bd99a"],
  light: ["#0e7f94", "#3b55b8", "#6a3fbd", "#1d7a4c"],
};

/**
 * The four hues, three times over.
 *
 * The gradient is stretched across the whole section, and the
 * section is four and a half thousand pixels tall - so a single
 * run of four colours puts barely one hue on any screenful and
 * the comb looks like it is one flat colour that happens to
 * change if you scroll a long way. Repeating the ramp means a
 * couple of transitions are visible at any time, which is the
 * difference between colour in the comb and a tint on it.
 */
const CYCLES = 3;
const stops = (hues) => {
  const all = Array.from({ length: CYCLES }, () => hues).flat();
  all.push(hues[0]);
  return all;
};

export default function Hex() {
  const light = useTheme() === "light";
  const still = useReducedMotion();
  const hues = HUES[light ? "light" : "dark"];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={edges()}
    >
      {/* The paint server. A gradient is referenced by id from
          anywhere in the document, so it does not have to live
          inside the SVG that uses it - which is lucky, because
          that one is a vendored component with no slot for it.
          This SVG draws nothing and takes no space. */}
      <svg className="absolute size-0" aria-hidden>
        <defs>
          <motion.linearGradient
            id={RAMP}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="35%"
            animate={
              still
                ? undefined
                : {
                    x1: ["-40%", "60%"],
                    x2: ["60%", "160%"],
                    y1: ["-10%", "40%"],
                    y2: ["45%", "95%"],
                  }
            }
            transition={{
              duration: 26,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            {stops(hues).map((hue, i, all) => (
              <stop key={i} offset={i / (all.length - 1)} stopColor={hue} />
            ))}
          </motion.linearGradient>
        </defs>
      </svg>

      {/* Seventeen rather than the eighty-four this started at,
          and the forty-four after that. Small enough that the
          comb is a material the section is printed on rather
          than a diagram of hexagons drawn behind it. */}
      <HexagonPattern
        radius={RADIUS}
        className="size-full fill-none"
        // Higher than the earlier combs wanted, because the
        // cells are a quarter the size: the same opacity over
        // a line a quarter as long is a quarter the colour on
        // screen, and at 0.45 the ramp was there in a sampler
        // and not to an eye.
        style={{
          // The gradient goes on `style`, not on the `stroke`
          // attribute. The component builds its class list with
          // `cn`, whose default includes `stroke-gray-400/30`,
          // and tailwind-merge only drops a default when the
          // caller passes a competing utility - which a plain
          // `stroke=` attribute is not. The class won and the
          // comb came out grey.
          stroke: `url(#${RAMP})`,
          // Found by looking at the whole section rather than
          // a crop of it. At 0.75 the comb reads over the cards
          // and the body text is competing with it; at 0.42 the
          // colour is still plainly there and the section is
          // still something you read.
          opacity: light ? 0.3 : 0.42,
        }}
      />
    </div>
  );
}
