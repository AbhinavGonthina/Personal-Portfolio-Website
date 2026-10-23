import { useRef } from "react";

/**
 * Aceternity's GlowingEffect, on a card.
 *
 *   https://ui.aceternity.com/components/glowing-effect
 *
 * An arc of colour lights up on the card's edge, on the side the
 * cursor is on, and swings round the outline as the cursor moves.
 * The mask does all of it: a conic gradient opaque for a few
 * degrees either side of `--start`, intersected with a second
 * mask that keeps the border box and drops the padding box. The
 * CSS is `.glow-ring` in `index.css`.
 *
 * This replaced a radial smudge painted inside the card, which
 * was the same gesture said in fill rather than in line - and
 * this site is drawn in line.
 *
 * Changed from upstream, and the change is the reason it is
 * affordable: Aceternity keeps a `pointermove` listener on
 * `document.body` for every instance, and measures a rect inside
 * each one. On a page with seventeen cards that is seventeen
 * global listeners and seventeen layout reads per mouse move.
 * Here the angle is written by the card's own pointer handler,
 * which the browser only dispatches to the card under the cursor,
 * so one card does the work and the other sixteen do none.
 *
 * What that costs: a card no longer begins to glow as you
 * approach it, only once you are over it. In a grid where the
 * cards touch, you are over one of them almost all the time
 * anyway.
 */
export default function Glow({
  tint,
  ring,
  on = true,
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
    // Degrees from the card's centre to the pointer, turned a
    // quarter so that zero is the top edge rather than the right.
    const deg =
      (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) *
        180) /
        Math.PI +
      90;
    // Unwrapped against the last value, so a cursor crossing the
    // top of the card takes the short way round instead of
    // spinning the whole ring to get from 179 to -179.
    const was = Number(el.style.getPropertyValue("--start")) || 0;
    el.style.setProperty("--start", String(was + ((((deg - was + 180) % 360) + 360) % 360) - 180));
  };

  const light = (lit) => () => {
    ref.current?.style.setProperty("--ring-on", lit ? "1" : "0");
  };

  // Nothing at all in the bare read: no class, no handlers, no
  // custom properties. The caller still wraps its card in this
  // rather than branching on the markup, so there is one card and
  // not two that have to be kept in step.
  if (!on) {
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      onPointerMove={follow}
      onPointerEnter={light(true)}
      onPointerLeave={light(false)}
      className={`glow-ring relative ${className}`}
      style={{
        // Three stops around the ring. Given one tint it is that
        // colour throughout; given a set it reads as a sweep.
        "--ring-a": ring?.[0] ?? tint ?? "var(--color-accent)",
        "--ring-b": ring?.[1] ?? tint ?? "var(--color-accent)",
        "--ring-c": ring?.[2] ?? tint ?? "var(--color-accent)",
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
