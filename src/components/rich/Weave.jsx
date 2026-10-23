/**
 * The texture a section is drawn on.
 *
 * One component, three geometries, because four sections sharing
 * one backdrop is four sections that look like one long section -
 * and a square grid is right under a timeline and meaningless
 * under a gallery.
 *
 *   grid   squares, under Experience. A blueprint, which is what
 *          a dated list of roles against a rail already is.
 *   hatch  diagonals, under Skills. Drafting hatch; it fills a
 *          field without implying rows and columns, and the bento
 *          above it has plenty of those already.
 *   rules  horizontals that drift upward, under Projects. A
 *          contact sheet, under a rail of screenshots.
 *
 * All three are `repeating-linear-gradient` on a single div, so
 * each one is a background the browser paints the way it paints
 * any other - no element per line, nothing in the DOM to count,
 * and only the drift on `rules` touches the compositor.
 *
 * This replaced Magic UI's GridPattern, which was an SVG pattern
 * doing the same job in more markup, and the lit cells that came
 * with it. Those were coloured squares scattered over the grid,
 * and two things were wrong with them: they looked like a fault
 * rather than a design, and they were positioned off a fixed
 * count of rows, so on a short section the lower ones fell
 * outside it. Nothing clips an absolute child by default, so they
 * were adding five hundred pixels of empty document under the
 * footer.
 */
const FEATHER = "8rem";
const band = (dir) =>
  `linear-gradient(to ${dir}, transparent, black ${FEATHER}, black calc(100% - ${FEATHER}), transparent)`;
const EDGE = `${band("right")}, ${band("bottom")}`;

const line = (deg, size, color) =>
  `repeating-linear-gradient(${deg}deg, ${color} 0 1px, transparent 1px ${size}px)`;

export default function Weave({
  kind = "grid",
  size = 44,
  tint = "var(--color-ink-700)",
  opacity = 0.5,
  drift = false,
  className = "",
}) {
  const image =
    kind === "hatch"
      ? `${line(45, size, tint)}, ${line(-45, size * 2.4, tint)}`
      : kind === "rules"
        ? line(0, size, tint)
        : `${line(0, size, tint)}, ${line(90, size, tint)}`;

  return (
    // The clip is not optional. Everything in here is sized off the
    // section, and a backdrop that can reach past the last section
    // on the page adds scrollable document under the footer.
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      <div
        className={`absolute inset-x-0 -bottom-full top-0 ${
          drift ? "motion-safe:animate-[creep_22s_linear_infinite]" : ""
        }`}
        style={{
          opacity,
          backgroundImage: image,
          maskImage: EDGE,
          WebkitMaskImage: EDGE,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}
