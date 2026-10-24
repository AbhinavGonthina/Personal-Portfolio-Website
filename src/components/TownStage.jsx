import { Suspense, lazy, useEffect, useRef, useState } from "react";
import {
  setFocused,
  setJourney,
  useFocused,
  useJourneyNear,
} from "../lib/stage";
import { usePlain } from "../lib/plain";
import { isHolding, useSwitching } from "../lib/switchView";
import { useArriving } from "../lib/arrival";
import { STOP, STOPS } from "../lib/stops";
import { useStills } from "../lib/stills";
import { rewind, seek } from "../lib/reel";
import {
  holdScroll,
  scrollHeld,
  isJumping,
  trackJump,
  useScrollLock,
} from "../lib/scrollLock";
import { cn } from "../lib/cn";

/**
 * The scene, and the canvas textures it is dressed with, both
 * behind the same boundary.
 *
 * `lib/paint` imports three for `CanvasTexture`, and
 * `lib/townGeometry` imports it through `lib/geo`. Both used to be
 * imported here, and this component is mounted on every visit - so
 * the entry's static graph reached three, and every reader
 * downloaded 193 kB gzip of renderer whether or not they ever saw
 * the town. The painting moved down into the lazy chunk with the
 * scene; nothing else about it changed.
 */
const Painted = lazy(() => import("../scenes/Painted"));

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
  const [still] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const raf = useRef(0);
  const was = useRef(0);
  const held = useRef(-1);
  // Where the scroll is held, and until when. See the clamp in read().
  // Where the arrival pause is holding the page. How long it holds
  // for is `scrollLock`'s business now, not a second counted here.
  const pin = useRef({ y: 0 });
  // The scroll position at the previous frame, to tell a link that
  // has finished moving the page from one that is still in flight.
  const prevY = useRef(-1);
  // Set when something other than the scroll could have moved a
  // section, so the next frame measures instead of skipping.
  const stale = useRef(true);
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

  // Which repository is open. The painting of it lives in the
  // lazy chunk; this is here because the scroll reader closes it
  // when the camera walks away from the desk.
  const [opened, setOpened] = useState(null);

  // Not until the walk has set off.
  //
  // These twelve screenshots are about 600KB and none of them is
  // looked at before the fourth stop. `useStills` already deferred
  // them to `requestIdleCallback`, which sounds like the right
  // answer and is not: idle fires as soon as the main thread has a
  // gap, and on a cold load that gap is at 109ms - before the
  // 1.1MB scene chunk has finished arriving. So the stills were
  // not competing for the processor, they were competing for the
  // connection, during the one window where the wait is on screen.
  //
  // Half a stop down the page is the signal instead. By then the
  // town has been built and drawn, the reader is moving, and there
  // are three and a half sections of scrolling left before the
  // desk - far longer than 600KB takes. Latched, because walking
  // back to the top should not cancel a download that is already
  // running, and because a nav link to Projects jumps the number
  // straight past this.
  const walking = useJourneyNear(0.4, Infinity);
  const begun = useRef(false);
  if (walking) begun.current = true;
  const stills = useStills(off || !begun.current);

  // Opening or closing a repository puts the new page at its top.
  const open = (id) => {
    rewind();
    setOpened(id);
  };

  useEffect(() => {
    if (off) return;
    const read = () => {
      raf.current = 0;
      // Not while the switch is holding the page away from the top.
      // It is parked five sections down on purpose, so the reader
      // keeps their place while the town is built, and the answer
      // here to a scroll five sections down is to pull it back a
      // stop.
      //
      // Only while it is held. The way out scrolls to the top on
      // the click, and this has to see that happen: the camera
      // dropping to the landing and craning up from there is the
      // zoom out of the city. Gated on the whole run instead, it
      // lifted off from whichever stop you were standing at.
      //
      // Every one of these says "look again next frame" rather
      // than returning. A bare `return` here does not wait for a
      // better frame, it ends the loop: nothing else schedules
      // `read`, so the camera stops following the page for the
      // rest of the visit.
      const again = () => {
        if (!raf.current) raf.current = requestAnimationFrame(read);
      };
      if (isHolding()) return again();

      // A page that has not moved cannot have moved the camera.
      //
      // This loop runs every frame for the whole visit, and the
      // first thing it used to do was read six bounding rects -
      // sixty times a second, forever, whether or not anything had
      // happened. Everything below depends on the scroll, so when
      // the scroll is where it was last frame there is nothing
      // here to work out.
      //
      // `trackJump` is the exception and still runs: a jump ends
      // when the page has moved and then stopped, so the frame
      // where nothing moved is exactly the one it is waiting for.
      //
      // `stale` is set by anything that can change the answer
      // without the scroll changing - a resize, or the sections
      // themselves being swapped for the other reading.
      const y0 = window.scrollY;
      if (y0 === prevY.current && !stale.current) {
        trackJump(false);
        return again();
      }
      stale.current = false;

      const els = refs.map((r) => r.current).filter(Boolean);
      if (els.length < 2) return again();

      // Where the scroll sits between two section tops is where the
      // camera sits between two stops. Measured against document
      // offsets rather than viewport rects, so a sticky navbar or a
      // mid-scroll layout shift cannot wobble the camera.
      // Document-relative, not offsetTop: one of these markers lives
      // inside a positioned section, where offsetTop is measured from
      // the section rather than from the page.
      const raw = window.scrollY;
      const at = els.map((el) => el.getBoundingClientRect().top + raw);

      // Not until the browser has laid them out.
      //
      // The reading flips inside the frame loop, so the town's
      // sections mount and this can run in the same frame, before
      // any of them has been given a height. Every rect comes back
      // at zero, every section top is the same number, and the
      // test below for "past the last one" is `0 >= 0` - so the
      // camera is told it is at the final stop.
      //
      // Six sections down a page are six increasing numbers. Any
      // other answer is a page that is not finished, whether that
      // is all of them at zero or only the last two, so none of it
      // is measured until they are a ladder.
      let laid = true;
      for (let i = 1; i < at.length; i++) {
        if (at[i] <= at[i - 1]) laid = false;
      }
      if (!laid) return again();
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
      if (scrollHeld() && y > pin.current.y) {
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
        if (n !== held.current && !scrollHeld()) {
          held.current = n;
          // Pinned where you arrived, not at the top of the section:
          // the pause is there to stop you overshooting, not to tidy
          // up the position you chose.
          pin.current = { y };
          holdScroll(1000);
          // Arriving at the desk always starts at the top of the
          // list, however far down it was left last time.
          if (n === STOP.projects) seek("top");
        }
      }

      was.current = j;

      // Walking away closes whatever card was open and puts the list
      // back at the top. Without this you come back to the desk on
      // the detail page you left on, with no sign that there is a
      // grid behind it - the way back is a button you have to
      // already know is there.
      if (j < STOP.projects - 0.4 || j > STOP.projects + 0.4) {
        setOpened((o) => {
          if (o !== null) rewind();
          return o === null ? o : null;
        });
      }

      // One rect, read once. These were two separate
      // `getBoundingClientRect()` calls on the same element on the
      // next line down, which is two forced layouts a frame for a
      // number that cannot have changed between them.
      const bottom = els[els.length - 1].getBoundingClientRect().bottom;
      setLive(bottom > 40);
      setReady((r) => r || bottom > -200);
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
        if (scrollHeld()) {
          cap = Math.min(cap, pin.current.y);
        }
        if (window.scrollY > cap) {
          window.scrollTo({ top: cap, behavior: "instant" });
        }
      }
      if (!raf.current) raf.current = requestAnimationFrame(read);
    };
    // A resize changes every section's height, which is the one
    // way the answer moves without the scroll moving.
    const onResize = () => {
      stale.current = true;
      read();
    };
    stale.current = true;
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
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
          <Painted
            live={live}
            focused={focused}
            onFocus={setFocused}
            onOpen={open}
            opened={opened}
            stills={stills}
          />
        </Suspense>
      )}
    </div>
  );
}
