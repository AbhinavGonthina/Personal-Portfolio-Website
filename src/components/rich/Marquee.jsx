/**
 * A row that drifts sideways forever.
 *
 * Magic UI's Marquee: the children twice over, the pair translated
 * by half its own width, which is why the seam never shows. The
 * animation is a CSS transform on one element, so it runs on the
 * compositor and costs the main thread nothing at all - which is
 * the only reason something that never stops moving is allowed on
 * a page that has a 3D town on the other side of it.
 *
 * Masked to nothing at both ends, so the row reads as a band of
 * movement rather than as a strip with two hard edges.
 */
export default function Marquee({
  children,
  reverse = false,
  speed = 46,
  className = "",
}) {
  return (
    <div
      className={`group relative flex overflow-hidden [--fade:7rem] ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black var(--fade), black calc(100% - var(--fade)), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black var(--fade), black calc(100% - var(--fade)), transparent)",
      }}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 items-center gap-3 pr-3 motion-safe:animate-[drift_var(--run)_linear_infinite] motion-safe:group-hover:[animation-play-state:paused]"
          style={{
            "--run": `${speed}s`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
