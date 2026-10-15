import { cn } from "../lib/cn";

/**
 * A grid receding to a horizon, scrolling slowly toward you.
 *
 * Pitched to match the floor of the Experience skyline rather than the
 * synthwave version this pattern usually is: the same hairline weight,
 * the same near-black grey, and no hard edge anywhere. It is masked out
 * at both ends - at the top so there is no horizon line to cut against,
 * at the bottom so the section ends in the same pure black the next one
 * begins in and the two run together.
 *
 * Costs nothing: one `rotateX` on a static parent and one `translateY`
 * keyframe on the child, both composited. The obvious way to scroll a
 * tiled grid is to animate `background-position`, which repaints the
 * whole element every frame instead.
 */
const FADE =
  "linear-gradient(to bottom, transparent, rgba(0,0,0,0.65) 22%, #000 45%, rgba(0,0,0,0.55) 82%, transparent)";

export default function RetroGrid({ className }) {
  return (
    <div
      aria-hidden
      style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:260px]",
        className,
      )}
    >
      <div className="absolute inset-0 [transform:rotateX(64deg)]">
        <div className="animate-grid [background-image:linear-gradient(to_right,#3a3a3a_1px,transparent_0),linear-gradient(to_bottom,#3a3a3a_1px,transparent_0)] [background-repeat:repeat] [background-size:64px_64px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:200%]" />
      </div>
    </div>
  );
}
