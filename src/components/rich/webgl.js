import { useEffect, useRef, useState } from "react";

/**
 * What the written read is allowed to spend on a GPU, shared by
 * the two backgrounds that want one.
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

/** How long the watchdog waits, samples for, and will tolerate. */
const SETTLE = 2800;
const SAMPLE = 70;
const BUDGET = 30;

/**
 * The measurement.
 *
 * Once the thing has been running long enough for its own intro
 * to finish, count seventy frames. If the middle one took longer
 * than thirty milliseconds the page is not holding sixty, and on
 * this page the only thing that could be responsible is the
 * shader - everything else was measured at seventeen.
 *
 * It fades rather than vanishes, and it never comes back. A
 * background that blinks out while somebody is reading is worse
 * than one that was never there; a background that leaves over
 * half a second is a thing that finished.
 *
 * `ready` is when to start counting. For the landing that is
 * straight away, because it is the first thing on the page. For
 * anything further down it is the moment the section arrives on
 * screen, because a shader that is paused off screen will of
 * course pass a test taken while it is paused.
 */
export function useHoldsUp(ready = true) {
  const [state, setState] = useState("on");
  const done = useRef(false);

  useEffect(() => {
    if (!ready || done.current || forced() !== null) return;
    let raf = 0;
    const start = setTimeout(() => {
      const gaps = [];
      let last = performance.now();
      const tick = (now) => {
        gaps.push(now - last);
        last = now;
        if (gaps.length < SAMPLE) {
          raf = requestAnimationFrame(tick);
          return;
        }
        done.current = true;
        gaps.sort((a, b) => a - b);
        if (gaps[Math.floor(SAMPLE / 2)] > BUDGET) setState("going");
      };
      raf = requestAnimationFrame(tick);
    }, SETTLE);

    return () => {
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, [ready]);

  useEffect(() => {
    if (state !== "going") return;
    const t = setTimeout(() => setState("off"), 600);
    return () => clearTimeout(t);
  }, [state]);

  return state;
}

/**
 * True once the element has been on screen, and true for good
 * afterwards.
 *
 * Both of these backgrounds stop their own loop when they leave
 * the viewport, so this is not about pausing - it is about not
 * downloading or compiling a shader for a section the reader may
 * never reach, and about not starting the watchdog's clock
 * against a canvas that is not drawing.
 */
export function useArrived(ref, margin = "400px") {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver !== "function") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      // A screenful of warning, so the shader is compiled and the
      // intro under way by the time the section is actually read.
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, seen, margin]);

  return seen;
}
