import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "../../lib/theme";

/**
 * What the written read is allowed to spend on a GPU, shared by
 * the four backgrounds that want one.
 *
 * The plain read was deliberately built with no WebGL in it at
 * all - that is where the entry bundle went from 1.3 MB to 430 KB
 * - so anything that opens a context has to answer for itself.
 * Three things do the answering: a guess made before mounting, a
 * measurement taken after, and an override for when a human knows
 * better than both.
 */

/**
 * `?gl=0` refuses every WebGL background, `?gl=1` insists on them.
 *
 * The second is not a convenience. The render harness runs a
 * headless browser with no GPU, where a full-screen shader is
 * rasterised on the CPU and the watchdog below is quite right to
 * pull the canvas - so without this, none of these can be
 * photographed at all.
 *
 * `?fluid=` is still read, because that is what this was called
 * when the landing was the only thing using it.
 */
export const forced = () => {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search);
  const v = q.get("gl") ?? q.get("fluid");
  return v === null ? null : v !== "0";
};

/**
 * The guess, made from two numbers the browser hands over.
 *
 * A coarse pointer means there is no cursor to push these with,
 * so the interaction half of them cannot happen - and it is a
 * phone, which is where a full-screen shader is least affordable
 * and most likely to be read on a battery. Two cores or fewer is
 * the same judgement made about a very old laptop; it is a low
 * bar on purpose, because the measurement below is the real test
 * and this only exists for the machines where finding out is not
 * worth a context.
 */
export function worthIt() {
  if (typeof window === "undefined") return false;
  const said = forced();
  if (said !== null) return said;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  const cores = navigator.hardwareConcurrency;
  return !cores || cores > 2;
}

/**
 * The measurement, and there is exactly one of it for the page.
 *
 * This used to be a hook with its own timer per background, and
 * that was a bug rather than a design. Each copy started counting
 * 2.8 seconds after its own component woke up, so the landing's
 * sampled while the page was still loading fonts and compiling
 * the other three shaders, and Contact's sampled while the
 * contour map directly above it was at full tilt. Both read a
 * slow page, both concluded they were the cause, and both
 * switched themselves off for good. The reported symptom was
 * exactly that: the landing and the contact backgrounds
 * disappearing after a while.
 *
 * So: one timer, started the first time anything asks, long
 * enough after load that every shader has compiled and finished
 * its intro, sampling longer and tolerating more. If the page
 * cannot hold a frame by then, it is the page and not whichever
 * component happened to look at the clock.
 */
const SETTLE = 7000;
const SAMPLE = 120;
const BUDGET = 42;

let state = "on";
const watching = new Set();
let started = false;

const tell = () => watching.forEach((fn) => fn());

function measure() {
  if (started || forced() !== null) return;
  started = true;

  setTimeout(() => {
    const gaps = [];
    let last = performance.now();
    const tick = (now) => {
      // A frame nobody saw is not evidence. Tabs in the
      // background are throttled to one frame a second, which
      // would fail any budget ever written.
      if (document.visibilityState !== "visible") {
        last = now;
        requestAnimationFrame(tick);
        return;
      }
      gaps.push(now - last);
      last = now;
      if (gaps.length < SAMPLE) {
        requestAnimationFrame(tick);
        return;
      }
      gaps.sort((a, b) => a - b);
      if (gaps[Math.floor(SAMPLE / 2)] > BUDGET) {
        state = "going";
        tell();
        // Faded rather than vanished, and never back. A
        // background that blinks out while somebody is reading is
        // worse than one that was never there; one that leaves
        // over half a second is a thing that finished.
        setTimeout(() => {
          state = "off";
          tell();
        }, 600);
      }
    };
    requestAnimationFrame(tick);
  }, SETTLE);
}

/**
 * Every WebGL background subscribes to the same answer, so they
 * go together or not at all. Three of four surviving a test the
 * fourth failed was never a state worth having.
 */
export function useBudget() {
  measure();
  return useSyncExternalStore(
    (fn) => {
      watching.add(fn);
      return () => watching.delete(fn);
    },
    () => state,
    () => "on",
  );
}

/**
 * The theme, handed over late and behind a curtain.
 *
 * Every one of these backgrounds takes a `lightMode` flag and a
 * set of colours, and changing either tears the shader down and
 * builds it again. Four of them doing that in the same frame is
 * what made the day/night toggle lurch: measured at 400 to 1170
 * milliseconds for the worst frame of a switch, against 150 to
 * 220 with the backgrounds turned off.
 *
 * None of that can be made free - the shaders genuinely have to
 * be rebuilt - but it can be moved out from under the one
 * moment somebody is watching. The layer fades out first, the
 * colours change while it is invisible and the page's own
 * transition is doing the work the eye is following, and it
 * comes back when the rebuild is over.
 *
 * `hidden` is the opacity to apply; `theme` is the one to build
 * with. The wait is a little longer than the 250ms the page's
 * own colour transition takes, so the rebuild lands after it
 * rather than during it.
 */
const BLIND = 260;

export function useSwap() {
  const live = useTheme();
  const [theme, setTheme] = useState(live);
  const [hidden, setHidden] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (theme === live) return;
    if (first.current) {
      first.current = false;
      setTheme(live);
      return;
    }
    setHidden(true);
    const swap = setTimeout(() => setTheme(live), BLIND);
    // Long enough after the swap for the rebuild to have
    // finished; coming back while it is still compiling would
    // show the hitch it is there to hide.
    const show = setTimeout(() => setHidden(false), BLIND + 420);
    return () => {
      clearTimeout(swap);
      clearTimeout(show);
    };
  }, [live, theme]);

  return { theme, hidden };
}
