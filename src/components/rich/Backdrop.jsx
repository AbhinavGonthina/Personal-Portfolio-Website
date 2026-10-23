/**
 * What goes behind a section so it is not sitting on a flat sheet.
 *
 * Nothing is left in here but the edge fade, which every
 * backdrop on the page needs and which is the only thing they
 * all share.
 *
 * Two things used to live here. A `Wash` - a soft bloom of the
 * accent thrown in from a corner - which was the one thing on
 * this site that was neither line nor type, and read as a smudge
 * on the screen rather than as light. And a dot field, which
 * survived longer and went for a different reason: it is what
 * OnTrack's interface is drawn on, and a portfolio whose
 * background is one of its own projects' backgrounds is a
 * portfolio that looks like it only owns one idea.
 *
 * What replaced them is a different texture per section, each
 * one about that section: contour lines under the projects, a
 * character field under the technologies, field lines under the
 * invitation.
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
