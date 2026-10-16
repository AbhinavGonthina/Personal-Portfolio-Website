import { motion, AnimatePresence } from "motion/react";
import { useJourneyNear } from "../lib/stage";
import { useArriving } from "../lib/arrival";

/**
 * The one instruction on the whole site.
 *
 * It sits over the canvas rather than in the world, because it is
 * addressed to the person at the keyboard and not to anyone standing
 * in the town. In the upper half, so it is nowhere near the lettering
 * on the pavement.
 *
 * It arrives after the sign has finished landing and goes the moment
 * you do what it asks.
 */
export default function ScrollHint() {
  const atStart = useJourneyNear(0, 0.08);
  const arriving = useArriving();

  return (
    <AnimatePresence>
      {atStart && !arriving && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          // The exit carries its own transition. A `delay` on the
          // shared one applies to leaving as well as arriving, so the
          // hint sat there for another two and a half seconds after
          // you had already done what it asked - and `exit` nested
          // inside `transition` is not a thing motion reads.
          exit={{ opacity: 0, y: -6, transition: { duration: 0.3 } }}
          transition={{ duration: 0.5, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-12 z-20 flex flex-col items-center gap-3"
        >
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-fg-muted">
            Scroll to continue
          </p>
          {/* A chevron easing down and back, the length of a slow
              breath - fast enough to be read as an instruction,
              slow enough not to nag. */}
          <motion.span
            aria-hidden
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-fg-muted"
          >
            <svg width="26" height="15" viewBox="0 0 18 11" fill="none">
              <path
                d="M1 1l8 8 8-8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
