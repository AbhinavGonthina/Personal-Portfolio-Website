import { Suspense, lazy, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { useArrived, useHoldsUp, worthIt } from "./webgl";

/**
 * The contour map behind Projects, and everything that decides
 * whether it is there at all.
 *
 * `Topography` is fifty-six kilobytes of WebGL2, which is more
 * than the rest of the rich read put together, so it is behind
 * `lazy` *and* behind an IntersectionObserver: the import does
 * not fire until Projects is a screen away, and a reader who
 * stops at Experience never pays for it.
 *
 * The watchdog's clock starts from the same moment. Starting it
 * at page load would have it measuring a canvas that has not
 * mounted, and then a canvas that is paused off screen, and
 * passing both times.
 */
const Map = lazy(() => import("./Topography"));

export default function Topo() {
  const box = useRef(null);
  const seen = useArrived(box);
  const holds = useHoldsUp(seen);
  const light = useTheme() === "light";
  const still = useReducedMotion();

  const off = still || holds === "off" || !worthIt();

  return (
    // The wrapper is always here, because it is what the observer
    // watches - and it is what clips the canvas to the section, so
    // nothing can add document under the page again.
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {seen && !off && (
        <Suspense fallback={null}>
          <div
            className="size-full transition-opacity duration-500"
            style={{ opacity: holds === "going" ? 0 : light ? 0.5 : 0.65 }}
          >
            <Map
              // The violet the project cards already use for
              // coursework, so the floor belongs to the section
              // standing on it. Daylight takes the mixed version
              // of the same hue rather than the lit one.
              color={light ? "#6a3fbd" : "#8b7bff"}
              lightMode={light}
              // Twenty-two contours is the stock setting and it
              // reads as a map. Fourteen reads as a landscape,
              // which is what is wanted behind six cards - the
              // lines have to stay far enough apart that the eye
              // does not try to follow one of them.
              lineCount={14}
              lineWidth={1}
              // Slow. This is the only moving background on the
              // page and it sits directly under reading matter.
              speed={0.12}
              morph={0.12}
              elevation={0.85}
              tilt={28}
              // No bloom and no depth blur. Both are extra passes
              // over the whole canvas, and both are the soft
              // diffuse look that everything else here was taken
              // off the page for.
              glow={0.12}
              depthOfField={0}
              fog={0.3}
              // The pointer lifts the contours it passes over,
              // which is the whole reason to have a map rather
              // than a picture of one.
              mouseInteraction
              hoverEffect="lift"
              mouseStrength={0.45}
              parallax={0.25}
              // Nothing on click: every click in this section is
              // meant for a card.
              clickEffect="none"
              markers="none"
              // Two thirds of a device pixel, which is the only
              // setting here that matters.
              //
              // This shader is fill-rate bound and almost nothing
              // else about it is: measured on a software
              // rasteriser, turning the bloom off saved 15 per
              // cent, turning the pointer and the detail octaves
              // off saved nothing much, and going from 1.0 to 0.6
              // device pixels took it from 733 ms a frame to 283.
              // The subject is soft contour lines well out of
              // focus behind content, so two thirds of the pixels
              // is a cost cut and not a compromise.
              dpr={0.65}
              className="size-full"
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
