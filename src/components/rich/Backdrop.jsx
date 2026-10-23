import { useEffect, useRef } from "react";

/**
 * What goes behind a section so it is not sitting on a flat sheet.
 *
 * Two pieces, both of them paint-only: a dot field, which is one
 * repeating radial gradient rather than Magic UI's SVG full of
 * <circle> elements, and a wash of the section's own colour coming
 * in from one corner. Neither animates and neither is an element
 * the reader can hit, so the cost is one extra layer to composite
 * and nothing per frame.
 *
 * Both are feathered to nothing at the edges of the section they
 * sit in. This is the whole reason either of them is bearable: a
 * section boundary is an invisible line in the middle of a page,
 * and a pattern or a glow that is simply clipped by it draws that
 * line - the reader sees a rectangle of tint ending in mid-air,
 * which is the opposite of the job. The point is that the page
 * stops being empty, not that it gains a box.
 */

/**
 * The edge fade. A fixed length rather than a percentage, because
 * a percentage of a tall section is a 300px smear and a percentage
 * of a short one is nothing - the softness wants to be the same
 * handful of centimetres everywhere.
 */
const FEATHER = "7rem";

const edges = (feather = FEATHER) => {
  const band = (dir) =>
    `linear-gradient(to ${dir}, transparent, black ${feather}, black calc(100% - ${feather}), transparent)`;
  const image = `${band("right")}, ${band("bottom")}`;
  return {
    maskImage: image,
    WebkitMaskImage: image,
    // Both layers have to agree for a pixel to survive, so the
    // four edges come off rather than the mask simply being the
    // brighter of the two bands everywhere.
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
};

const GRID = {
  backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/**
 * The dot field, twice: once as the floor, and once in the accent
 * through a circle that follows the cursor.
 *
 * The second copy is the reason the page has somewhere for the eye
 * to rest while it reads. A field of grey dots is scenery; the same
 * field lighting up around the pointer is the page noticing you,
 * and it does it in every section at once so the whole written read
 * behaves the same way rather than having one clever section.
 *
 * It costs a `pointermove` handler on the section and two custom
 * properties written on a div. No state, so React never renders;
 * no frame loop, so nothing runs when the pointer is still; and the
 * browser only dispatches the event to the section the cursor is
 * actually over, so a page with five of these has one of them
 * working at a time.
 *
 * The listener goes on the parent rather than here, because this
 * layer takes no pointer events - it sits behind the text and
 * taking them would mean nothing on top of it could be clicked.
 */
export function Dots({ className = "", tint = "var(--color-accent)" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!host) return;

    const move = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--dx", `${e.clientX - r.left}px`);
      el.style.setProperty("--dy", `${e.clientY - r.top}px`);
      el.style.setProperty("--lit", "1");
    };
    const out = () => el.style.setProperty("--lit", "0");

    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", out, { passive: true });
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", out);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 ${className}`}
      style={edges()}
    >
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{ ...GRID, color: "var(--color-ink-700)" }}
      />
      {/* The same grid, in the accent, shown only through a circle
          at the pointer. Three hundred pixels across, which is wide
          enough to read as the page lighting up and not as a torch
          being shone at it. */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          ...GRID,
          color: tint,
          opacity: "calc(var(--lit, 0) * 0.85)",
          maskImage:
            "radial-gradient(150px circle at var(--dx, -999px) var(--dy, -999px), black, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(150px circle at var(--dx, -999px) var(--dy, -999px), black, transparent 70%)",
        }}
      />
    </div>
  );
}

/** A soft bloom of one colour, thrown in from a corner. */
export function Wash({
  tint = "var(--color-accent)",
  at = "18% 0%",
  size = "62% 70%",
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: `radial-gradient(${size} at ${at}, color-mix(in oklab, ${tint} 26%, transparent), transparent 70%)`,
        ...edges(),
      }}
    />
  );
}

/**
 * The pair, as one thing, for a section that just wants a floor.
 * `relative` is the caller's job, because the caller owns the box.
 */
export default function Backdrop({ tint, at, size }) {
  return (
    <>
      <Dots />
      <Wash tint={tint} at={at} size={size} />
    </>
  );
}
