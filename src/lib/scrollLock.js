import { useEffect } from "react";

/**
 * Two ways of stopping the page, because they are stopping it for
 * different reasons.
 *
 * `useScrollLock` is indefinite and airtight: the body stops being
 * scrollable at all. That is what a focused building needs, since the
 * page must not move until you come back out.
 *
 * `holdScroll` is a short pause that still lets the page be scrolled
 * in code. It cancels the input instead of the overflow, which is the
 * only way to park the scroll exactly on a stop while the user is
 * mid-fling - with overflow hidden, scrollTo does nothing.
 */

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
]);

let holdUntil = 0;
let holding = false;

const swallow = (e) => {
  if (performance.now() > holdUntil) return;
  if (e.type === "keydown" && !SCROLL_KEYS.has(e.key)) return;
  e.preventDefault();
};

function release() {
  if (!holding) return;
  holding = false;
  window.removeEventListener("wheel", swallow, { capture: true });
  window.removeEventListener("touchmove", swallow, { capture: true });
  window.removeEventListener("keydown", swallow, { capture: true });
}

/** Ignores scroll input for `ms`, leaving programmatic scrolling alone. */
export function holdScroll(ms) {
  holdUntil = Math.max(holdUntil, performance.now() + ms);
  if (holding) return;
  holding = true;
  const opts = { capture: true, passive: false };
  window.addEventListener("wheel", swallow, opts);
  window.addEventListener("touchmove", swallow, opts);
  window.addEventListener("keydown", swallow, opts);
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
