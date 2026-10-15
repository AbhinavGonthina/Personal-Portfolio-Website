import { useSyncExternalStore } from "react";
import { projects } from "../data/projects";

/**
 * Which project is on the monitor in the study.
 *
 * Same reason as the focused building: the screen is painted by a
 * canvas mounted above every section, and the list that drives it is
 * inside the Projects section. Neither owns the state.
 */
const subs = new Set();
let shown = projects[0]?.id ?? null;

const subscribe = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};

export function setShown(id) {
  if (id === shown) return;
  shown = id;
  subs.forEach((fn) => fn());
}

export const useShown = () =>
  useSyncExternalStore(
    subscribe,
    () => shown,
    () => shown,
  );
