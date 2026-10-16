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
 */

const FORWARD_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
const BACK_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

let holdUntil = 0;
let holding = false;
let touchFrom = 0;

const swallow = (e) => {
  if (performance.now() > holdUntil) return;
  if (e.type === "wheel") {
    if (e.deltaY > 0) e.preventDefault();
    return;
  }
  if (e.type === "keydown") {
    if (FORWARD_KEYS.has(e.key) && !BACK_KEYS.has(e.key)) e.preventDefault();
    return;
  }
  if (e.type === "touchstart") {
    touchFrom = e.touches[0]?.clientY ?? 0;
    return;
  }
  // A finger moving up the screen scrolls the page down.
  if (touchFrom - (e.touches[0]?.clientY ?? 0) > 0) e.preventDefault();
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

/**
 * A link is taking you somewhere, so get out of the way.
 *
 * Crossing four stops at once is the thing the arrival pause exists
 * to prevent - when a flick does it by accident. When a nav link does
 * it you asked for it, and a pause that pins the page one section in
 * turns the link into a link to somewhere else. The stage checks this
 * before arming either the pause or the pin.
 */
export function beginJump(ms = 2500) {
  jumpUntil = performance.now() + ms;
  jumpMoved = false;
}

export const isJumping = () => performance.now() < jumpUntil;

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
  else if (jumpMoved) jumpUntil = 0;
}

/** Ignores forward scroll input for `ms`. Programmatic scrolling is untouched. */
export function holdScroll(ms) {
  holdUntil = Math.max(holdUntil, performance.now() + ms);
  if (holding) return;
  holding = true;
  const opts = { capture: true, passive: false };
  for (const type of EVENTS) window.addEventListener(type, swallow, opts);
  const tick = () => {
    if (performance.now() > holdUntil) release();
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
