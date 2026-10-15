import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { setFocused, setJourney, useFocused } from "../lib/stage";
import { usePlain } from "../lib/plain";
import { STOPS } from "../lib/stops";
import { paintMark, paintScreen } from "../lib/paint";
import { projects } from "../data/projects";
import { socials } from "../data/profile";
import { useShown } from "../lib/shown";
import { cn } from "../lib/cn";

const TownScene = lazy(() => import("../scenes/TownScene"));

/**
 * The one canvas, fixed behind the page.
 *
 * It is pinned to the viewport rather than parked inside a section
 * because the whole site is one walk through one town: scrolling has to
 * move the camera, not scroll a picture out of frame. Each section on
 * the page is a stop, and where the scroll sits between two section
 * tops is where the camera sits between two stops.
 *
 * Four guards, all of which matter:
 *
 * - The scene is code-split, so three.js is not in the initial bundle.
 * - The render loop stops once the town is behind you.
 * - Anyone who asked the OS to calm animations gets no canvas, and
 *   every section falls back to its flat layout.
 * - So does anyone who asked for the straightforward read. That switch
 *   is meant to remove the whole production, not dim it.
 */
export default function TownStage({ refs }) {
  const plain = usePlain();
  const focused = useFocused();
  const shown = useShown();
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [grab, setGrab] = useState(false);
  const [still] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const raf = useRef(0);
  const off = !!(plain || still);

  // The marks on the mailboxes, and whatever is on the monitor. Both are
  // canvas textures, so they are built once and only repainted when the
  // thing they show changes.
  const marks = useMemo(
    () => (off ? [] : socials.map((s) => paintMark(s.icon, s.name))),
    [off],
  );
  useEffect(() => () => marks.forEach((m) => m.dispose()), [marks]);

  const screen = useMemo(() => {
    if (off) return null;
    const i = Math.max(
      0,
      projects.findIndex((p) => p.id === shown),
    );
    return paintScreen(projects[i], i, projects.length);
  }, [off, shown]);
  useEffect(() => () => screen?.dispose(), [screen]);

  useEffect(() => {
    if (off) return;
    const read = () => {
      raf.current = 0;
      const els = refs.map((r) => r.current).filter(Boolean);
      if (els.length < 2) return;

      // Where the scroll sits between two section tops is where the
      // camera sits between two stops. Measured against documented
      // offsets rather than viewport rects, so a sticky navbar or a
      // mid-scroll layout shift cannot wobble the camera.
      const tops = els.map((el) => el.offsetTop);
      const y = window.scrollY;
      let j = 0;
      if (y >= tops[tops.length - 1]) j = tops.length - 1;
      else {
        for (let i = 0; i < tops.length - 1; i++) {
          if (y < tops[i + 1]) {
            const span = Math.max(1, tops[i + 1] - tops[i]);
            j = i + Math.max(0, (y - tops[i]) / span);
            break;
          }
        }
      }
      setJourney(Math.min(STOPS.length - 1, j));

      const last = els[els.length - 1];
      const bottom = last.getBoundingClientRect().bottom;
      setLive(bottom > 40);
      setReady((r) => r || bottom > -200);
      // Clickable only where there is something to click: in the middle
      // of the skyline, and out at the mailboxes.
      setGrab((j > 1.6 && j < 2.6) || j > 4.5);
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
  }, [off, refs]);

  if (off) return null;

  return (
    <div
      aria-hidden
      className={cn(
        // z-0, not -z-10. A negative z-index puts the canvas behind its
        // own ancestors' boxes, and #root then swallows every click
        // meant for the scene. Stacking it at zero under a z-10 main
        // paints the same and stays hit-testable.
        "fixed inset-0 z-0 transition-opacity duration-500",
        live ? "opacity-100" : "opacity-0",
        grab ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {ready && (
        <Suspense fallback={null}>
          <TownScene
            active={live}
            focused={focused}
            onFocus={setFocused}
            narrow={false}
            screen={screen}
            marks={marks}
          />
        </Suspense>
      )}
    </div>
  );
}
