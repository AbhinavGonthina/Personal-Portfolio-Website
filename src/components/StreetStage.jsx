import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { setFocused, setProgress, useFocused } from "../lib/stage";
import { cn } from "../lib/cn";

const StreetScene = lazy(() => import("../scenes/StreetScene"));

/**
 * The one canvas, fixed behind the top of the page.
 *
 * It is pinned to the viewport rather than parked inside a section
 * because the landing view and the skyline are the same shot at two
 * points along one road: scrolling has to move the camera, not scroll a
 * picture out of frame.
 *
 * Three guards, all of which matter:
 *
 * - The scene is code-split, so three.js is not in the initial bundle.
 * - The render loop stops the moment the road is behind you. A fixed
 *   canvas that keeps drawing while you read the skills section is the
 *   worst possible version of this idea.
 * - Anyone who asked the OS to calm animations gets no canvas at all,
 *   and both sections fall back to their flat layouts.
 *
 * `end` is the element the road runs out at - the Experience section.
 * Everything below it scrolls over black.
 */
export default function StreetStage({ from, to }) {
  const focused = useFocused();
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [grab, setGrab] = useState(false);
  const [still] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const raf = useRef(0);

  useEffect(() => {
    if (still) return;
    const read = () => {
      raf.current = 0;
      const a = from.current;
      const b = to.current;
      if (!a || !b) return;
      const heroH = a.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / heroH));
      setProgress(p);

      // Live while any part of the road is on screen, with a margin so
      // the scene is already running by the time it is looked at.
      // Dark the moment the road is behind you. A fixed canvas that
      // keeps drawing under the skills section is the worst possible
      // version of this idea.
      const bottom = b.getBoundingClientRect().bottom;
      const on = bottom > 40;
      setLive(on);
      setReady((r) => r || bottom > -200);
      // Only clickable once you are actually standing in the arc.
      setGrab(p > 0.75);
    };
    const onScroll = () => {
      if (!raf.current) raf.current = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", read);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [still, from, to]);

  if (still) return null;

  return (
    <div
      aria-hidden
      className={cn(
        // z-0, not -z-10. A negative z-index puts the canvas behind
        // its own ancestors' boxes, and #root then swallows every click
        // meant for a building. Stacking it at zero under a z-10 main
        // paints the same and stays hit-testable.
        "fixed inset-0 z-0 transition-opacity duration-500",
        live ? "opacity-100" : "pointer-events-none opacity-0",
        grab ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {ready && (
        <Suspense fallback={null}>
          <StreetScene
            active={live}
            focused={focused}
            onFocus={setFocused}
            narrow={false}
          />
        </Suspense>
      )}
    </div>
  );
}
