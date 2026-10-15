import { useSyncExternalStore } from "react";

/**
 * Which role the skyline is focused on, and how far down the street the
 * camera has travelled.
 *
 * These live outside React because one WebGL canvas now spans two
 * sections. The canvas is mounted at the top of the tree, the detail
 * panel that drives it is inside Experience, and the scroll that moves
 * the camera is read by neither - threading that through App would make
 * three components share state that none of them owns.
 *
 * `journey` is deliberately a plain value with no subscribers at all:
 * the scene reads it every frame and must never cause a render. It is
 * the camera's position along the page, measured in stops - 0 at the
 * landing shot, 1 at the hoarding, 2 in the middle of the skyline, and
 * so on, with the fraction between two whole numbers being how far the
 * camera has walked from one to the next.
 */
const focusSubs = new Set();
let focused = null;
let journey = 0;

const subscribe = (fn) => {
  focusSubs.add(fn);
  return () => focusSubs.delete(fn);
};

export function setFocused(next) {
  if (next === focused) return;
  focused = next;
  focusSubs.forEach((fn) => fn());
}

export const useFocused = () =>
  useSyncExternalStore(
    subscribe,
    () => focused,
    () => null,
  );

export const setJourney = (v) => {
  journey = v;
};
export const getJourney = () => journey;
