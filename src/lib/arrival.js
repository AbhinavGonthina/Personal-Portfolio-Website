import { useSyncExternalStore } from "react";
import { getPlain } from "./plain";

/**
 * Whether the arrival sequence is running.
 *
 * It lives outside React because the camera rig reads it every frame
 * and the DOM reads it to know whether to lock the page.
 */
const KEY = "arrived";
const subs = new Set();

/**
 * Once per session, not once per page load.
 *
 * A refresh while you are reading the skills board should not put you
 * back in the car, so the flag is written to sessionStorage when the
 * sequence finishes. `?arrive=1` replays it anyway, and `?arrive=0`
 * skips it.
 */
function wanted() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("arrive");
  if (q !== null) return q !== "0";
  try {
    return window.sessionStorage.getItem(KEY) !== "1";
  } catch {
    // Private browsing, or storage turned off. Playing it again is a
    // better failure than never playing it.
    return true;
  }
}

/**
 * `?arrive=1&at=5` holds the sequence at five seconds instead of
 * playing it, which is the only practical way to look hard at one
 * beat of an eight second shot - or to screenshot it.
 */
export function frozenAt() {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("at");
  const n = Number(v);
  return v !== null && Number.isFinite(n) ? n : null;
}

/**
 * Not if the page opened on the plain read.
 *
 * The arrival is how you first see the town, and someone who has
 * arrived at the plain read has not seen it - but they also did not
 * ask to. Left armed, it sat waiting through the whole plain
 * session and then played underneath the switch the moment they
 * went looking for the town: eight seconds in a car, under a crane
 * shot, with the page pinned the whole time. A phone gets the plain
 * read by default, so this is most of the people who ever meet it.
 */
let playing = wanted() && !getPlain();

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
