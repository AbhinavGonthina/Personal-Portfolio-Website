import { Suspense, lazy } from "react";
import { useReducedMotion } from "motion/react";
import { edges } from "./Backdrop";
import { useBudget, useSwap, worthIt } from "./webgl";

/**
 * The field lines behind Contact.
 *
 * The last section is the quietest thing on the page - a
 * heading, two lines of type and four buttons - and it was the
 * only one left sitting on flat black. Lines curving between two
 * poles are the one backdrop on offer whose subject is a
 * connection between two things, which is what the section is
 * asking for.
 */
const Field = lazy(() => import("./FluxLines"));

/** The three accents, as everywhere else in the rich read. */
const NIGHT = ["#6fe3f5", "#8fa8ff", "#b48bff"];
const DAY = ["#0e7f94", "#3b55b8", "#6a3fbd"];

export default function Flux() {
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
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      // Faded at the edges, so the section below the contour map
      // begins without a line ruled between the two.
      style={edges()}
    >
      {!off && (
        <Suspense fallback={null}>
          <div
            className="size-full transition-opacity duration-200"
            style={{
              opacity: holds === "going" || hidden ? 0 : light ? 0.5 : 0.62,
            }}
          >
            <Field
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
              colors={light ? DAY : NIGHT}
              lightMode={light}
              // Slow and smooth. This is the last thing on the
              // page and the only moving thing on it; at the
              // stock speed it reads as weather.
              speed={0.22}
              scale={1.5}
              turbulence={0.7}
              fluidity={0.08}
              // Thin, with almost none of the bloom. The glow is
              // what turns a line into a smear, and a smear is
              // the thing this whole page has been taken off.
              lineWidth={1.4}
              glow={1.1}
              shimmer={1}
              flowDirection="down"
              // Still. The dot field used to light up under the
              // cursor and it was taken out for pulling the eye
              // where the reader already is; the same argument
              // applies here, over a section whose whole job is
              // four buttons.
              mouseInteraction={false}
              clickSwirl={false}
              transparent
              dpr={1}
              className="size-full"
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
