import { Suspense, lazy, useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";

/**
 * The fluid behind the first screen, and everything that decides
 * whether it is there at all.
 *
 * `LiquidEther` is twenty-seven kilobytes of WebGL2 that nobody
 * reading the bare read, the raw read or the town should ever
 * download, so it comes in through `lazy` and the import only
 * fires for a reader who is actually looking at the rich landing.
 * There is no fallback: the first screen already has two washes
 * and a dot field under the type, so the half second before the
 * fluid arrives is the page as it was, not a hole in it.
 */
const Fluid = lazy(() => import("./LiquidEther"));

/**
 * Three colours, because the palette is interpolated between the
 * stops and two of them is a gradient rather than a fluid.
 *
 * Night takes the site's own three accents - the cyan that marks
 * links, the violet the hero's second wash already throws in from
 * the right, and a blue between them to stop the two ends meeting
 * as magenta.
 *
 * Day is not the night set lightened. Fluid on white is read as
 * ink in water, so these are the same three hues at the strength
 * they would be if they had been mixed rather than lit, and the
 * component's own `lightMode` handles how they are composited.
 */
const NIGHT = ["#6fe3f5", "#5b8cff", "#b48bff"];
const DAY = ["#0e7f94", "#3b55b8", "#6a3fbd"];

/**
 * Whether this machine should be asked to run a fluid solve at
 * all.
 *
 * Two questions, both answered once and neither of them a
 * benchmark. A coarse pointer means there is no cursor to push
 * the fluid with, so the interaction the effect exists for cannot
 * happen - and it is a phone, which is where a full-screen shader
 * behind a first screen is least affordable and most likely to be
 * read on a battery. Four cores or fewer is the same judgement
 * made about a laptop.
 *
 * Deliberately crude. The alternative is measuring frame times
 * and tearing the canvas down mid-visit, and a background that
 * disappears while somebody is looking at it is worse than one
 * that was never there.
 */
/**
 * `?fluid=1` to insist, `?fluid=0` to refuse. The first is how
 * this gets photographed at all - the render harness runs a
 * headless browser with no GPU, where the watchdog is quite right
 * to pull the canvas and the screenshot comes back without it.
 * The second is for anyone who simply does not want it.
 */
const forced = () => {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("fluid");
  return v === null ? null : v !== "0";
};

function worthIt() {
  if (typeof window === "undefined") return false;
  const said = forced();
  if (said !== null) return said;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  // Two cores or fewer only. This used to be four, which rules
  // out a great many perfectly capable laptops; the watchdog
  // below is the real test, and this is just for the machines
  // where even finding that out is not worth a WebGL context.
  const cores = navigator.hardwareConcurrency;
  return !cores || cores > 2;
}

/** How long the watchdog waits, samples for, and will tolerate. */
const SETTLE = 2800;
const SAMPLE = 70;
const BUDGET = 30;

/**
 * The watchdog.
 *
 * `worthIt` is a guess made from two numbers the browser hands
 * over, and a guess is not a measurement. This is the measurement:
 * once the fluid has been up long enough for its own two-second
 * intro to finish, count seventy frames. If the middle one took
 * longer than thirty milliseconds the page is not holding sixty,
 * and on this page the only thing that could be responsible is the
 * fluid - everything else was measured at seventeen.
 *
 * It fades rather than vanishes, and it never comes back. A
 * background that blinks out while somebody is reading is worse
 * than one that was never there; a background that leaves over
 * half a second is a thing that finished.
 */
function useHoldsUp() {
  const [state, setState] = useState("on");

  useEffect(() => {
    if (forced() !== null) return;
    let raf = 0;
    let gone = false;
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
        gaps.sort((a, b) => a - b);
        if (!gone && gaps[Math.floor(SAMPLE / 2)] > BUDGET) setState("going");
      };
      raf = requestAnimationFrame(tick);
    }, SETTLE);

    return () => {
      gone = true;
      clearTimeout(start);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (state !== "going") return;
    const t = setTimeout(() => setState("off"), 600);
    return () => clearTimeout(t);
  }, [state]);

  return state;
}

export default function Ether() {
  const theme = useTheme();
  const still = useReducedMotion();
  const holds = useHoldsUp();
  const light = theme === "light";

  // The component honours the setting on its own, by drawing one
  // still frame and stopping. That is a WebGL context and a fluid
  // solve to produce a picture that could have been a gradient, so
  // somebody who asked for less motion gets none of it instead.
  if (still || holds === "off" || !worthIt()) return null;

  return (
    <Suspense fallback={null}>
      <div
        className="size-full transition-opacity duration-500"
        style={{ opacity: holds === "going" ? 0 : 1 }}
      >
        <Fluid
          colors={light ? DAY : NIGHT}
          lightMode={light}
          // Four tenths. The field is blurred by its own advection,
          // so the solve runs at a sixth of the pixels and nothing
          // about the result looks softer for it. This is the single
          // biggest lever on what the effect costs.
          resolution={0.32}
          // Colour that stays put. At the stock 0.75 the field
          // dissipated faster than the slow drift could fill it and
          // the landing came out grey; what makes this read as ink
          // in water rather than as a gradient is that a swirl is
          // still there a few seconds after it was made.
          persistence={0.95}
          // Daylight needs less, but not as much less as it looks.
          // On black the colour is the only thing in the frame; on
          // white it is competing with the page, and under-driving
          // it there turned the hues to smoke. What keeps the type
          // readable under both is the layer's own opacity, which
          // the hero sets, not this.
          intensity={light ? 2.2 : 3}
          mouseForce={16}
          cursorSize={110}
          // It moves on its own when nobody is pointing at it, which
          // is what makes it a background rather than a toy.
          autoDemo
          autoSpeed={0.9}
          autoIntensity={5}
          // No burst on click. Every click on this screen is meant
          // for a button or a link, and answering one with a splash
          // of colour says the background was the thing clicked.
          clickBurst={false}
          // Capped at 1, not the component's 2. The fluid is a
          // full-screen solve, so a retina display would be asking
          // for four times the work to put more detail into something
          // that is deliberately out of focus.
          maxDevicePixelRatio={1}
          className="size-full"
        />
      </div>
    </Suspense>
  );
}
