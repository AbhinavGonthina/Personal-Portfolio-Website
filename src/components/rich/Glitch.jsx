import { Suspense, lazy, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "../../lib/theme";
import { useArrived, useHoldsUp, worthIt } from "./webgl";

/**
 * The character field behind Skills.
 *
 * Every setting here is an argument for being quiet. A wall of
 * flickering letters is the loudest background in any of these
 * libraries, and the section it sits under already has five
 * tinted cards, two drifting bands and thirty-two coloured tags
 * on it. The brief was a background, not a second thing to look
 * at, so almost nothing is left at its stock value.
 */
const Field = lazy(() => import("./LetterGlitch"));

/**
 * Three of the site's accents and nothing else.
 *
 * Upstream ships a green-amber-cyan terminal set. On this page
 * that would be a fourth palette arriving in the fourth section,
 * so these are the hues the skill cards above already wear.
 */
const NIGHT = ["#6fe3f5", "#8fa8ff", "#b48bff"];
const DAY = ["#0e7f94", "#3b55b8", "#6a3fbd"];

/**
 * One device pixel, and not the display's own - but that is not
 * where the cost of this lives, and it is worth writing down
 * which dial actually moved it.
 *
 * At twelve-pixel glyphs packed at 0.95 spacing this measured
 * 1795 ms a frame on a software rasteriser, which made it by far
 * the most expensive thing on the page. Halving the device pixels
 * changed nothing at all: 1923 ms, inside the noise. The cost is
 * per glyph, not per pixel. Going to sixteen pixels at 1.25
 * spacing with half the cells empty took it to 17 ms - a hundred
 * times cheaper, from three numbers that also happen to make it
 * read as a texture rather than as a terminal somebody left on.
 *
 * `dpr` stays at 1 because at a tenth opacity the sharpness
 * cannot be seen either way, and it is free to leave it there.
 */
const DPR = 1;

export default function Glitch() {
  const box = useRef(null);
  const seen = useArrived(box);
  const holds = useHoldsUp(seen);
  const light = useTheme() === "light";
  const still = useReducedMotion();

  const off = still || holds === "off" || !worthIt();

  return (
    <div
      ref={box}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {seen && !off && (
        <Suspense fallback={null}>
          <div
            className="size-full transition-opacity duration-500"
            // The single biggest dial on how much this intrudes,
            // and it is deliberately low. Much above a quarter and
            // the letters start to read as content - the eye goes
            // looking for words in them instead of past them.
            style={{ opacity: holds === "going" ? 0 : light ? 0.5 : 0.58 }}
          >
            <Field
              glitchColors={light ? DAY : NIGHT}
              lightMode={light}
              // Big, widely spaced, and half of the cells empty.
              //
              // These three are the whole performance story - see
              // `DPR` above - and they are also the whole look.
              // Small characters packed tight read as a terminal
              // somebody left running, which is a thing to look
              // at; large ones with room between them read as a
              // surface, which is a thing to look past.
              fontSize={16}
              spacing={1.25}
              density={0.55}
              // How bright a character is before it glitches, and
              // how often one does. Both well under stock: most of
              // the field should be sitting still at any moment.
              baseOpacity={0.32}
              glitchAmount={0.4}
              speed={0.55}
              flow={0.25}
              // Neither fade. Both were on, and between them they
              // squeezed the field into a band across the middle
              // of the section - which is precisely where the
              // cards are, so the one part of Skills that was
              // already full was the only part with anything
              // behind it, and the empty top and bottom stayed
              // empty. A background covers its section or it is
              // not a background. What keeps it off the content
              // is the opacity, which is a flat amount
              // everywhere, not a shape.
              edgeFade={0}
              centerFade={0}
              // The cursor does not disturb it.
              //
              // It did, and a background that answers you is
              // usually worth having - but this one answers in
              // the one way that pulls the eye off the thing in
              // front of it. A patch of characters lighting up
              // and scrambling under the pointer is movement
              // exactly where the reader is already looking,
              // which is the opposite of what a background is
              // for. It is a surface now and nothing else.
              interactive={false}
              // Nothing on click. Every click in this section is
              // meant for a tag or a card.
              clickEffect="none"
              dpr={DPR}
              className="size-full"
            />
          </div>
        </Suspense>
      )}
    </div>
  );
}
