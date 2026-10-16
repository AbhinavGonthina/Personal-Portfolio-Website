import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/**
 * A key cluster, the way a game tells you it wants to be looked
 * around in.
 *
 * It replaces two lines of instructions nobody reads. It goes as soon
 * as the pointer moves any real distance, because at that point the
 * person has worked it out and the thing is in the way - quickly, but
 * on a curve, so it does not blink out.
 */
const KEY =
  "flex size-9 items-center justify-center rounded-md border border-white/15 bg-white/[0.04] font-mono text-sm text-fg-muted";

export default function LookHint({ show }) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    if (moved) return;
    let from = null;
    const onMove = (e) => {
      if (!from) {
        from = [e.clientX, e.clientY];
        return;
      }
      // A real look around, not a twitch on the way to the scrollbar.
      if (Math.hypot(e.clientX - from[0], e.clientY - from[1]) > 90) {
        setMoved(true);
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [moved]);

  return (
    <AnimatePresence>
      {show && !moved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          // Bottom right, not centred: centred it sat on top of WORK,
          // the cluster sign painted on the road.
          className="pointer-events-none absolute bottom-12 right-12 z-10 flex flex-col items-center gap-2"
        >
          <div className="flex flex-col items-center gap-1.5">
            <span className={KEY} aria-hidden>
              &uarr;
            </span>
            <div className="flex gap-1.5">
              <span className={KEY} aria-hidden>
                &larr;
              </span>
              <span className={KEY} aria-hidden>
                &darr;
              </span>
              <span className={KEY} aria-hidden>
                &rarr;
              </span>
            </div>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fg-subtle">
            Look around
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
