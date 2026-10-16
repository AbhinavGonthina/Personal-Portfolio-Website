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

const nearSubs = new Set();
const nearSub = (fn) => {
  nearSubs.add(fn);
  return () => nearSubs.delete(fn);
};

export const setJourney = (v) => {
  journey = v;
  nearSubs.forEach((fn) => fn());
};
export const getJourney = () => journey;

/**
 * For the few bits of DOM that have to know where the camera is.
 *
 * It is a boolean, not the number: subscribers fire every scroll frame
 * but React bails out unless the answer actually flips, so this costs
 * a comparison rather than a render.
 */
export const useStopIndex = () =>
  useSyncExternalStore(
    nearSub,
    // Rounded, so the title swaps at the midpoint between two stops -
    // which is where the shot has stopped being one place and started
    // being the next.
    () => Math.round(journey),
    () => 0,
  );

export const useJourneyNear = (from, to) =>
  useSyncExternalStore(
    nearSub,
    () => journey >= from && journey <= to,
    () => false,
  );
