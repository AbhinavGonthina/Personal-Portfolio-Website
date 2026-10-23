import { useId, useMemo } from "react";
import { useTheme } from "../../lib/theme";

/**
 * Magic UI's GridPattern, with its `squares` put back and made to
 * breathe.
 *
 *   https://magicui.design/docs/components/grid-pattern
 *   https://magicui.design/docs/components/animated-grid-pattern
 *
 * The grid is an SVG `<pattern>` of one corner stroke, tiled. The
 * browser draws it the way it draws a background image, so a grid
 * over a two-thousand pixel section is one rect and one fill -
 * there is no element per cell and nothing to animate.
 *
 * The cells are the colour. A handful of squares filled in the
 * section's own hues, fading up and down on a long stagger, which
 * is what the page has instead of the soft blooms that used to sit
 * in the corners. A filled cell is a shape with edges; a bloom is
 * a shape without them, and on a dark page that reads as a smudge
 * on the screen rather than as light.
 *
 * Upstream's animated version keeps all fifty squares in React
 * state and moves one to a new position every time its animation
 * ends - about eleven re-renders a second, each one re-rendering
 * the whole set. These are fixed, seeded from the section's name
 * so they are the same every visit, and animated by one CSS
 * keyframe. No state, no frame loop, nothing to re-render.
 */
/**
 * The colours a lit cell can be: the site's five accents, which
 * are the same five the skill cards wear. Having one set for the
 * whole page is what keeps four sections with four different
 * backdrops reading as one page.
 */
const LIT = {
  dark: ["#6fe3f5", "#8fa8ff", "#b48bff", "#6bd99a", "#ffb86b"],
  light: ["#0e7f94", "#3b55b8", "#6a3fbd", "#1d7a4c", "#a0621a"],
};

const FEATHER = "8rem";
const band = (dir) =>
  `linear-gradient(to ${dir}, transparent, black ${FEATHER}, black calc(100% - ${FEATHER}), transparent)`;
const EDGE = `${band("right")}, ${band("bottom")}`;

/**
 * The same handful of cells on every visit. A grid that lights up
 * somewhere different each time you come back is a grid you start
 * watching; one that does not is a grid you stop noticing, which
 * is the job.
 */
const seeded = (seed) => {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

export default function Grid({
  size = 44,
  className = "",
  opacity = 0.5,
  // How many cells are filled, how far across and down they may
  // fall, and in what colours.
  cells = 0,
  tints,
  span = [26, 22],
  seed = "grid",
}) {
  const id = `grid${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const hues = tints ?? LIT[useTheme()] ?? LIT.dark;

  const lit = useMemo(() => {
    if (!cells || !hues.length) return [];
    const rand = seeded(seed);
    const taken = new Set();
    const out = [];
    // Tries, not cells: two squares on the same coordinate read as
    // one brighter square, so a collision is skipped rather than
    // retried forever.
    for (let i = 0; i < cells * 3 && out.length < cells; i++) {
      const x = Math.floor(rand() * span[0]);
      const y = Math.floor(rand() * span[1]);
      const key = `${x},${y}`;
      if (taken.has(key)) continue;
      taken.add(key);
      out.push({
        x,
        y,
        tint: hues[out.length % hues.length],
        // Long and badly aligned on purpose. Durations that divide
        // into each other come back into step and the whole set
        // starts pulsing together.
        run: 7 + rand() * 6,
        wait: rand() * 9,
      });
    }
    return out;
  }, [cells, hues, span, seed]);

  return (
    <>
      {lit.length > 0 && <Cells lit={lit} size={size} />}
      <Lines id={id} size={size} opacity={opacity} className={className} />
    </>
  );
}

function Lines({ id, size, opacity, className }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 size-full stroke-ink-700 ${className}`}
      style={{
        opacity,
        maskImage: EDGE,
        WebkitMaskImage: EDGE,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <defs>
        <pattern
          id={id}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={-1}
          y={-1}
        >
          {/* One corner: down the left and across the top. Tiled,
              that is a full grid, and it is a third of the path
              data of drawing both axes per cell. */}
          <path d={`M.5 ${size}V.5H${size}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * The lit cells, as divs rather than as rects inside the grid's
 * own SVG.
 *
 * This is not a style choice. An SVG does not composite its
 * children separately, so animating the opacity of a rect inside
 * one repaints the whole SVG - and that SVG is the size of the
 * section. Eleven cells breathing cost fifty milliseconds a frame
 * that way, measured, on three sections at once. As divs each one
 * is its own layer, forty-odd pixels square, and the whole set is
 * free.
 */
function Cells({ lit, size }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {lit.map(({ x, y, tint, run, wait }) => (
        <span
          key={`${x}-${y}`}
          className="absolute motion-safe:animate-[cell_var(--run)_ease-in-out_var(--wait)_infinite]"
          style={{
            left: x * size,
            top: y * size,
            width: size - 1,
            height: size - 1,
            background: tint,
            opacity: 0.09,
            "--run": `${run}s`,
            "--wait": `${wait}s`,
          }}
        />
      ))}
    </div>
  );
}
