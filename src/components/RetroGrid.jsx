import { cn } from "../lib/cn";

/**
 * A grid receding to a horizon, scrolling toward you.
 *
 * Modelled on Magic UI's RetroGrid. It is here rather than installed
 * because it is twenty lines, and because the point is to echo the floor
 * of the Experience skyline exactly - same hairline weight, same colour.
 *
 * Costs nothing: one `rotateX` on a static parent and one `translateY`
 * keyframe on the child, both composited. The obvious way to scroll a
 * tiled grid is to animate `background-position`, which repaints the
 * whole element every frame instead.
 */
export default function RetroGrid({ className }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:220px]",
        className,
      )}
    >
      <div className="absolute inset-0 [transform:rotateX(62deg)]">
        <div className="animate-grid [background-image:linear-gradient(to_right,rgba(255,255,255,0.22)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.22)_1px,transparent_0)] [background-repeat:repeat] [background-size:64px_64px] [height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:200%]" />
      </div>
      {/* Fades the floor out *toward* the horizon, which after the
          rotateX is the top edge - so black at the top, clear underfoot.
          The obvious direction hides the near grid and shows the far one,
          which is exactly backwards. */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/55 via-55% to-black" />
    </div>
  );
}
