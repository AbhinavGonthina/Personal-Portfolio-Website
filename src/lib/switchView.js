import { useSyncExternalStore } from "react";
import { endArrival } from "./arrival";
import { getPlain, setPlain } from "./plain";

/**
 * Switching between the two readings, by craning out of the town.
 *
 * The camera lifts off the street and backs away until the whole
 * place sits in one frame, four slabs close in around it like a
 * bezel, and the plain read comes up over the top. Interactive runs
 * the same number backwards and sets you down at the landing.
 *
 * The first attempt at a transition cost too much, and the reason is
 * worth keeping written down: it subscribed half the component tree
 * to a value that changed every frame, and it put a CSS transform on
 * a canvas that was still redrawing itself sixty times a second. The
 * compositor re-rasterised a full-screen layer every frame on top of
 * everything the town was already doing.
 *
 * So nothing here renders. `p` is a plain module value the frame
 * loop reads, the way `journey` is - the camera move is free because
 * the scene is drawing anyway, and the bezel is four boxes. The two
 * things the DOM has to do are written as custom properties from
 * this loop, so they cost a style recalc on two elements rather than
 * a React pass over the tree. The only renders in the whole sequence
 * are the two the plain switch itself causes.
 */

const DUR = 2.2;
/** When the page behind the veil becomes the plain read. */
const FLIP = 0.44;

/**
 * `?sw=0.4` holds the run at four tenths instead of playing it. No
 * screenshot is faster than a two second move, and the beats in the
 * middle are the ones worth looking at.
 */
function frozen() {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("sw");
  const n = Number(v);
  return v !== null && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : null;
}
const HELD = frozen();

const subs = new Set();
let p = HELD ?? (getPlain() ? 1 : 0);
let dir = 0;
let raf = 0;
let from = 0;
let t0 = 0;

const ease = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** A window of `p`, eased, as its own 0..1. */
const span = (a, b) => (v) => ease((v - a) / (b - a));

/**
 * The run, in four beats.
 *
 * The camera cranes out of the town until the whole place is in one
 * frame. A second frame waits off to the right. The view travels
 * across to it - the town and its frame moving together, because the
 * camera turns rather than slides, and a turn moves everything on
 * screen by the same angle whatever depth it is at. Then the second
 * frame opens out to fill the window, and what is in it is the page.
 */
export const CRANE = span(0, 0.38);
export const SHUT = span(0.12, 0.42);
export const SLIDE = span(0.46, 0.76);
export const OPEN = span(0.78, 0.98);
/**
 * The page is in the second frame from the moment it appears, and
 * invisible below this. Named, because it is also the point at which
 * the scroll can be moved without anybody watching it move.
 */
const PAGE_IN = 0.46;
const PAGE = span(PAGE_IN, 0.6);
const CHROME = span(0, 0.16);

/**
 * The frames, in camera space: how far in front, how far in the
 * first one closes, and the gap between the two as a fraction of the
 * window's half-width.
 */
export const FR = { d: 7, shut: 0.42, gap: 0.14 };

/** Half-extents of the window at the frames' distance. */
export function frameBox(cam) {
  const h = Math.tan((cam.fov * Math.PI) / 360) * FR.d;
  return { h, w: h * cam.aspect };
}

/** How far apart the two frames sit, centre to centre. */
export function frameStep(cam) {
  const { w } = frameBox(cam);
  return 2 * w * (1 - FR.shut) + w * FR.gap;
}

/**
 * What the DOM has to do, as four numbers.
 *
 * The second frame is not a panel in the scene with the page faded
 * in behind it at the end - it is the page, shrunk into the frame's
 * place and carried along with it. These put it there: a scale, an
 * offset, and the opacity of it and of the bar. The scene writes
 * the first three every frame from the same geometry it draws the
 * frames with, so the two cannot drift apart.
 */
