import { useRef } from "react";

/**
 * A card that lights up where the cursor is.
 *
 * Magic UI calls it MagicCard, Aceternity calls it a spotlight
 * card, and both do the same thing: write the pointer's position
 * into two custom properties and let a radial gradient read them.
 * No state, no render - a `mousemove` handler that sets two
 * numbers on a style object, which is why a grid of these costs
 * the same as a grid of plain divs when nobody is touching them.
 */
export default function Glow({
  tint,
  as: Tag = "div",
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);

  const follow = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref}
      onPointerMove={follow}
      className={`group/glow relative overflow-hidden ${className}`}
      style={tint ? { "--tint": tint } : undefined}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/glow:opacity-100"
        style={{
          background:
            "radial-gradient(18rem circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, var(--tint, var(--color-accent)) 22%, transparent), transparent 70%)",
        }}
      />
      {children}
    </Tag>
  );
}
