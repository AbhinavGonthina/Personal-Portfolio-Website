/**
 * What goes behind a section so it is not sitting on a flat sheet.
 *
 * One piece now: a dot field, which is one repeating radial
 * gradient rather than Magic UI's SVG full of <circle> elements,
 * drawn twice so the second copy can light up under the cursor.
 *
 * There used to be a `Wash` beside it - a big soft bloom of the
 * accent thrown in from a corner. It is gone. A blurred blob is
 * the one thing on this site that is neither line nor type, it
 * read as a smudge on the screen rather than as light, and at the
 * size it had to be to register it was visibly a shape with no
 * edges sitting behind the text. What replaced it is structure:
 * Magic UI's GridPattern under Experience and its Ripple under
 * Contact, both of them outlines.
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
 *
 * Exported, because every backdrop on the page needs it and the
 * two that did not have it were the two that showed. A section
 * boundary is an invisible line in the middle of a document: a
 * background clipped by one draws it, and two different
 * backgrounds clipped by the same one draw it twice and meet
 * along it. Faded, they dissolve into the page a hand's width
 * before they get there and never meet at all.
 */
const FEATHER = "7rem";

export const edges = (feather = FEATHER) => {
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

const GRID = {
  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/**
 * The dot field. One layer, grey, sitting still.
 *
 * It was two: this one, and a copy in the accent shown through a
 * circle that followed the cursor, so the page appeared to notice
 * you. It is gone, and the reason is the same one that took the
 * cursor off the character field in Skills - a patch of the
 * background lighting up under the pointer is movement exactly
 * where the reader is already looking, which is the one place a
 * background must not move. Nothing is left here that reacts to
 * anything: no listener on the section, no custom properties, no
 * second layer to composite.
 */
export function Dots({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 opacity-[0.55] ${className}`}
      style={{ ...GRID, color: "var(--color-ink-700)", ...edges() }}
    />
  );
}
