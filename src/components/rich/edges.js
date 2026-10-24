/**
 * The edge fade every backdrop on this page wears.
 *
 * Its own module, rather than sitting beside `Dots` in
 * `Backdrop.jsx`, because four of the things that need it are
 * components and this is not one - and a file that exports both a
 * component and a plain function cannot be fast-refreshed.
 *
 * A fixed length rather than a percentage, because
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
