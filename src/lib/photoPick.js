import { useSyncExternalStore } from "react";
import { profile } from "../data/profile";

/**
 * Try a photo on the hoarding without rebuilding anything.
 *
 * A comparison tool, not a feature. Press 1 to 5 and the portrait on
 * the board changes; 5 is the one the site actually ships. Seeing a
 * picture at the size it will really be, behind a lit frame, in a
 * black town, settles an argument that no amount of looking at the
 * file in a viewer will.
 *
 * Only on a machine you are developing on. The key handler is not
 * registered anywhere else, so a stranger pressing 2 on the live
 * site changes nothing - and the four candidates are not even
 * fetched there, because the loader is handed one url instead of
 * five.
 */
export const PICKING =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

/** In the order they are keyed. The last is what the site ships. */
export const PICKS = [
  { key: 1, src: "/try/1.png", note: "yellow, hair right" },
  { key: 2, src: "/try/2.png", note: "blue, hair right" },
  { key: 3, src: "/try/3.png", note: "blue, hair left" },
  { key: 4, src: "/try/4.png", note: "yellow, hair left" },
  { key: 5, src: profile.photo, note: "current" },
];

const LIVE = PICKS.length - 1;

let pick = LIVE;
const subs = new Set();

if (PICKING) {
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // Not while somebody is typing into something.
    const t = e.target;
    if (
      t instanceof HTMLElement &&
      (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA")
    ) {
      return;
    }
    const n = Number(e.key);
    if (!Number.isInteger(n) || n < 1 || n > PICKS.length) return;
    if (n - 1 === pick) return;
    pick = n - 1;
    subs.forEach((fn) => fn());
  });
}

export const usePick = () =>
  useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => pick,
    () => LIVE,
  );
