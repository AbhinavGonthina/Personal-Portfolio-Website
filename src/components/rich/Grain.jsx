import { useTheme } from "../../lib/theme";

/**
 * Grain over the whole window.
 *
 * The page used to sit on a field of dots, and that went because
 * it is what OnTrack's interface is drawn on. This is what is
 * underneath instead, and it is deliberately not a pattern: a
 * pattern has a rhythm, and a rhythm is a thing the eye can
 * follow and get caught on. Grain has none. It stops a dark panel
 * reading as a hole in the screen and it cannot compete with the
 * contour lines, the character field or the field lines, because
 * there is nothing in it to compete with.
 *
 * Fixed to the viewport, not to the document. Grain that scrolls
 * with the page reads as texture printed on the content; grain
 * that stays put reads as the surface the content is being shown
 * on, which is the thing being imitated. It also means there is
 * exactly one of these for the whole site rather than one per
 * section, and no seams anywhere.
 *
 * One `feTurbulence` rasterised once into a 160px tile and
 * repeated. No JavaScript, no frame loop, no element per speck -
 * the browser draws it the way it draws any other background
 * image, and it is the only thing added to this page in a week
 * that costs nothing at all.
 */

/**
 * `stitchTiles` is what makes it tile without a visible grid of
 * seams; three octaves is enough structure to read as grain
 * rather than as television static.
 */
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E";

export default function Grain() {
  const light = useTheme() === "light";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        backgroundImage: `url("${NOISE}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "160px 160px",
        // The tile is grey noise, so the blend decides which way
        // it goes: on black it has to add light to be seen at all,
        // and on white it has to take light away.
        mixBlendMode: light ? "multiply" : "screen",
        // Measured rather than guessed. At 0.09 this lifted flat
        // black from 0 to a median of 9 out of 255, which is
        // real - it is there in a screenshot - and under what a
        // person sees on a normal display in a normally lit room.
        // At 0.2 the same patch sits around 20, which is a tooth
        // you can see without it ever becoming a thing you look
        // at. Daylight takes less, because dark specks on white
        // carry much further than light specks on black.
        opacity: light ? 0.12 : 0.2,
      }}
    />
  );
}
