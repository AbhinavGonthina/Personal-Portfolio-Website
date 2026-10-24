import { cn } from "../lib/cn";
import { usePlain } from "../lib/plain";
import { useLevel } from "../lib/readLevel";
import { useTheme } from "../lib/theme";
import HoverText from "./rich/HoverText";

/**
 * A section that is a stop on the walk.
 *
 * In the scene its content is painted on something in the world - the
 * hoarding, the board over the racks, the monitor, the mailboxes - so
 * the DOM copy exists only for crawlers, screen readers and anyone who
 * hit "simpler read". There is no panel floating beside the scene;
 * Experience is the one exception, and it builds its own.
 */

/**
 * The heading every section in the plain read wears.
 *
 * Numbered, because the plain read is a walk through the same five
 * places in the same order and the number is the cheapest way to say
 * so. It is the same plate the 3D read puts in the top left corner -
 * mono index, two slashes, the name - so switching between the two
 * does not feel like arriving at a different site.
 *
 * In the rich read the words also take colour under the cursor,
 * which is the one bit of play the headings get. It is off
 * everywhere else, and the heading underneath it is the same solid
 * type either way - see `rich/HoverText`.
 */
const SWEEP = {
  dark: ["#6fe3f5", "#8fa8ff", "#b48bff"],
  light: ["#0e7f94", "#3b55b8", "#6a3fbd"],
};

export function Heading({ n, aside, children }) {
  // Both hooks called, then combined. Written as
  // `usePlain() && useLevel() !== "bare"` this short-circuits, so
  // `useLevel` is skipped on every render where the town is up -
  // which means the number of hooks this component calls changes
  // with the reading. It survives today only because the switch
  // remounts the tree; the day it does not, React throws
  // "rendered fewer hooks than expected" and the page goes white.
  const plain = usePlain();
  const level = useLevel();
  const theme = useTheme();
  const rich = plain && level !== "bare";
  const sweep = SWEEP[theme] ?? SWEEP.dark;

  return (
    <div className="mb-10">
      {/* `aside` rides on the heading's own line. A control that
          belongs to the section - the gallery's arrows - costs no
          height there, where a row of its own would push the
          section past the screen it is meant to fit. */}
      <div className="flex items-end justify-between gap-6">
        <div className="flex items-baseline gap-3">
          {n ? (
            <span className="font-mono text-sm tracking-[0.12em] text-accent/70">
              {String(n).padStart(2, "0")}
              <span className="mx-1.5 text-fg-subtle">//</span>
            </span>
          ) : null}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {rich ? <HoverText colors={sweep}>{children}</HoverText> : children}
          </h2>
        </div>
        {aside}
      </div>
      {/* Picks up the accent at its left end and gives out, rather than
          stopping dead at a fixed width. */}
      <div className="mt-4 h-px w-40 bg-gradient-to-r from-accent/80 via-(--lift-edge) to-transparent" />
    </div>
  );
}

export default function Stop({
  id,
  title,
  n,
  aside,
  plain,
  children,
  refEl,
  markRef,
  tall,
  // The last section on the page keeps no gap under it. The 96 is
  // half of the rhythm between two sections, and below the last one
  // there is no second half and no next section to separate it
  // from - only the foot of the document.
  foot,
}) {
  if (plain) {
    return (
      <section
        ref={refEl}
        id={id}
        // The gap you see between two sections is this section's
        // bottom plus the next one's top, so almost all of it lives
        // at the bottom and the top keeps only enough to stop the
        // heading touching the bar when a nav link lands on it.
        //
        // Nothing reserves a screen. A section held to a viewport
        // whether or not it needs one centres its content in all
        // that height, and the leftover above the heading is added
        // to the gap above it - which is where the extra distance
        // between sections was coming from.
        // The scroll lands in the middle of the gap, not at the end
        // of it.
        //
        // Parking the section so its heading sits the full 112
        // below the bar means the whole gap is on this side of the
        // fold, and the line above it - the last thing in the
        // previous section - is sitting right against the bar. Half
        // the gap above the fold and half below puts the same air
        // over the heading as the section has under its last line.
        //
        // 104 = the bar's 64, plus half of the 112, less the 16 the
        // section already carries on top.
        // `relative`, which is not decoration. Everything the rich
        // read puts behind a section - the dot field, the grid, the
        // rings under Contact - is `absolute inset-0`, and without
        // a positioned ancestor here they were all sizing
        // themselves against the whole document instead. The dots
        // tile, so that went unnoticed; the rings are centred on
        // their box, and theirs was a seven-thousand pixel page, so
        // they were drawn a long way off screen.
        className={cn(
          "pointer-events-auto relative scroll-mt-26 pt-4",
          foot ? "pb-0" : "pb-24",
        )}
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <Heading n={n} aside={aside}>
            {title}
          </Heading>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={refEl}
      id={id}
      className={cn(
        "pointer-events-none relative w-full scroll-mt-16",
        tall ? "h-[188vh] min-h-[1240px]" : "h-[94vh] min-h-[620px]",
      )}
    >
      <div className="sr-only">
        <h2>{title}</h2>
        {children}
      </div>
      {/* A second marker one viewport down. The camera holds between
          this and the top of the section, so scrolling it advances
          what is on the screen rather than moving the shot. */}
      {markRef && (
        <div
          ref={markRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-[94vh] size-0"
        />
      )}
    </section>
  );
}
