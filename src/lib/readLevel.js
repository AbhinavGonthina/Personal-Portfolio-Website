import { useSyncExternalStore } from "react";

/**
 * How much of the simpler read a reader wants.
 *
 * Three settings, and they are not three designs - they are the
 * same information with progressively less around it.
 *
 *   rich  the default, and what leaving the town hands you. Colour,
 *         movement, and the sections laid out to be looked at.
 *   bare  the version this site had before `rich` existed: one
 *         column, no motion, nothing but the words.
 *   raw   the joke at the end of the road. Every stylesheet on the
 *         page is switched off and what is left is the markup, the
 *         way a browser drew documents before anybody styled one.
 *         It is reachable only by asking for it twice.
 *
 * Kept apart from `lib/plain`, which answers a different question -
 * that one is which of the two worlds you are in, this one is how
 * the written world looks once you are in it. A reader who walks
 * into the town and back out again finds the setting they left.
 */
const KEY = "read-level";
const LEVELS = ["rich", "bare", "raw"];
const subscribers = new Set();

function fromUrl() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("read");
  return LEVELS.includes(q) ? q : null;
}

function fromStorage() {
  try {
    const v = window.localStorage.getItem(KEY);
    return LEVELS.includes(v) ? v : null;
  } catch {
    // Private browsing, or storage blocked. Not worth failing over.
    return null;
  }
}

let level =
  fromUrl() ?? (typeof window === "undefined" ? "rich" : (fromStorage() ?? "rich"));

/**
 * Raw has to stand down while the page is travelling between the
 * two worlds.
 *
 * The switch shrinks the page into a frame in the scene, and a page
 * with no stylesheet has nothing to shrink - it would arrive in the
 * frame as a column of browser-default text. So the way out of raw
 * puts the stylesheets back and renders the rich read for the
 * length of the run, while the setting itself stays `raw` so the
 * reader lands back in it on the way home.
 */
let suspended = false;

const announce = () => subscribers.forEach((fn) => fn());

/** What should actually be rendered right now. */
export const getLevel = () => (suspended ? "rich" : level);
/** What the reader last asked for, suspended or not. */
export const getChosen = () => level;

export function setLevel(next) {
  if (!LEVELS.includes(next) || (next === level && !suspended)) return;
  level = next;
  suspended = false;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* see fromStorage() */
  }
  announce();
}

/** Steps between the two readable settings, leaving `raw` alone. */
export const toggleLevel = () => setLevel(level === "bare" ? "rich" : "bare");

export function suspendRaw(on) {
  if (suspended === on) return;
  suspended = on;
  announce();
}

export const useLevel = () =>
  useSyncExternalStore(
    (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    getLevel,
    () => "rich",
  );
