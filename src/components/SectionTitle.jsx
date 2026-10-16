import { AnimatePresence, motion } from "motion/react";
import { useStopIndex } from "../lib/stage";
import { STOPS } from "../lib/stops";

/**
 * One heading, in the corner, for the whole site.
 *
 * Not one per section: a heading that belongs to a section scrolls
 * away with it, which left the page unlabelled for the half of every
 * transition where you most want to know where you are going. This one
 * is fixed, and swaps at the midpoint between two stops - the moment
 * the shot stops being one place and starts being the next.
 *
 * Out fast and in a little slower, so the change reads as a cut rather
 * than a dissolve but still has somewhere to land. The landing has no
 * title at all; the name is already standing in the scene.
 */
const EASE = [0.22, 1, 0.36, 1];

export default function SectionTitle() {
  const i = useStopIndex();
  const title = STOPS[Math.min(STOPS.length - 1, Math.max(0, i))]?.title;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto w-full max-w-6xl px-6 pt-32">
      <AnimatePresence mode="wait">
        {title && (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: 0.34,
              ease: EASE,
              exit: { duration: 0.16 },
            }}
          >
            <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
            <div className="mt-3 h-px w-16 bg-fg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
