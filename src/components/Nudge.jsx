import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * The two prompts that offer the next step down.
 *
 * Same idea and same animation, so they are the same component in
 * two positions, but they are not the same kind of thing.
 *
 * The one under the bar points. It hangs off the control it is
 * about, with a spike touching it, and the reader acts on it by
 * using the control it is pointing at - so it is not a button, and
 * it does not take the pointer. A label that is also a button
 * sitting a few pixels under the button it describes gives you two
 * places to click for one outcome, and the one that looks like the
 * answer is the wrong one.
 *
 * The one in the corner is the act. There is nothing on screen it
 * could point at, because what it offers has no control, so the
 * words have to be the control. It is the smaller of the two: it
 * arrives unasked, over whatever the reader is reading, and a
 * thing that interrupts should take as little room as it can.
 *
 * Both are up for five seconds and leave the way they arrived,
 * because a thing that offers something and then stays is a thing
 * somebody has to dismiss.
 */
export default function Nudge({ show, at, onAct, children }) {
  const still = useReducedMotion();
  const corner = at === "corner";

  const face = (
    <>
      <span
        className={`shrink-0 rounded-full bg-accent ${corner ? "size-1" : "size-1.5"}`}
      />
      <span
        className={`whitespace-nowrap tracking-tight text-fg ${
          corner ? "text-[12px]" : "text-sm"
        }`}
      >
        {children}
      </span>
    </>
  );

  const skin =
    "flex w-max items-center rounded-xl border border-accent/40 bg-ink-900 text-left shadow-lg shadow-black/20";

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
              : // Nothing here is clickable, and the layer must not
                // sit over the control it is pointing at either.
                "pointer-events-none absolute right-0 top-full z-[60] mt-3"
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

            {corner ? (
              <button
                onClick={onAct}
                className={`${skin} gap-2 px-3 py-1.5 transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
              >
                {face}
              </button>
            ) : (
              <div className={`${skin} gap-2.5 px-4 py-2.5`}>{face}</div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
