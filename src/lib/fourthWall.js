import { useSyncExternalStore } from "react";
import { setPlain } from "./plain";

/**
 * Switching between the two readings, the long way round.
 *
 * The town pulls back until it turns out to be a monitor on a desk
 * with someone sitting at it; they reach for the tablet beside the
 * keyboard, lift it, and the tablet is the plain read. Going back
 * plays the same thing in reverse and sets you down at the landing.
 *
 * It is one number. Everything that moves - how far the canvas has
 * shrunk, how solid the desk is, where the hand is, how big the
 * tablet is, whether the page underneath is showing - is a function
 * of `p`, running 0 at the town and 1 at the tablet. Driving it that
 * way means the reverse is free: run the same number back down.
 *
 * The switch itself happens at 0.8, by which point the tablet has
 * most of the screen and nothing of the page behind it is visible.
 */

const DUR = 2.6;
const FLIP = 0.8;

const subs = new Set();
let p = 0;
let dir = 0;
let raf = 0;
// Where the run started and when, in wall time.
let from = 0;
let t0 = 0;

const emit = () => subs.forEach((fn) => fn());

function tick(now) {
  // Wall time from the start of the run, not a sum of deltas.
  //
  // Summing them needs a clamp, or a tab returning from the
  // background jumps the whole sequence in one frame; and the clamp
  // then docks every honest frame on a machine that is drawing
  // slowly, which is how two and a half seconds became thirteen.
  // Measuring from the start costs nothing and is right at any
  // frame rate.
  const was = p;
  p = Math.min(1, Math.max(0, from + (dir * (now - t0)) / (DUR * 1000)));

  if (was < FLIP && p >= FLIP) setPlain(true);
  else if (was > FLIP && p <= FLIP) setPlain(false);

  emit();
  if ((dir > 0 && p < 1) || (dir < 0 && p > 0)) {
    raf = requestAnimationFrame(tick);
  } else {
    raf = 0;
    dir = 0;
    emit();
  }
}

/**
 * Run the sequence towards the plain read, or back from it.
 *
 * Anyone who has asked not to be moved about gets the switch and
 * nothing else; so does anyone who clicks again while it is still
 * playing, in the sense that it simply turns round where it stands.
 */
export function runWall(toPlain) {
  const wants = toPlain ? 1 : -1;
  if (typeof window !== "undefined") {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) {
      p = toPlain ? 1 : 0;
      dir = 0;
      setPlain(toPlain);
      emit();
      return;
    }
  }
  dir = wants;
  from = p;
  t0 = performance.now();
  if (!raf) raf = requestAnimationFrame(tick);
}

export const getWall = () => p;
export const wallRunning = () => dir !== 0;

export const useWall = () =>
  useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => p,
    () => 0,
  );

/* ---------------------------------------------------------------- */

/**
 * Where the town ends up once it is a monitor, as a fraction of the
 * viewport and a height to sit at. The bezel in the scene is drawn
 * from these same two numbers, so the picture lands inside its frame
 * rather than near it.
 */
export const MON = { scale: 0.6, mid: 0.33 };

const ease = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** A window of `p`, eased, as its own 0..1. */
export const span = (from, to) => (v) => ease((v - from) / (to - from));

export const PULL = span(0, 0.42);
export const DESK = span(0.06, 0.38);
export const REACH = span(0.4, 0.58);
export const LIFT = span(0.56, 0.9);
/**
 * The page comes up underneath the tablet while the tablet still has
 * the screen, and the tablet is taken away after it. Both are nearly
 * black, so the handover is a cut nobody sees - and crossing them
 * over instead would put two half-transparent dark layers on top of
 * each other, which is a smear.
 */
export const PAGE = span(0.8, 0.9);
export const GONE = span(0.9, 1);
/** The bar, the readout and the hint: all of them are the page. */
export const CHROME = span(0, 0.16);
export const DIM = span(0.66, 0.88);
