import { useEffect } from "react";

/**
 * Pins the page while something has taken over the view.
 *
 * The camera is driven by scroll position, so scrolling while a
 * building is open would walk the shot away from the thing you are
 * reading about. Locking the body is the honest fix: the page cannot
 * move until you come back out to the skyline.
 *
 * The padding compensates for the scrollbar the lock removes. Without
 * it the whole layout jumps a dozen pixels left the moment you click a
 * building, and again when you leave.
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
