import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { useBudget, useSwap, worthIt } from "./webgl";
import { edges } from "./edges";

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

/** The display's own resolution, capped. Contours are thin. */
const sharp = () =>
  Math.min(
    typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    1.5,
  );

export default function Topo() {
  // Mounted with the page, not when the section arrives.
  //
  // It used to wait for an IntersectionObserver, which saved the
  // download for a reader who never scrolled this far and cost
  // everybody else a shader compiling under them mid-scroll. The
  // compile is the expensive part and it is much better spent at
  // load, with everything else that happens at load, than as a
  // hitch while somebody is reading. The component stops its own
  // loop while it is off screen either way, so nothing is
  // running down here until it is looked at.
  const holds = useBudget();
  const { theme, hidden } = useSwap();
  const light = theme === "light";
  const still = useReducedMotion();

  const off = still || holds === "off" || !worthIt();

  return (
    // The wrapper is always here, because it is what the observer
    // watches - and it is what clips the canvas to the section, so
    // nothing can add document under the page again.
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      // Faded at the edges, like the dot field has always been.
      // Without this the contour map stopped dead on the section
      // boundary - a ruled horizontal line with one background
      // above it and a different one below, which is the one
      // place a background announces itself.
      style={edges()}
    >
      {!off && (
        <Suspense fallback={null}>
          <div
            className="size-full transition-opacity duration-200"
            style={{
              opacity: holds === "going" || hidden ? 0 : light ? 0.5 : 0.65,
            }}
          >
            <Map
              // No intro.
              //
              // Each of these pauses itself while it is off
              // screen, so its two-second reveal does not run at
              // load - it runs the moment the section arrives,
              // which is indistinguishable from the background
              // still loading. Preloading the shader fixed the
              // download and not this. Below the fold a backdrop
              // should simply be there when you get to it.
              intro={false}
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
              // The display's own resolution, capped at 1.5.
              //
              // This shader is fill-rate bound and almost nothing
              // else about it is, so `dpr` is the only dial worth
              // turning - which is why it was set to 0.65, and
              // why that was wrong. A contour is a one-pixel
              // line. Rendered at a third of the screen's
              // resolution it does not come out softer, it comes
              // out as a staircase, and the whole section read as
              // a low-quality image. Thin lines are the one
              // subject that cannot be under-sampled.
              //
              // 1.5 rather than the component's own cap of 2,
              // because cost goes with the square of this and 2
              // is four times the work of 1 for something that is
              // still a background. The watchdog takes it away if
              // the page cannot hold sixty.
              dpr={sharp()}
              className="size-full"
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
