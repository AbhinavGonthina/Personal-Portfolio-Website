import { useSyncExternalStore } from "react";
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
const FLIP = 0.74;

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
export const CRANE = span(0, 0.4);
export const SHUT = span(0.14, 0.44);
export const SLIDE = span(0.48, 0.76);
export const OPEN = span(0.78, 0.97);
const VEIL = span(0.8, 0.95);
const PAGE = span(0.86, 1);
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

function paint() {
  const root = document.documentElement.style;
  if (p <= 0) {
    root.removeProperty("--sw-veil");
    root.removeProperty("--sw-page");
    root.removeProperty("--sw-chrome");
    return;
  }
  root.setProperty("--sw-veil", String(VEIL(p)));
  root.setProperty("--sw-page", String(PAGE(p)));
  // The bar goes out with the town it belongs to and comes back with
  // the page, which also owns one. Written as a single expression so
  // it lands on 1 at both ends: left at 0 when the run finished, the
  // plain read had no navigation at all.
  root.setProperty("--sw-chrome", String(Math.min(1, 1 - CHROME(p) + PAGE(p))));
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

export function runSwitch(toPlain) {
  if (HELD !== null) return;
  if (typeof window !== "undefined") {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) {
      p = toPlain ? 1 : 0;
      dir = 0;
      setPlain(toPlain);
      paint();
      subs.forEach((fn) => fn());
      return;
    }
  }
  dir = toPlain ? 1 : -1;
  from = p;
  t0 = performance.now();
  subs.forEach((fn) => fn());
  if (!raf) raf = requestAnimationFrame(tick);
}

/** Read every frame by the scene. Never subscribes, never renders. */
export const getSwitch = () => p;

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
    () => dir !== 0,
    () => false,
  );

/** The shot the crane ends on: the whole town, from up and back. */
export const WIDE = { px: 2, py: 34, pz: 96, lx: 0, ly: 7, lz: 4 };
/** Fog has to open up for it, or the far end is a grey wall. */
export const FOG = { near: 0.019, far: 0.0035 };
