import { cn } from "../lib/cn";

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
 */
export function Heading({ n, children }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3">
        {n ? (
          <span className="font-mono text-sm tracking-[0.12em] text-accent/70">
            {String(n).padStart(2, "0")}
            <span className="mx-1.5 text-fg-subtle">//</span>
          </span>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {children}
        </h2>
      </div>
      {/* Picks up the accent at its left end and gives out, rather than
          stopping dead at a fixed width. */}
      <div className="mt-4 h-px w-40 bg-gradient-to-r from-accent/80 via-white/25 to-transparent" />
    </div>
  );
}

export default function Stop({
  id,
  title,
  n,
  plain,
  children,
  refEl,
  markRef,
  tall,
}) {
  if (plain) {
    return (
      <section
        ref={refEl}
        id={id}
        className="pointer-events-auto scroll-mt-20 py-20 sm:py-24"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <Heading n={n}>{title}</Heading>
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
