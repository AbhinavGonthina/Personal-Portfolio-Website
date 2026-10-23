import { motion, useReducedMotion } from "motion/react";

/**
 * Magic UI's BorderBeam.
 *
 *   https://magicui.design/docs/components/border-beam
 *
 * A short comet of colour travelling around a card's outline. It
 * is one square div following an `offset-path` shaped like the
 * card's own rounded rectangle, with a two-layer mask that keeps
 * the border box and drops the padding box - so the square is only
 * ever visible where it crosses the one-pixel edge.
 *
 * Changed from upstream: TypeScript stripped, `cn` pointed at this
 * project's helper, and it does nothing at all under reduced
 * motion rather than parking the comet at its start offset.
 *
 * This replaces a hand-rolled `.shimmer` in `index.css` that did
 * the same job with an `@property` angle on a conic gradient. The
 * conic version lit the whole edge at a shifting angle; this one
 * is an object with a position, which is what the eye follows.
 */
export default function BorderBeam({
  className = "",
  size = 64,
  delay = 0,
  duration = 7,
  colorFrom = "var(--color-accent)",
  colorTo = "transparent",
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
}) {
  const still = useReducedMotion();
  if (still) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent"
      style={{
        borderWidth,
        // Keep what falls on the border, drop what falls inside
        // it. Two masks intersected, one clipped to each box.
        maskImage:
          "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        WebkitMaskImage:
          "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskClip: "padding-box, border-box",
        WebkitMaskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <motion.div
        className={`absolute aspect-square ${className}`}
        style={{
          width: size,
          // The path is the card's own shape, so the comet turns
          // the corners instead of cutting them.
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
          background: `linear-gradient(to left, ${colorFrom}, ${colorTo})`,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
        }}
      />
    </div>
  );
}
