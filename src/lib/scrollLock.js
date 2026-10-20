import { useEffect } from "react";

/**
 * Two ways of stopping the page, because they stop it for different
 * reasons.
 *
 * `useScrollLock` is indefinite and airtight: the body stops being
 * scrollable at all. That is what a focused building needs, since the
 * page must not move until you come back out.
 *
 * `holdScroll` is a short pause on going *forward* only. It cancels
 * the input rather than the overflow, so the page can still be
 * scrolled in code and so going back up is never blocked - the pause
 * is there to stop you overshooting a section you have only just
 * arrived at, not to trap you in it.
 *
 * The pause outlasts its own clock on purpose. A hard flick on a
 * trackpad keeps delivering wheel events for a second or more after
 * the fingers have left it, so a pause that ends on a timer ends
 * into the middle of that tail: the page sits still for its second
 * and then slides on by itself, carried by a gesture the reader
 * made before they knew there was anything here to stop for. So the
 * hold stays up until the input it was holding back has actually
 * died away, and going on takes a new scroll rather than the
 * remains of the old one.
 */

const FORWARD_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
const BACK_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

/**
 * How long forward input has to stop for before the gesture counts
 * as over. Momentum ticks arrive about a frame apart, so anything
 * past a few frames of quiet is a hand that has stopped asking.
 */
const GESTURE_GAP = 170;

/**
 * The longest the hold will outstay its clock waiting for quiet.
 * Someone scrolling steadily and deliberately never stops for
 * GESTURE_GAP at all, and they are not to be trapped.
 */
const MAX_WAIT = 2000;

let holdUntil = 0;
let holding = false;
let touchFrom = 0;
let lastPush = 0;

/** Whether the pause is still standing, clock and tail together. */
const stillHeld = () => {
  const now = performance.now();
  if (now <= holdUntil) return true;
  if (now > holdUntil + MAX_WAIT) return false;
  return now - lastPush < GESTURE_GAP;
};

/** Whether forward scroll input is being swallowed right now. */
export const scrollHeld = () => holding && stillHeld();

const swallow = (e) => {
  if (e.type === "touchstart") {
    touchFrom = e.touches[0]?.clientY ?? 0;
    return;
  }

  let forward;
  if (e.type === "wheel") forward = e.deltaY > 0;
  else if (e.type === "keydown") {
    forward = FORWARD_KEYS.has(e.key) && !BACK_KEYS.has(e.key);
  } else {
    // A finger moving up the screen scrolls the page down.
    forward = touchFrom - (e.touches[0]?.clientY ?? 0) > 0;
  }
  // Only forward input keeps the gesture alive. Scrolling back up is
  // never held, and must not be what stops the hold from lifting.
  if (!forward) return;

  // Read before writing: once `lastPush` is now, the gap is zero and
  // every tail event looks like the start of something new.
  const held = stillHeld();
  lastPush = performance.now();
  if (held) e.preventDefault();
};

const EVENTS = ["wheel", "touchstart", "touchmove", "keydown"];

function release() {
  if (!holding) return;
  holding = false;
  for (const type of EVENTS) {
    window.removeEventListener(type, swallow, { capture: true });
  }
}

let jumpUntil = 0;
let jumpMoved = false;
let jumpDest = null;

/**
 * A link is taking you somewhere, so get out of the way.
 *
 * Crossing four stops at once is the thing the arrival pause exists
 * to prevent - when a flick does it by accident. When a nav link does
 * it you asked for it, and a pause that pins the page one section in
 * turns the link into a link to somewhere else. The stage checks this
 * before arming either the pause or the pin.
 */
export function beginJump(ms = 2500, to = null) {
  jumpUntil = performance.now() + ms;
  jumpMoved = false;
  jumpDest = to;
}

export const isJumping = () => performance.now() < jumpUntil;

/**
 * Where the jump is going, as a stop index, or null if nothing is
 * going anywhere.
 *
 * The scroll position cannot answer this while a jump is in flight:
 * it ramps towards the destination over half a second, so for most
 * of the trip "where the page is" is somewhere in the middle. The
 * camera needs the destination at the first frame to decide whether
 * the route passes through anything it should not be routed
 * through.
 */
export const jumpTo = () => (isJumping() ? jumpDest : null);

/**
 * Called once a frame while the page is being read, with whether the
 * scroll moved since the last one. A jump ends when the page has
 * moved and then stopped - not the first time it is found standing
 * still, which is what it is doing in the frame right after the click
 * while the smooth scroll has yet to start.
 */
export function trackJump(moving) {
  if (!isJumping()) return;
  if (moving) jumpMoved = true;
  else if (jumpMoved) {
    jumpUntil = 0;
    jumpDest = null;
  }
}

/** Ignores forward scroll input for `ms`. Programmatic scrolling is untouched. */
export function holdScroll(ms) {
  holdUntil = Math.max(holdUntil, performance.now() + ms);
  if (holding) return;
  holding = true;
  const opts = { capture: true, passive: false };
  for (const type of EVENTS) window.addEventListener(type, swallow, opts);
  const tick = () => {
    if (!stillHeld()) release();
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/**
 * Pins the page while something has taken over the view.
 *
 * Taking the scrollbar away makes the viewport a dozen pixels wider,
 * so something has to absorb that or the layout jumps on the way in
 * and again on the way out. Padding the body did absorb it, and left
 * every bar that spans the page - the navbar most visibly - stopping
 * short of the edge in a strip of bare scene. So the gap is published
 * instead, and the one element that must not move compensates for it
 * itself. Everything else is either fixed, and never saw the padding,
 * or invisible while the lock is on.
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const body = document.body;
    const gap = window.innerWidth - root.clientWidth;
    const overflow = body.style.overflow;
    body.style.overflow = "hidden";
    if (gap > 0) root.style.setProperty("--lock-gap", `${gap}px`);
    return () => {
      body.style.overflow = overflow;
      root.style.removeProperty("--lock-gap");
    };
  }, [locked]);
}
