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
 * It is a second and not a moment longer. An earlier version kept
 * the hold up until forward input had stopped arriving, to swallow
 * the tail of a trackpad flick - and it worked, but it also meant
 * that anyone who simply kept scrolling kept being refused, which
 * is a far worse thing to do to a reader than let them travel a
 * little further than they meant to. What happens during the second
 * is thrown away rather than queued; what happens after it is
 * theirs.
 */

const FORWARD_KEYS = new Set(["ArrowDown", "PageDown", "End", " ", "Spacebar"]);
const BACK_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

let holdUntil = 0;
let holding = false;
let touchFrom = 0;

/** Whether the pause is still standing. */
const stillHeld = () => performance.now() <= holdUntil;

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
  // Backward is never held: the pause is there to stop you
  // overshooting what you have just arrived at, not to trap you in
  // it.
  if (!forward) return;
  if (stillHeld()) e.preventDefault();
};

const EVENTS = ["wheel", "touchstart", "touchmove", "keydown"];

function release() {
  if (!holding) return;
  holding = false;
  for (const type of EVENTS) {
    window.removeEventListener(type, swallow, { capture: true });
  }
}

/** Drops the pause now, rather than letting it run out. */
export function endHold() {
  holdUntil = 0;
  release();
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
  // Whatever is already moving, stop it here.
  //
  // A second link clicked while the first one's smooth scroll is
  // still travelling is somebody changing their mind, and the new
  // destination has to win. Issuing another smooth scroll is not
  // enough to make that happen reliably: the browser is already
  // animating this box, and which of the two it honours depends on
  // how busy the main thread is - during the walk it is busy
  // enough that the first one routinely finished first, so the
  // page arrived where you had stopped wanting to go and only then
  // set off for where you did.
  //
  // An instant scroll to where the page already is cancels the
  // animation without moving anything, so the caller's own scroll,
  // one line later, starts from a standstill and is the only one
  // running.
  window.scrollTo({ top: window.scrollY, behavior: "instant" });
  jumpUntil = performance.now() + ms;
  jumpMoved = false;
  jumpDest = to;
  // And the pause goes with it.
  //
  // `holdScroll` pins the page for a second after every arrival, to
  // stop the momentum behind a flick carrying you through the
  // section you have just reached. A link clicked inside that
  // second is not momentum - it is somebody asking to be somewhere
  // else - and the pin does not know the difference: it reads the
  // new position as an overshoot and drags the page back to where
  // you were, which looks like the link firing and then being
  // undone.
  //
  // The stage checks `isJumping()` before *arming* a pin, so a link
  // never creates one. This is the other half: a link also clears
  // whichever one is already standing.
  endHold();
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
