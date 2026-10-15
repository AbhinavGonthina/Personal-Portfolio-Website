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
export function Heading({ children }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-semibold tracking-tight">{children}</h2>
      <div className="mt-3 h-px w-16 bg-fg" />
    </div>
  );
}

export default function Stop({
  id,
  title,
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
        className="pointer-events-auto scroll-mt-16 py-20"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <Heading>{title}</Heading>
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
