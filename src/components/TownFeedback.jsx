import { motion, AnimatePresence } from "motion/react";
import { useFocused, useSeenNear } from "../lib/stage";
import { useArriving } from "../lib/arrival";
import { useSwitching } from "../lib/switchView";
import { STOP } from "../lib/stops";
import Feedback from "./Feedback";

/**
 * The same suggestion box as the written read's footer, offered at
 * the end of the walk.
 *
 * The town has no footer to put it in - the page underneath it is
 * a screen reader's copy of the content, not something anybody
 * sees - so it arrives as the last thing at the last stop, beside
 * the mailboxes, which is where the site already asks you to get
 * in touch.
 *
 * Gated on where the camera is rather than where the page is, for
 * the reason `PickHint` is: the camera has its own pace and can be
 * sent straight here by a link, and a control that appeared when
 * the scroll said so would appear while you were still looking at
 * the desk.
 *
 * It does not leave again on the way out. Unlike the hint at the
 * arc, this is not an instruction you can finish reading - it is
 * somewhere to go, and taking it away as the camera drifts a
 * quarter stop is how you lose something you were reaching for.
 */
export default function TownFeedback() {
  const atEnd = useSeenNear(STOP.contact - 0.45, Infinity);
  const focused = useFocused();
  const arriving = useArriving();
  const switching = useSwitching();

  const show = atEnd && !focused && !arriving && !switching;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.24 } }}
          transition={{ duration: 0.45, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          // `pointer-events-auto` on the control and none on the
          // layer: this sits over the pavement, and the pavement is
          // draggable.
          className="sw-chrome pointer-events-none fixed inset-x-0 bottom-10 z-20 flex justify-center"
        >
          {/* The same pill the hint at the arc wears, so the two
              read as the same voice speaking twice rather than two
              different pieces of furniture. */}
          <Feedback className="pointer-events-auto rounded-full border border-ink-700/70 bg-ink-950/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.26em] text-fg-muted backdrop-blur-md hover:text-fg" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
