import { motion } from "motion/react";
import { cn } from "../lib/cn";

/**
 * A section that is a stop on the camera's walk.
 *
 * The scene frames its subject on the left of the viewport, so the copy
 * lives in a column on the right with a backing behind it. The backing
 * starts well to the left of the column so the fade happens in the
 * empty gutter - run inside the column and the first inch of every line
 * lands on half-strength scrim, which is exactly where it stops being
 * readable.
 *
 * `plain` renders the same content as an ordinary padded section, with
 * no scene behind it at all.
 */

const EASE = [0.22, 1, 0.36, 1];
const FADE = "linear-gradient(to right, transparent, black 26%)";
const WASH =
  "linear-gradient(to right, transparent, rgba(6,9,18,0.94) 26%, rgba(6,9,18,0.97))";

export function Heading({ children, className }) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-3xl font-semibold tracking-tight">{children}</h2>
      <div className="mt-3 h-px w-16 bg-fg" />
    </div>
  );
}

export default function Stop({ id, title, plain, children, refEl, className }) {
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
        // pointer-events-none so clicks reach the canvas behind this,
        // which is not a child of the section that uses it.
        "pointer-events-none relative flex h-[94vh] min-h-[620px] w-full scroll-mt-16 items-center justify-end",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, x: 32 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-25%" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="pointer-events-auto relative flex h-full w-[46%] items-center"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-56 right-0 backdrop-blur-[22px]"
          style={{ maskImage: FADE, WebkitMaskImage: FADE }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -left-56 right-0"
          style={{ background: WASH }}
        />
        <div className="relative max-h-full w-full overflow-y-auto px-6 py-20 pr-12">
          <Heading>{title}</Heading>
          {children}
        </div>
      </motion.div>
    </section>
  );
}
