import { motion, AnimatePresence } from "motion/react";
import { endArrival, useArriving } from "../lib/arrival";
import { usePlain } from "../lib/plain";

/**
 * A way past the arrival.
 *
 * It only runs once a session, but once a session is still once more
 * than someone in a hurry wants it, and a sequence you cannot leave
 * is a sequence that gets sat through resentfully.
 */
export default function SkipArrival() {
  const arriving = useArriving();
  const plain = usePlain();

  return (
    <AnimatePresence>
      {arriving && !plain && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.4, delay: 1.2 }}
          onClick={endArrival}
          className="fixed bottom-10 right-10 z-30 rounded-full border border-white/15 bg-black/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-subtle backdrop-blur-sm transition-colors hover:border-white/30 hover:text-fg"
        >
          Skip
        </motion.button>
      )}
    </AnimatePresence>
  );
}
