/**
 * What goes behind a section so it is not sitting on a flat sheet.
 *
 * Two pieces, both of them paint-only: a dot field, which is one
 * repeating radial gradient rather than Magic UI's SVG full of
 * <circle> elements, and a wash of the section's own colour coming
 * in from one corner. Neither animates and neither is an element
 * the reader can hit, so the cost is one extra layer to composite
 * and nothing per frame.
 *
 * Both are feathered to nothing at the edges of the section they
 * sit in. This is the whole reason either of them is bearable: a
 * section boundary is an invisible line in the middle of a page,
 * and a pattern or a glow that is simply clipped by it draws that
 * line - the reader sees a rectangle of tint ending in mid-air,
 * which is the opposite of the job. The point is that the page
 * stops being empty, not that it gains a box.
 */

/**
 * The edge fade. A fixed length rather than a percentage, because
 * a percentage of a tall section is a 300px smear and a percentage
 * of a short one is nothing - the softness wants to be the same
 * handful of centimetres everywhere.
 */
const FEATHER = "7rem";

const edges = (feather = FEATHER) => {
  const band = (dir) =>
    `linear-gradient(to ${dir}, transparent, black ${feather}, black calc(100% - ${feather}), transparent)`;
  const image = `${band("right")}, ${band("bottom")}`;
  return {
    maskImage: image,
    WebkitMaskImage: image,
    // Both layers have to agree for a pixel to survive, so the
    // four edges come off rather than the mask simply being the
    // brighter of the two bands everywhere.
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
};

export function Dots({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 opacity-[0.55] ${className}`}
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        color: "var(--color-ink-700)",
        ...edges(),
      }}
    />
  );
}

/** A soft bloom of one colour, thrown in from a corner. */
export function Wash({
  tint = "var(--color-accent)",
  at = "18% 0%",
  size = "62% 70%",
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: `radial-gradient(${size} at ${at}, color-mix(in oklab, ${tint} 26%, transparent), transparent 70%)`,
        ...edges(),
      }}
    />
  );
}

/**
 * The pair, as one thing, for a section that just wants a floor.
 * `relative` is the caller's job, because the caller owns the box.
 */
export default function Backdrop({ tint, at, size }) {
  return (
    <>
      <Dots />
      <Wash tint={tint} at={at} size={size} />
    </>
  );
}