function paint() {
  const root = document.documentElement.style;
  // Both ends are the resting state, written out rather than left
  // to a fallback. Removing the properties looked equivalent and was
  // not: the scene is what writes the placement, the scene is torn
  // down at the end of a run, and whatever it wrote last stayed on
  // the page - which is how the plain read ended up with its
  // navigation still shrunk into a frame that no longer existed.
  const done = p <= 0 || p >= 1;
  if (done) {
    root.setProperty("--sw-s", "1");
    root.setProperty("--sw-tx", "0px");
    root.setProperty("--sw-ty", "0px");
    root.setProperty("--sw-clip", "0");
    root.setProperty("--sw-page", "1");
    root.setProperty("--sw-chrome", "1");
    // Nothing behind the page at rest. This used to read --sw-page,
    // which rests at 1 - so the backing stayed up as a full-screen
    // sheet over the canvas, and coming home to the town was a black
    // screen with the town drawing away underneath it.
    root.setProperty("--sw-back", "0");
    // The window the frame holds is back at the document's top edge,
    // where the clip-path fallback also puts it.
    root.setProperty("--sw-y", "0px");
    return;
  }
  root.setProperty("--sw-page", String(PAGE(p)));
  root.setProperty("--sw-back", String(PAGE(p)));
  // The bar goes out with the town it belongs to and comes back with
  // the page, which also owns one.
  root.setProperty("--sw-chrome", String(Math.min(1, 1 - CHROME(p) + PAGE(p))));
  // A frame holds one screenful. The document behind it is six times
  // that, and unclipped it hangs out of the bottom of its own frame.
  root.setProperty("--sw-clip", "1");
}

/** Called by the scene with the second frame's place on the screen. */
export function placePage(scale, tx, ty) {
  const root = document.documentElement.style;
  root.setProperty("--sw-s", String(scale));
  root.setProperty("--sw-tx", `${tx}px`);
  root.setProperty("--sw-ty", `${ty}px`);
}

/**
 * The scroll, and why it is not simply thrown to the top.
 *
 * Both readings begin at their own beginning - that is the right
 * behaviour and it is kept. The frame carries one screenful of the
 * page and takes it from the top of the document, so the run has to
 * get there.
 *
 * What is wrong is doing it on the click. Leaving the town, the page
 * has not appeared yet and nobody sees it happen. Coming home, the
 * page is the thing you are looking at: you click, it throws itself
 * to the top, and then it sits at the top for however long the town
 * takes to build - geometry, textures, and a shader compile for
 * every material in it. The first thing the switch does is undo your
 * place in the reading you are still being shown.
 *
 * So coming home the page is left exactly where it is, and the
 * screenful the frame holds is moved to meet it. `--sw-y` is that
 * offset: the clip window opens there rather than at the document's
 * top edge, and the transform pivots there rather than on the
 * element's top edge - the same point on screen either way, because
 * the page is scrolled by exactly that much. The scroll goes home
 * later, at the moment the page stops being visible, which is a
 * frame nobody can see.
 */
let frozenAt = 0;

function freeze(y) {
  frozenAt = y;
  document.documentElement.style.setProperty("--sw-y", `${y}px`);
}

function thaw() {
  if (!frozenAt) return;
  window.scrollTo({ top: 0, behavior: "instant" });
  freeze(0);
}

function tick(now) {
  // Wall time from the start of the run, not a sum of deltas: a
  // clamped sum stretches to several times its length on a machine
  // that is drawing slowly, and an unclamped one skips the whole
  // thing when a backgrounded tab comes back.
  const was = p;
  p = Math.min(1, Math.max(0, from + (dir * (now - t0)) / (DUR * 1000)));

  if (was < FLIP && p >= FLIP) setPlain(true);
  else if (was > FLIP && p <= FLIP) setPlain(false);
  // Below this the page has faded out of its frame, so the scroll
  // can be sent home with nobody looking at it.
  if (was > PAGE_IN && p <= PAGE_IN) thaw();

  paint();
  if ((dir > 0 && p < 1) || (dir < 0 && p > 0)) {
    raf = requestAnimationFrame(tick);
  } else {
    raf = 0;
    dir = 0;
    paint();
    subs.forEach((fn) => fn());
  }
}

