import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFocused, useSeenNear } from "../lib/stage";
import { useArriving } from "../lib/arrival";
import { usePlain } from "../lib/plain";
import { useSwitching } from "../lib/switchView";
import { STOP } from "../lib/stops";

/**
 * The second instruction on the site, and the last.
 *
 * Standing in the middle of the arc is the one stop that asks you to
 * do something other than keep scrolling, and nothing on screen said
 * so - the buildings look like scenery until you happen to put the
 * cursor on one and it lights up.
 *
 * Gated on where the camera is rather than where the page is: the
 * camera has its own pace and can be sent straight here by a link,
 * and a hint that arrives when the scroll says so would arrive while
 * you were still looking at the house.
 *
 * It goes the moment you open a building and does not come back.
 * Once is telling you; twice is nagging, and you are going to pass
 * through here again on the way out.
 */
let opened = false;

export default function PickHint() {
  // Tight to the arc, and closed early on the far side. The walk to
  // Skills starts turning the camera towards the house almost as
  // soon as it leaves this stop, so a window that runs to 2.4
  // leaves the hint up while you are looking at a front door.
  const atArc = useSeenNear(STOP.experience - 0.35, STOP.experience + 0.15);
  const focused = useFocused();
  const arriving = useArriving();
  const plain = usePlain();
  const switching = useSwitching();
  const [used, setUsed] = useState(opened);

  useEffect(() => {
    if (focused && !opened) {
      opened = true;
      setUsed(true);
    }
  }, [focused]);

  const show = atArc && !focused && !used && !arriving && !plain && !switching;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6, transition: { duration: 0.28 } }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="sw-chrome pointer-events-none fixed inset-x-0 bottom-10 z-20 flex justify-center"
        >
          {/* On a backing, not bare: the road under this has the
              cluster names painted across it, and mono capitals over
              mono capitals is neither of them. */}
          <p className="rounded-full border border-ink-700/70 bg-ink-950/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.26em] text-fg-muted backdrop-blur-md">
            Click a building to read the role
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
