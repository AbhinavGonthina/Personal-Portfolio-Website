import { memo } from "react";

/**
 * Magic UI's Ripple.
 *
 *   https://magicui.design/docs/components/ripple
 *
 * Concentric rings going out from the middle, each one a little
 * fainter and a little later than the one inside it.
 *
 * It sits behind the last section, which is the one asking
 * somebody to get in touch, and the reason it belongs there is
 * that it is the only backdrop on the page that means something:
 * rings going outward from the invitation towards the four ways
 * of answering it. It replaced a soft bloom of accent which meant
 * nothing and looked like a thumbprint on the screen.
 *
 * Eight divs with a border, and nothing moving.
 *
 * They did pulse, a two per cent swell running out through them
 * on a stagger, and it was lovely and it cost thirty milliseconds
 * a frame. Eight animated layers up to seven hundred pixels
 * across is five million pixels to blend every frame for a thing
 * nobody was going to look directly at. The rings are structure
 * now and the four travelling lights on the buttons are the
 * motion; the section has plenty without this one as well.
 *
 * Changed from upstream: the animation dropped as above,
 * TypeScript stripped, the filled
 * `bg-foreground/25` dropped so the rings are outlines and
 * nothing else - a disc behind text is the blur all over again -
 * the colour moved onto the accent, and the mask changed from a
 * fade downwards to a fade outwards, because here the middle is
 * the thing and upstream's hero had the rings coming up from the
 * floor.
 */
const OUT = "radial-gradient(78% 78% at 50% 50%, black, transparent 100%)";

const Ripple = memo(function Ripple({
  first = 220,
  step = 78,
  rings = 8,
  className = "",
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 select-none ${className}`}
      style={{ maskImage: OUT, WebkitMaskImage: OUT }}
    >
      {Array.from({ length: rings }, (_, i) => {
        const size = first + i * step;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full border border-accent/55"
            style={{
              width: size,
              height: size,
              // Each ring a little fainter than the one inside it,
              // so the set reads as one thing going out rather
              // than as eight circles.
              opacity: 0.8 - i * 0.07,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
});

export default Ripple;
