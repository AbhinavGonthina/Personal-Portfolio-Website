import { useRef } from "react";

/**
 * Aceternity's TextHoverEffect, as it has to be done here.
 *
 *   https://ui.aceternity.com/components/text-hover-effect
 *
 * Point at a heading and colour shows through the letters where
 * the cursor is, moving with it.
 *
 * Upstream draws this as an SVG: outlined `<text>` at 50% / 50%
 * of a fixed `viewBox`, with a second copy stroked in a gradient
 * and masked to a radial blob that follows the pointer. That
 * works for one enormous centred word on a hero and does not
 * survive contact with these headings, which are left aligned,
 * set in a web font, sized against the viewport and sitting in a
 * row beside a number. An SVG `viewBox` cannot be any of those
 * things without being measured every resize.
 *
 * So this is the same effect taken as a technique rather than as
 * a file: the gradient is a background, the letters are clipped
 * out of it, and the pointer moves the gradient's centre.
 *
 * The other departure matters more. Upstream's heading is an
 * outline at rest and fills in on hover, which is beautiful on a
 * landing page and wrong for a section heading somebody is trying
 * to read. Here the real `<h2>` is untouched and solid, and the
 * coloured copy sits over it and fades in. Nothing is harder to
 * read than it was, and nothing moves if you never point at it.
 */
export default function HoverText({ children, className = "", colors }) {
  const ref = useRef(null);

  const follow = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--hy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const stops = colors.join(", ");

  return (
    <span
      ref={ref}
      onPointerMove={follow}
      className={`group/ht relative inline-block ${className}`}
    >
      {children}
      {/* The same words again, in colour, clipped to a blob under
          the cursor. `aria-hidden` and not selectable: it is one
          word said twice and only one of them is the heading. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none bg-clip-text text-transparent opacity-0 transition-opacity duration-300 group-hover/ht:opacity-100"
        style={{
          backgroundImage: `radial-gradient(14rem circle at var(--hx, 50%) var(--hy, 50%), ${stops}, transparent 70%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {children}
      </span>
    </span>
  );
}
