import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { useBudget, worthIt } from "./webgl";

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

/*
 * The device guess, the frame-time watchdog and the `?gl=` escape
 * hatch all live in `./webgl` now, because Projects wants the
 * same three and two copies of a budget is no budget at all.
 */

export default function Ether() {
  const theme = useTheme();
  const still = useReducedMotion();
  const holds = useBudget();
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
