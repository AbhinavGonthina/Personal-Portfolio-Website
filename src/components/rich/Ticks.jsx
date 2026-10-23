/**
 * Short ticks over the whole window.
 *
 * What is under the page now that the dot field is gone. It
 * keeps the one thing the dots were liked for - a faint regular
 * field at a readable rhythm - and is not dots, which is what
 * OnTrack is drawn on.
 *
 * A tick is also easier to see than a dot at the same ink. A dot
 * is one pixel arguing with the background on its own; a four
 * pixel stroke is four of them arguing together, so this reads
 * at an opacity where a dot would not. That matters, because the
 * last two attempts at a page-wide texture both measured as
 * present and read as absent.
 *
 * Fixed to the viewport rather than to the document. A texture
 * that scrolls with the page reads as printed on the content;
 * one that stays put reads as the surface the content is shown
 * on. It also means one element for the whole site instead of
 * one per section, and no seams between sections.
 *
 * Two repeating gradients and nothing else - no JavaScript, no
 * frame loop, no element per mark. The browser draws it the way
 * it draws any other background image.
 */

/** The grid the marks sit on, and how long each mark is. */
const STEP = 46;
const TICK = 5;

const MASK = `repeating-linear-gradient(
  to right,
  #000 0 1px,
  transparent 1px ${STEP}px
)`;

export default function Ticks() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        // A stroke `TICK` tall at the top of every row, running
        // the full width of the page...
        backgroundImage: `repeating-linear-gradient(
          to bottom,
          var(--color-ink-600) 0 ${TICK}px,
          transparent ${TICK}px ${STEP}px
        )`,
        // ...and then cut into single-pixel columns, which is
        // what turns a set of rules into a field of ticks. Doing
        // it with a mask rather than a second painted gradient
        // means the colour is stated once and the shape once.
        maskImage: MASK,
        WebkitMaskImage: MASK,
        // Measured, not guessed, because the two textures before
        // this one were both pitched where a sampler could find
        // them and an eye could not.
        opacity: 0.9,
      }}
    />
  );
}
