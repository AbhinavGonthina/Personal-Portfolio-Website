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
 * The padding compensates for the scrollbar the lock removes. Without
 * it the whole layout jumps a dozen pixels sideways on the way in and
 * again on the way out.
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;
    const body = document.body;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
    };
  }, [locked]);
}
