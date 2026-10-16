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

function wanted() {
  if (typeof window === "undefined") return false;
  // `?arrive=1` forces it, which is the only sane way to work on a
  // sequence that by design runs once and then never again.
  const q = new URLSearchParams(window.location.search).get("arrive");
  if (q !== null) return q !== "0";
  try {
    return window.sessionStorage.getItem(KEY) !== "1";
  } catch {
    // Private browsing, or storage blocked. Play it; it is three
    // seconds and the alternative is never playing it at all.
    return true;
  }
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
