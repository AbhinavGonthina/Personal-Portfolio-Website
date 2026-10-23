import { useSyncExternalStore } from "react";
import { getPlain } from "./plain";

/**
 * Which of the two palettes is up, as one answer the whole site asks.
 *
 * Built the same way as `lib/plain`, and for the same reason: the
 * question is asked from the DOM, from a frame loop that never
 * renders, and from code that paints canvas textures. A module value
 * with subscribers answers all three; React context answers only the
 * first.
 *
 * The town is the hard half. It was composed as a night scene - black
 * sky, dense fog, neon on dark, bloom over the top - and none of that
 * is a colour you can invert. Day is a second art direction rather
 * than a filter, so what this store carries is a name, and every
 * place that cares keeps its own two sets of values.
 */
const KEY = "theme";
const subscribers = new Set();

/** Reflected onto the document so plain CSS can answer the question too. */
function apply(next) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = next;
  // So form controls, scrollbars and the browser's own chrome follow.
  document.documentElement.style.colorScheme = next;
}

function fromUrl() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("theme");
  return q === "light" || q === "dark" ? q : null;
}

function fromStorage() {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    // Private browsing, or storage blocked. Not worth failing over.
    return null;
  }
}

function fromSystem() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** Null until somebody chooses, so the system can keep being asked. */
let chosen =
  fromUrl() ?? (typeof window === "undefined" ? null : fromStorage());
let theme = chosen ?? fromSystem();
apply(theme);

const announce = () => subscribers.forEach((fn) => fn());

function settle(next) {
  if (next === theme) return;
  theme = next;
  apply(next);
  announce();
}

if (typeof window !== "undefined") {
  // Only while nobody has chosen. Once they have, the site stops
  // changing under them because they moved a slider in the OS.
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", () => {
      if (chosen === null) settle(fromSystem());
    });
}

/**
 * Whether a change of palette is still being applied.
 *
 * In the plain read there is nothing to apply - the tokens swap
 * and the browser repaints. In the town there is: four geometries
 * carry the palette in their vertices and have to be rebuilt, six
 * canvas textures have to be repainted, and all of it has to go
 * back to the GPU. That is about a tenth of a second of blocked
 * main thread on a fast machine and noticeably more on a slow one,
 * and a page that stops dead for that long with no explanation
 * reads as a bug.
 *
 * So the work is held back by a frame. The flag goes up, the
 * browser gets one frame to paint something that says so, and the
 * palette lands on the frame after that. It costs one frame and
 * turns a freeze into a wait.
 */
let busy = false;
const busySubs = new Set();
export const useThemeBusy = () =>
  useSyncExternalStore(
    (fn) => {
      busySubs.add(fn);
      return () => busySubs.delete(fn);
    },
    () => busy,
    () => false,
  );

function setBusy(v) {
  if (v === busy) return;
  busy = v;
  busySubs.forEach((fn) => fn());
}

export function setTheme(next) {
  chosen = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* see fromStorage() */
  }
  if (next === theme) return;

  // Nothing heavy behind the plain read, so it swaps on the click.
  if (getPlain() || typeof requestAnimationFrame !== "function") {
    settle(next);
    return;
  }

  setBusy(true);
  requestAnimationFrame(() => {
    // One frame later: the flag has been painted, so the stall
    // that follows has something on screen to explain it.
    settle(next);
    requestAnimationFrame(() => setBusy(false));
  });
}

export const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

/**
 * Subscribe without rendering.
 *
 * The town's palette is not markup - it is three.js materials, a
 * background colour, light intensities and a bloom setting, none
 * of which React owns. They are rebuilt from a listener here
 * rather than from a component, so there is no question of which
 * runs first on the frame the theme changes.
 */
export function onTheme(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** Read in frame loops and by the painters. Never subscribes. */
export const getTheme = () => theme;
export const isLight = () => theme === "light";

export const useTheme = () =>
  useSyncExternalStore(
    (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    () => theme,
    () => "dark",
  );
