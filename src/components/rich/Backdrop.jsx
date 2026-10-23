/**
 * What goes behind a section so it is not sitting on a flat sheet.
 *
 * Two things: the edge fade every backdrop on the page borrows,
 * and the dot field that sits under all of them.
 *
 * The dots were taken out once, on the grounds that they are
 * what OnTrack's interface is drawn on and a portfolio should
 * not wear one of its own projects' backgrounds. Three
 * replacements later - grain twice and a field of ticks - they
 * are back, because none of the replacements looked as good and
 * the resemblance is not worth that. They are the floor; the
 * contour lines, the character field and the field lines are
 * what each section puts on top of it.
 *
 * A `Wash` used to live here too - a soft bloom of the accent
 * thrown in from a corner. That one is not coming back. It was
 * the only thing on this site that was neither line nor type,
 * and it read as a smudge on the screen rather than as light.
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
  // Down the page only. It used to fade all four sides, and the
  // two it should never have touched are the left and the right:
  // the window has its own edge there, and a texture that stops
  // short of it reads as a panel floating in the middle of the
  // page rather than as the surface the page is on. Top and
  // bottom still fade, because those edges are section
  // boundaries - invisible lines in the middle of a document
  // that a texture would otherwise draw for you.
  const image = `linear-gradient(to bottom, transparent, black ${feather}, black calc(100% - ${feather}), transparent)`;
  return { maskImage: image, WebkitMaskImage: image };
};

const GRID = {
  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/**
 * One layer, grey, sitting still. It used to have a second copy
 * in the accent shown through a circle that followed the cursor,
 * and that went for the reason every cursor effect on this page
 * went: movement under the pointer is movement exactly where the
 * reader is already looking.
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
