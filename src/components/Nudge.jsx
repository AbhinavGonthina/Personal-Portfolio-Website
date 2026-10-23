import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * The two prompts that offer the next step down.
 *
 * Both are the same idea and the same animation, so they are the
 * same component in two positions: one hangs under the control in
 * the bar and points at it, the other sits in the corner of the
 * window. Each is up for five seconds and leaves the way it
 * arrived, because a thing that offers something and then stays is
 * a thing somebody has to dismiss.
 */
export default function Nudge({ show, at, onAct, children }) {
  const still = useReducedMotion();
  const corner = at === "corner";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={
            still ? false : { opacity: 0, y: corner ? 14 : -10, scale: 0.96 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            still
              ? { opacity: 0 }
              : { opacity: 0, y: corner ? 14 : -10, scale: 0.96 }
          }
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className={
            corner
              ? // Fixed, so it rides with the reader rather than
                // scrolling off the first time they move.
                "pointer-events-auto fixed bottom-6 right-6 z-[60] sm:bottom-8 sm:right-8"
              : "pointer-events-auto absolute right-0 top-full z-[60] mt-3"
          }
        >
          <div className="relative">
            {/* The spike, only on the one that is pointing at
                something. It sits under the control it belongs to
                and is the whole reason that prompt is positioned
                rather than fixed. */}
            {!corner && (
              <span
                aria-hidden
                // 11px from the right edge, because the control it
                // points at is 32 wide and the spike is 10: half of
                // each puts its centre under the middle of the
                // button rather than off to one side of it.
                className="absolute -top-[5px] right-[11px] size-2.5 rotate-45 border-l border-t border-accent/40 bg-ink-900"
              />
            )}
            <button
              onClick={onAct}
              className="flex w-max items-center gap-2.5 rounded-xl border border-accent/40 bg-ink-900 px-4 py-2.5 text-left shadow-lg shadow-black/20 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-accent" />
              <span className="whitespace-nowrap text-sm tracking-tight text-fg">
                {children}
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
