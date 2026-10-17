import { AnimatePresence, motion } from "motion/react";
import { useStopIndex } from "../lib/stage";
import { usePlain } from "../lib/plain";
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
 * Styled as a readout rather than as a caption: a numbered index, a
 * cyan cast picked from the same accents the scene is lit with, and a
 * panel behind it so it sits on the viewport instead of floating over
 * whatever happens to be behind it. The face and the size are the
 * same as everywhere else on the site.
 *
 * Out fast and in a little slower, so the change reads as a cut
 * rather than a dissolve but still has somewhere to land. The landing
 * has no title at all; the name is already standing in the scene.
 */
const EASE = [0.22, 1, 0.36, 1];

/** Numbered in the order they appear, counting each title once. */
const ORDER = [];
for (const s of STOPS) {
  if (s.title && !ORDER.includes(s.title)) ORDER.push(s.title);
}

export default function SectionTitle() {
  const plain = usePlain();
  const i = useStopIndex();
  const title = STOPS[Math.min(STOPS.length - 1, Math.max(0, i))]?.title;
  const n = title ? ORDER.indexOf(title) + 1 : 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-20 mx-auto w-full max-w-6xl px-6 pt-32">
      <AnimatePresence mode="wait">
        {title && !plain && (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            // The exit carries its own transition; nesting `exit`
            // inside `transition` is not a thing motion reads.
            exit={{ opacity: 0, y: -6, transition: { duration: 0.16 } }}
            transition={{ duration: 0.34, ease: EASE }}
            className="w-fit rounded-lg border border-white/[0.07] bg-black/25 px-4 py-3 backdrop-blur-[2px]"
          >
            <h2
              className="flex items-baseline gap-3 text-3xl font-semibold tracking-tight"
              style={{ textShadow: "0 0 10px rgba(100, 200, 255, 0.4)" }}
            >
              <span className="font-mono text-sm font-normal tracking-[0.12em] text-[#6fe3f5]/70">
                {String(n).padStart(2, "0")}
                <span className="mx-1.5 text-fg-subtle">//</span>
              </span>
              {title}
            </h2>
            {/* The rule picks up the same cyan at its left end and
                fades out, so it reads as a readout underline rather
                than a ruled line under a word. */}
            <div className="mt-2.5 h-px w-28 bg-gradient-to-r from-[#6fe3f5] via-white/40 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
