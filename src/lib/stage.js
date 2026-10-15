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
 * `progress` is deliberately a plain value with its own subscriber list
 * rather than part of the React store: the scene reads it every frame
 * and must never cause a render.
 */
const focusSubs = new Set();
let focused = null;
let progress = 0;

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

/** 0 at the top of the hero, 1 once the skyline fills the viewport. */
export const setProgress = (v) => {
  progress = v;
};
export const getProgress = () => progress;
