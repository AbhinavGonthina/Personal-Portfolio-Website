import { useSyncExternalStore } from "react";

/**
 * Which of the two readings is up, as one answer the whole page asks.
 *
 * Two things decide it and they are not the same kind of thing. One is
 * a preference - "I would rather just read it" - carried in the URL so
 * a plain reading can be linked, and in localStorage so nobody has to
 * say it twice. The other is the window: below a certain width there
 * is no town to show, because the town wants a wide frame, a pointer
 * to look around with and a screen big enough to read a monitor on.
 *
 * The window wins. It used to lose, and that is the bug this file
 * exists to stop repeating: storage was read first, so anyone who had
 * once clicked "Interactive" got the town on a phone, and resizing a
 * desktop window past the threshold left the preference where it was
 * and the canvas mounted underneath a page that had gone plain.
 *
 * Which is the other half of it: this was measured once, at module
 * load, while `Hero` and `Experience` each kept their own live
 * listener on the same query. So dragging a window narrow flipped
 * those two sections to their plain form and left `TownStage` drawing
 * the town behind them - the plain read sitting on top of the 3D
 * world. One source, measured live, and the question cannot be
 * answered two ways at once.
 */
const KEY = "plain-read";
const subscribers = new Set();

/**
 * Below this the plain read is the only reading there is.
 *
 * 1024 rather than 768. The town is not merely cramped on a tablet -
 * the thing you are meant to do at the fourth stop is read a GitHub
 * page on a monitor across a desk, and a monitor rendered 700 pixels
 * wide is a picture of a page rather than a page.
 */
export const NARROW = "(max-width: 1023px)";

/**
 * `?plain=1` forces the plain read, `?plain=0` forces the town even
 * on a narrow window. The second is a way to look at what the town
 * does down there, not something a reader arrives at.
 */
function fromUrl() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("plain");
  if (q === null) return null;
  return q !== "0" && q !== "false";
}

function fromStorage() {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === null ? null : v === "1";
  } catch {
    // Private browsing, or storage blocked. Not worth failing over.
    return null;
  }
}

const forced = fromUrl();
/** The reader's own preference, or null if they have not expressed one. */
let chosen = forced ?? (typeof window === "undefined" ? null : fromStorage());
let narrow =
  typeof window !== "undefined" && window.matchMedia(NARROW).matches;

const resolve = () => (narrow && forced !== false ? true : (chosen ?? false));

let plain = resolve();

const announce = () => subscribers.forEach((fn) => fn());

if (typeof window !== "undefined") {
  const q = window.matchMedia(NARROW);
  q.addEventListener("change", (e) => {
    narrow = e.matches;
    const next = resolve();
    if (next !== plain) {
      plain = next;
      announce();
    }
    // The toggle in the bar appears and disappears with this, so it
    // has to hear about the change even when the reading does not.
    announce();
  });
}

const subscribe = (fn) => {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
};

export function setPlain(next) {
  chosen = next;
  try {
    window.localStorage.setItem(KEY, next ? "1" : "0");
  } catch {
    /* see fromStorage() */
  }
  const url = new URL(window.location.href);
  if (next) url.searchParams.set("plain", "1");
  else url.searchParams.delete("plain");
  window.history.replaceState(null, "", url);

  const resolved = resolve();
  if (resolved === plain) return;
  plain = resolved;
  announce();
}

/** For the switch, which reads it once at load and never renders. */
export const getPlain = () => plain;

/**
 * Whether the window is too small for the town, read without
 * subscribing - for the switch, which has to refuse to run rather
 * than render anything.
 */
export const isNarrow = () => narrow;

export const usePlain = () =>
  useSyncExternalStore(
    subscribe,
    () => plain,
    () => false,
  );

/** For the one control that offers the other reading. */
export const useNarrow = () =>
  useSyncExternalStore(
    subscribe,
    () => narrow,
    () => false,
  );
