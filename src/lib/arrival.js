import { useSyncExternalStore } from "react";

/**
 * Whether the arrival sequence is running.
 *
 * Once per session, not once per page load: a refresh while you are
 * reading the skills board should not put you back in the car. It
 * lives outside React because the camera rig reads it every frame and
 * the DOM reads it to know whether to lock the page.
 */
const KEY = "arrived";
const subs = new Set();

/**
 * Off by default, for now.
 *
 * The sequence drives the camera correctly - the keyframes, the
 * clock and the handover to the scroll rig are all verified - but
 * the car itself is not drawing, so what you actually get is eight
 * seconds parked inside an invisible car with the page locked. That
 * is a far worse first visit than no sequence at all, so until the
 * car renders it only runs when asked for by hand.
 *
 * Everything else about it is wired and working: `?arrive=1` plays
 * it, the Skip works, the page locks and unlocks, and the session
 * flag is set at the end.
 */
function wanted() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("arrive");
  return q !== null && q !== "0";
}

let playing = wanted();

const subscribe = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};

export function endArrival() {
  if (!playing) return;
  playing = false;
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* see wanted() */
  }
  subs.forEach((fn) => fn());
}

export const isArriving = () => playing;

export const useArriving = () =>
  useSyncExternalStore(
    subscribe,
    () => playing,
    () => false,
  );
