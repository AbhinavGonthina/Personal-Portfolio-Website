import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { setFocused, setJourney, useFocused } from "../lib/stage";
import { usePlain } from "../lib/plain";
import { STOP, STOPS } from "../lib/stops";
import { paintBoard, paintMark, paintScreen, paintSkills } from "../lib/paint";
import { projects } from "../data/projects";
import { profile, socials } from "../data/profile";
import { education } from "../data/about";
import { skillGroups } from "../data/skills";
import { cn } from "../lib/cn";

const TownScene = lazy(() => import("../scenes/TownScene"));

/**
 * The one canvas, fixed behind the page.
 *
 * It is pinned to the viewport because the whole site is one walk
 * through one town: scrolling has to move the camera, not scroll a
 * picture out of frame. Each section on the page is a stop, and where
 * the scroll sits between two section tops is where the camera sits
 * between two stops.
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
  const [ready, setReady] = useState(false);
  const [live, setLive] = useState(false);
  const [grab, setGrab] = useState(false);
  const [shot, setShot] = useState(0);
  const [still] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const raf = useRef(0);
  const off = !!(plain || still);

  // Everything the town has to say is painted into a canvas texture
  // once and only repainted when what it shows changes.
  const marks = useMemo(
    () => (off ? [] : socials.map((s) => paintMark(s.icon, s.name))),
    [off],
  );
  const board = useMemo(
    () => (off ? null : paintBoard(profile, education)),
    [off],
  );
  const skills = useMemo(() => (off ? null : paintSkills(skillGroups)), [off]);
  const screen = useMemo(
    () => (off ? null : paintScreen(projects[shot], shot, projects.length)),
    [off, shot],
  );
  useEffect(() => () => marks.forEach((m) => m.dispose()), [marks]);
  useEffect(() => () => board?.dispose(), [board]);
  useEffect(() => () => skills?.dispose(), [skills]);
  useEffect(() => () => screen?.dispose(), [screen]);

  useEffect(() => {
    if (off) return;
    const read = () => {
      raf.current = 0;
      const els = refs.map((r) => r.current).filter(Boolean);
      if (els.length < 2) return;

      // Where the scroll sits between two section tops is where the
      // camera sits between two stops. Measured against document
      // offsets rather than viewport rects, so a sticky navbar or a
      // mid-scroll layout shift cannot wobble the camera.
      // Document-relative, not offsetTop: one of these markers lives
      // inside a positioned section, where offsetTop is measured from
      // the section rather than from the page.
      const y = window.scrollY;
      const tops = els.map((el) => el.getBoundingClientRect().top + y);
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
      j = Math.min(STOPS.length - 1, j);
      setJourney(j);

      // The camera holds still across the Projects section; the screen
      // is what moves. One scroll of that section walks the whole list.
      const t = Math.min(
        1,
        Math.max(
          0,
          (j - STOP.projects) / (STOP["projects-hold"] - STOP.projects),
        ),
      );
      setShot(Math.min(projects.length - 1, Math.floor(t * projects.length)));

      const last = els[els.length - 1];
      setLive(last.getBoundingClientRect().bottom > 40);
      setReady((r) => r || last.getBoundingClientRect().bottom > -200);
      // Only clickable where there is something to click. The towers
      // and the mailboxes do their own finer-grained gating; this just
      // stops the page swallowing pointer events everywhere else.
      setGrab(
        (j > STOP.experience - 0.5 && j < STOP.experience + 0.6) ||
          j > STOP.contact - 0.4,
      );
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
            skills={skills}
            board={board}
            marks={marks}
          />
        </Suspense>
      )}
    </div>
  );
}
