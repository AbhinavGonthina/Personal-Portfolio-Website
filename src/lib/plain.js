import { useSyncExternalStore } from "react";

/**
 * "Prefer a more straightforward read?" - a site-wide preference for the
 * plain version of a section over its interactive one.
 *
 * Kept in a module-level store rather than React context because it is read
 * in a handful of unrelated places and never needs to be scoped. The URL
 * carries it so a plain reading can be linked and shared, and localStorage
 * remembers it so nobody has to ask twice.
 *
 * Right now only the Experience section honours it: the skyline is replaced
 * by the grouped list that narrow screens already get. The other sections
 * have no separate plain form yet, so they render as they always do.
 */
const KEY = "plain-read";
const subscribers = new Set();

/** Below this, the town does not get built at all. */
export const NARROW = "(max-width: 767px)";

function initial() {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("plain");
  if (q !== null) return q !== "0" && q !== "false";
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved !== null) return saved === "1";
  } catch {
    // Private browsing, or storage blocked. Not worth failing over.
  }
  // On a phone this is the site, not a fallback from it. The town
  // wants a wide frame, a pointer to look around with and a GPU to
  // draw it; a row of towers squeezed into a portrait viewport is a
  // row of specks. An explicit choice, in the URL or in storage,
  // still wins over this.
  return window.matchMedia(NARROW).matches;
}

let plain = initial();

const subscribe = (fn) => {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};

export function setPlain(next) {
  if (next === plain) return;
  plain = next;
  try {
    window.localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    /* see initial() */
  }
  const url = new URL(window.location.href);
  if (next) url.searchParams.set("plain", "1");
  else url.searchParams.delete("plain");
  window.history.replaceState(null, "", url);
  subscribers.forEach((fn) => fn());
}

export const getPlain = () => plain;

export const usePlain = () =>
  useSyncExternalStore(
    subscribe,
    () => plain,
    () => false,
  );
