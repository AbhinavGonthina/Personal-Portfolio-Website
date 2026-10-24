import { Suspense, lazy } from "react";
import { useTheme } from "../../lib/theme";
import { edges } from "./Backdrop";

/**
 * The drawing lines behind Experience.
 *
 * Twenty-one curves that draw themselves down the section, each
 * in one of the site's five accents and each on its own clock.
 *
 * This is the fourth thing tried behind this section, and the
 * first that is neither a grid nor a shader. The three before it
 * failed on the same fact in different ways: Experience is four
 * and a half thousand pixels tall, which makes a full-height
 * shader five times the cost of a screenful and makes any
 * repeating texture read as wallpaper. SVG paths have no such
 * problem - the geometry is the same twenty-one curves whatever
 * height they are stretched over, and long vertical sweeps are
 * the one shape that suits a tall section rather than fighting
 * it.
 *
 * No GPU, so none of the WebGL budget applies: no device check,
 * no watchdog, `?gl=0` does not turn it off. What it does cost
 * is twenty-one animated paths on the main thread, which is why
 * it is drawn once rather than the twice upstream ships.
 */
const Art = lazy(() => import("./BackgroundLines"));

export default function Lines() {
  const theme = useTheme();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      // Only the vertical fade, like every other backdrop: the
      // lines run to the left and right edges of the window and
      // dissolve at the section's top and bottom.
      style={edges()}
    >
      {/* Held well back. These are saturated colours on long
          strokes, and the section they are behind is eight
          hundred words of reading. */}
      <div className="size-full opacity-[0.62]">
        <Suspense fallback={null}>
          <Art theme={theme} duration={9} />
        </Suspense>
      </div>
    </div>
  );
}
