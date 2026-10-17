import { Suspense, lazy, useEffect, useMemo, useRef, useState } from "react";
import { setFocused, setJourney, useFocused } from "../lib/stage";
import { usePlain } from "../lib/plain";
import { useSwitching } from "../lib/switchView";
import { useArriving } from "../lib/arrival";
import { STOP, STOPS } from "../lib/stops";
import {
  paintBoard,
  paintBoardFace,
  paintMark,
  paintScreen,
  paintSkills,
} from "../lib/paint";
import {
  BOARD_LAMPS as LAMPS_AT,
  BOARD_PANEL_LAMP as PANEL_LAMP,
} from "../lib/townGeometry";
import { projects } from "../data/projects";
import { profile, socials } from "../data/profile";
import { education } from "../data/about";
import { skillGroups } from "../data/skills";
import {
  holdScroll,
  isJumping,
  trackJump,
  useScrollLock,
} from "../lib/scrollLock";
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
  const arriving = useArriving();
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
  const was = useRef(0);
  const held = useRef(-1);
  // Where the scroll is held, and until when. See the clamp in read().
  const pin = useRef({ until: 0, y: 0 });
  // The scroll position at the previous frame, to tell a link that
  // has finished moving the page from one that is still in flight.
  const prevY = useRef(-1);
  // The section tops as last measured, so the scroll handler can
  // clamp without laying the page out again on every event.
  const tops = useRef([]);
  // Still mounted while the crane is running: the town is the thing
  // being craned away from, and it is on screen for most of it.
  const switching = useSwitching();
  const off = !!((plain && !switching) || still);

  // Nothing moves while the car is pulling up. The camera is on its
  // own clock for those few seconds and scrolling would only put the
  // journey somewhere the sequence is about to overwrite.
  // Pinned while the crane is out, as well as while the car is.
  // Scrolling through a shot that has left the ground walks the
  // camera somewhere the crane then has to fight it back from.
  useScrollLock((arriving && !off) || switching);

  // Everything the town has to say is painted into a canvas texture
  // once and only repainted when what it shows changes.
  const marks = useMemo(
    () => (off ? [] : socials.map((s) => paintMark(s.icon, s.name))),
    [off],
  );
  const board = useMemo(
    () => (off ? null : paintBoard(profile, education, PANEL_LAMP)),
    [off],
  );
  // Where the two lamps hang, as a fraction across the board, so the
  // pools they cast land under them rather than near them.
  const boardFace = useMemo(
    () => (off ? null : paintBoardFace(LAMPS_AT)),
    [off],
  );
  const skills = useMemo(() => (off ? null : paintSkills(skillGroups)), [off]);
  const screen = useMemo(
    () => (off ? null : paintScreen(projects[shot], shot, projects.length)),
    [off, shot],
  );
  useEffect(() => () => marks.forEach((m) => m.dispose()), [marks]);
  useEffect(() => () => board?.dispose(), [board]);
  useEffect(() => () => boardFace?.dispose(), [boardFace]);
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
      const raw = window.scrollY;
      const at = els.map((el) => el.getBoundingClientRect().top + raw);
      tops.current = at;

      // A stop holds you for a second, and holding the position is
      // the only way to do it. Cancelling the input is not enough:
      // the momentum behind a flick is already in flight, arrives as
      // scroll events rather than wheel events, and carries you
      // straight through the section you have only just reached.
      // Backwards is never held, so this only ever clamps forwards.
      let y = raw;
      // A link in flight is done once it has moved the page and come
      // to rest.
      trackJump(y !== prevY.current);
      prevY.current = y;
      if (performance.now() < pin.current.until && y > pin.current.y) {
        y = pin.current.y;
        window.scrollTo({ top: y, behavior: "instant" });
      }
      let j = 0;
      if (y >= at[at.length - 1]) j = at.length - 1;
      else {
        for (let i = 0; i < at.length - 1; i++) {
          if (y < at[i + 1]) {
            const span = Math.max(1, at[i + 1] - at[i]);
            j = i + Math.max(0, (y - at[i]) / span);
            break;
          }
        }
      }
      j = Math.min(STOPS.length - 1, j);
      // Landing on a stop has to count as being at it.
      //
      // Section tops are fractional and scrollY is a whole number, so
      // scrolling exactly onto a boundary lands a hair short of it -
      // 2.999, not 3. Everything downstream counts stops with
      // Math.floor, and a hair short is a whole stop short: the cap
      // below stayed pinned to the boundary you were already on and
      // the page could not be scrolled past it at all. Three pixels
      // of tolerance, which is less than one line of the grid.
      const whole = Math.round(j);
      if (Math.abs(j - whole) < 0.004) j = whole;
      setJourney(j);

      // Reaching a stop costs you a second of going forward.
      //
      // It fires when the scroll actually arrives at the stop - not a
      // little before it, not on the way past - so the pause lands on
      // the shot rather than somewhere in the approach to it. Going
      // back up is never blocked, and nothing is moved for you: you
      // keep the position you scrolled to and carry on at your own
      // pace once the second is up.
      //
      // A fast flick is the exception. If one frame carries the scroll
      // across more than one boundary, the page is pulled back to the
      // first of them - otherwise a flick skips whole sections, which
      // is exactly what the pause exists to prevent and which no
      // amount of cancelling input afterwards can undo. Only on the
      // way down, and only when a section would actually have been
      // missed.
      // Coming back up re-arms the stops you have come back past.
      //
      // The pause is once per arrival, not once per page: without
      // this, walking down to Projects and scrolling back to the top
      // left every stop behind you already spent, so the next flick
      // went through all of them without being held once. That is the
      // skip - not a frame carrying too far, which was already
      // caught, but a second run down a page that had stopped
      // defending itself.
      //
      // It takes a real retreat, not a hair of one. Pinned at a stop
      // the journey sits a float's width either side of a whole
      // number, and re-arming on that put the page in a loop: the
      // pin clamps you, the clamp reads as going backwards, the stop
      // re-arms, and About becomes the end of the site.
      if (j < held.current - 0.25) held.current = Math.floor(j + 1e-6);

      const prev = was.current;
      const from = Math.floor(prev + 1e-6);
      let to = Math.floor(j + 1e-6);
      if (j > prev && to > from && !isJumping()) {
        const n = from + 1;
        if (to > n && n < at.length) {
          y = at[n];
          window.scrollTo({ top: y, behavior: "instant" });
          j = n;
          to = n;
          setJourney(j);
        }
        // Once per stop per visit: the point is to stop a flick
        // carrying you past a section the first time you see it, not
        // to meter every pass.
        // Never while one is still running: a pin that can replace
        // itself is a pin that never ends.
        if (n !== held.current && performance.now() >= pin.current.until) {
          held.current = n;
          // Pinned where you arrived, not at the top of the section:
          // the pause is there to stop you overshooting, not to tidy
          // up the position you chose.
          pin.current = { until: performance.now() + 1000, y };
          holdScroll(1000);
        }
      }
      was.current = j;

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
      // The two guards are enforced here, on the event itself, and
      // not in the frame callback below.
      //
      // That callback is throttled to the renderer, and the renderer
      // is slowest exactly when a flick is longest - a frame spent
      // drawing eight towers twice is a frame in which the page can
      // travel three sections unwatched. Clamping on the event costs
      // a comparison against numbers measured on the last frame and
      // cannot be starved.
      //
      // The cap is the next stop down. You can never be more than one
      // stop ahead of where the camera is, which makes skipping a
      // section impossible rather than merely unlikely; at any honest
      // frame rate the camera keeps up and you never feel it. On top
      // of that sits the second you are held for on arrival. Neither
      // applies to a link, which crosses stops because you asked it
      // to, and neither ever stops you going back up.
      const at = tops.current;
      if (at.length > 1 && !isJumping()) {
        const next = Math.min(
          at.length - 1,
          Math.floor(was.current + 1e-6) + 1,
        );
        let cap = at[next];
        if (performance.now() < pin.current.until) {
          cap = Math.min(cap, pin.current.y);
        }
        if (window.scrollY > cap) {
          window.scrollTo({ top: cap, behavior: "instant" });
        }
      }
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
            boardFace={boardFace}
            marks={marks}
          />
        </Suspense>
      )}
    </div>
  );
}
