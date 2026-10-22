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
  // Only when it has actually moved, which is what `setSeen` below
  // has always done. The page reader calls this every frame of the
  // visit, and each call walked a set of eight or so subscribers
  // and made React compare a snapshot for each one - sixty times a
  // second to be told nothing had changed.
  if (v === journey) return;
  journey = v;
  nearSubs.forEach((fn) => fn());
};
export const getJourney = () => journey;

/**
 * Where the camera is along the walk, which is not the same number.
 *
 * It was, until the camera got a pace of its own and a way to skip
 * the house on a link. Anything that appears or disappears because
 * of where the camera is has to ask this and not `journey`: gating
 * the floor on the scroll while the camera lagged a segment behind
 * it is a floor that vanishes from under a camera still standing
 * on it.
 */
let seen = 0;
export const setSeen = (v) => {
  if (v === seen) return;
  seen = v;
  // Told, not polled. The camera can move while the page is still -
  // a paced approach does exactly that - so anything watching the
  // camera cannot wait for the next scroll event to hear about it.
  nearSubs.forEach((fn) => fn());
};
export const getSeen = () => seen;

/** The same as `useJourneyNear`, for the camera rather than the page. */
export const useSeenNear = (from, to) =>
  useSyncExternalStore(
    nearSub,
    () => seen >= from && seen <= to,
    () => false,
  );

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
