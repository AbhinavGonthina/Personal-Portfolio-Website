import { useSyncExternalStore } from "react";

/**
 * Whether the town has actually been drawn yet.
 *
 * Mounting the canvas and having something to look at are not the
 * same moment: between them sit the geometry, the canvas textures
 * and a shader compile for every material, and on a cold load that
 * gap is long enough to sit through. It used to be spent looking at
 * black, which is indistinguishable from a page that has broken.
 *
 * The scene reports in from its own frame loop, so this says the
 * picture is up rather than that React thinks it should be.
 */
let ready = false;
const subs = new Set();

const tell = () => subs.forEach((fn) => fn());

export function markReady() {
  if (ready) return;
  ready = true;
  tell();
}

/** The canvas is going away; the next one starts cold again. */
export function clearReady() {
  if (!ready) return;
  ready = false;
  tell();
}

export const useReady = () =>
  useSyncExternalStore(
    (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    () => ready,
    () => false,
  );
