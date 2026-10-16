import { useSyncExternalStore } from "react";
import { setPlain } from "./plain";

/**
 * Switching between the two readings, the long way round.
 *
 * The town pulls back until it turns out to be a monitor on a desk
 * with someone sitting at it, and then that person looks up from it
 * at the wall - which is the plain read. Going back lowers their
 * eyes to the screen again and sets you down at the landing.
 *
 * It is one number. Everything that moves - how far the canvas has
 * shrunk, how solid the desk is, where the hand is, how big the
 * tablet is, whether the page underneath is showing - is a function
 * of `p`, running 0 at the town and 1 at the tablet. Driving it that
 * way means the reverse is free: run the same number back down.
 *
 * The switch itself happens at 0.52, just before the view tilts, so
 * the page is real content by the time it slides into frame.
 */

const DUR = 2.6;
const FLIP = 0.52;

/**
 * `?wall=0.3` holds the sequence at three tenths of the way through
 * instead of playing it - the only practical way to look hard at one
 * beat of a two and a half second move, or to screenshot it.
 */
function frozen() {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("wall");
  const n = Number(v);
  return v !== null && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : null;
}
const HELD = frozen();

const subs = new Set();
let p = HELD ?? 0;
// A held frame past the switch has to be past it in every sense, or
// the wall you are looking up at is the interactive page's empty
// scaffolding rather than the plain read.
if (HELD !== null && HELD >= FLIP) setPlain(true);
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
  if (HELD !== null) return;
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

const ease = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** A window of `p`, eased, as its own 0..1. */
export const span = (from, to) => (v) => ease((v - from) / (to - from));

/**
 * The screen and the frame around it recede together, so the monitor
 * arrives by getting further away rather than by being drawn on top
 * of a picture that was already shrinking.
 */
export const PULL = span(0, 0.45);
/** The room coming up out of the dark around it. */
export const DESK = span(0.1, 0.42);
/**
 * Then you look up.
 *
 * Nothing in the room moves - no one reaches for anything, no one
 * turns. The view tilts, the desk leaves by the bottom of the frame
 * and the wall above it comes in from the top, and the wall is the
 * plain read. It is the one move that needs no animation of the
 * person at all, which is the only way a drawn figure stays
 * convincing.
 */
export const LOOK = span(0.55, 1);
export const PAGE = span(0.55, 0.68);
/** The bar, the readout and the hint: all of them are the page. */
export const CHROME = span(0, 0.16);

/**
 * Where the town ends up once it is a monitor, as a fraction of the
 * viewport and a height to sit at. The bezel is drawn from these
 * same two numbers, so the picture lands inside its frame.
 */
export const MON = { scale: 0.6, mid: 0.33 };
