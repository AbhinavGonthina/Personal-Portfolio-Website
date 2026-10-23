import { memo } from "react";

/**
 * Magic UI's AuroraText.
 *
 *   https://magicui.design/docs/components/aurora-text
 *
 * A gradient twice the width of the box, slid across letters that
 * have been clipped out of it. The whole thing is one background
 * position animating in CSS, so it costs the compositor a texture
 * slide and the main thread nothing.
 *
 * Changed from upstream: TypeScript stripped, the animation moved
 * from a Tailwind utility to `.aurora-run` in `index.css` because
 * this project's Tailwind v4 theme has no `animate-aurora`, and
 * the colours come from the caller rather than from Vercel's
 * pink-to-blue default.
 *
 * The real text is kept in a screen-reader-only span, because the
 * visible copy is transparent fill over a background - a selection,
 * a find-in-page or a reader hitting a `-webkit-text-fill-color:
 * transparent` span gets nothing out of it.
 */
const AuroraText = memo(function AuroraText({
  children,
  className = "",
  colors,
  speed = 1,
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
        aria-hidden
        className="aurora-run relative bg-clip-text text-transparent"
        style={{
          // The first colour again at the end, so the loop closes
          // on itself rather than cutting from violet back to cyan.
          backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          "--aurora-run": `${10 / speed}s`,
        }}
      >
        {children}
      </span>
    </span>
  );
});

export default AuroraText;