/**
 * Coming back to the town means building it.
 *
 * The scene is not mounted while the plain read is up - that is the
 * point of the plain read - so interactive has to raise the whole
 * thing: geometry, canvas textures, and a shader compile for every
 * material in it. That used to happen with the clock already
 * running, so the first half second of the crane was spent not
 * drawing, which is why this direction stuttered and the other one,
 * where the scene is already up and only the page has to arrive,
 * did not.
 *
 * So the mount goes first and the clock waits for it. The ceiling
 * is there because a scene that never reports back must not be able
 * to strand somebody in the reading they just asked to leave.
 */
let waiting = 0;
const WARM_CEILING = 3000;

function begin() {
  t0 = performance.now();
  if (!raf) raf = requestAnimationFrame(tick);
}

/** Called by the scene once it has compiled and drawn a frame. */
export function sceneReady() {
  if (!waiting) return;
  clearTimeout(waiting);
  waiting = 0;
  begin();
}

export function runSwitch(toPlain) {
  if (HELD !== null) return;
  if (typeof window !== "undefined") {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) {
      p = toPlain ? 1 : 0;
      dir = 0;
      setPlain(toPlain);
      // Nothing is animating, so there is no moment to hide the
      // scroll in and nothing to hide it from.
      window.scrollTo({ top: 0, behavior: "instant" });
      freeze(0);
      paint();
      subs.forEach((fn) => fn());
      return;
    }
  }
  // Whatever else is going on, it is over. Clicking for one reading
  // while the car is still pulling up is a choice about which of the
  // two you want, not a request to watch both at once.
  endArrival();
  if (toPlain) {
    // On the way out the page has not appeared yet, so the top is
    // simply where it starts from.
    window.scrollTo({ top: 0, behavior: "instant" });
    freeze(0);
  } else {
    // On the way home it is on screen for the first half of the
    // run. Left where it is, and the frame's window moved to it.
    freeze(window.scrollY);
  }
  dir = toPlain ? 1 : -1;
  from = p;
  // Mount first: `useSwitching` flips on this, and that is what puts
  // the canvas back on the page.
  subs.forEach((fn) => fn());

  // Leaving the town, the town is already there. Only the way back
  // has anything to wait for.
  if (toPlain || !getPlain()) {
    begin();
    return;
  }
  if (waiting) clearTimeout(waiting);
  waiting = setTimeout(() => {
    waiting = 0;
    begin();
  }, WARM_CEILING);
}

/** Read every frame by the scene. Never subscribes, never renders. */
export const getSwitch = () => p;

/**
 * Whether the page is currently being held away from the top, for
 * code that reads it in a frame callback rather than rendering on it.
 *
 * The stage stops reading the scroll while this is true, because
 * what it would read is a lie: the page is sitting five sections
 * down on purpose, and the stage's answer to a scroll five sections
 * down is to haul it back a stop.
 *
 * Only while it is held, and not for the length of a run. The way
 * out scrolls to the top on the click as it always did, and the
 * stage is meant to see that - the camera snapping to the landing
 * and craning up from there is what the zoom out of the city looks
 * like. Blocking the read for the whole run left it lifting off
 * from whichever stop you happened to be standing at.
 */
export const isHolding = () => frozenAt !== 0;

if (HELD !== null) {
  if (HELD >= FLIP) setPlain(true);
  paint();
}

/**
 * Whether a run is in flight. Flips twice per switch, so the handful
 * of components that need to know cost two renders, not two hundred.
 */
export const useSwitching = () =>
  useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    // A held frame counts as in flight, or the canvas unmounts out
    // from under the very thing the hatch exists to look at.
    () => dir !== 0 || HELD !== null,
    () => false,
  );

/** The shot the crane ends on: the whole town, from up and back. */
export const WIDE = { px: 2, py: 34, pz: 96, lx: 0, ly: 7, lz: 4 };
/** Fog has to open up for it, or the far end is a grey wall. */
export const FOG = { near: 0.019, far: 0.0035 };
