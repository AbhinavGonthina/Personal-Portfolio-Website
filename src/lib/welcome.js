import { useSyncExternalStore } from "react";

/**
 * Whether the sign has finished falling.
 *
 * The drop is driven inside the canvas off accumulated delta, so the
 * frame loop is the only thing that knows when it is over. The hint
 * that stands under it waits on this rather than on a timer set to
 * roughly the same length: a timer is right until the tab spends two
 * seconds in the background, and then the instruction turns up before
 * the word it is meant to follow.
 */
let landed = false;
const subs = new Set();

export function markLanded() {
  if (landed) return;
  landed = true;
  subs.forEach((fn) => fn());
}

export const useWelcomeLanded = () =>
  useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => landed,
    () => false,
  );
