import { useId } from "react";

/**
 * Magic UI's GridPattern.
 *
 *   https://magicui.design/docs/components/grid-pattern
 *
 * An SVG `<pattern>` of one corner stroke, tiled. The browser
 * draws it the way it draws a background image, so a grid over a
 * two-thousand pixel section is one rect and one fill - there is
 * no element per cell and nothing to animate.
 *
 * It is here because it is the opposite of what it replaced. The
 * section used to sit on a soft bloom of accent thrown in from a
 * corner, which at the size it needed to be to register read as a
 * smudge behind the text. A grid is a line, which is what the rest
 * of this site is made of, and it reads as the sheet the section
 * is drawn on.
 *
 * Changed from upstream: TypeScript stripped, the `squares` prop
 * dropped because nothing here highlights a cell, the hard-coded
 * grey swapped for the ink scale, and the whole thing feathered at
 * the edges - a grid that stops at the section boundary draws the
 * boundary, which is the mistake the bloom made in a different
 * way.
 */
const FEATHER = "8rem";
const band = (dir) =>
  `linear-gradient(to ${dir}, transparent, black ${FEATHER}, black calc(100% - ${FEATHER}), transparent)`;
const EDGE = `${band("right")}, ${band("bottom")}`;

export default function Grid({ size = 44, className = "", opacity = 0.5 }) {
  const id = `grid${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

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
