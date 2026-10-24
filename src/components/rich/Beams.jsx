import { Suspense, lazy } from "react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * The beams behind Experience.
 *
 * Twenty-five long curves sweeping across the section, each lit
 * by a gradient travelling along it in one of the site's five
 * accents.
 *
 * No GPU, so none of the WebGL budget applies - no device
 * check, no watchdog, and `?gl=0` leaves it alone. What it does
 * cost is twenty-five animated gradients on the main thread,
 * which is why it is half the set upstream draws.
 */
const Art = lazy(() => import("./BackgroundBeams"));

export default function Beams() {
  const theme = useTheme();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden text-ink-700"
      // Vertical fade only, like every other backdrop: the beams
      // run to the left and right edges of the window and
      // dissolve at the section's top and bottom.
      style={edges()}
    >
      <Suspense fallback={null}>
        <Art theme={theme} />
      </Suspense>
    </div>
  );
}
