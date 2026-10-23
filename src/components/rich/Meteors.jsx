import { useMemo } from "react";
import { useTheme } from "../../lib/theme";

/**
 * Magic UI's Meteors.
 *
 *   https://magicui.design/docs/components/meteors
 *
 * Streaks crossing the section on a diagonal, each one a bright
 * head with a tail drawn out behind it. A line with a direction,
 * which is what the last section of the page wanted: it is the
 * one asking somebody to get in touch, and everything else on it
 * is sitting still.
 *
 * It replaced a set of concentric rings, which were the right
 * idea and the wrong object - eight layers seven hundred pixels
 * across cost thirty milliseconds a frame to composite, for a
 * shape nobody looks at directly. A meteor is one pixel and a
 * gradient, and there are a dozen of them.
 *
 * Changed from upstream: TypeScript stripped; the positions are
 * worked out once from a seed rather than from `Math.random` in
 * an effect, so they do not move on every render and do not need
 * state to hold them; `window.innerWidth` is gone with it, which
 * was placing meteors against the viewport inside a box that is
 * not the viewport; and the colour comes from the caller instead
 * of a hard-coded zinc.
 */
const seeded = (seed) => {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** The same five hues the lit grid cells and the skill cards use. */
const HUES = {
  dark: ["#6fe3f5", "#8fa8ff", "#b48bff", "#6bd99a", "#ffb86b"],
  light: ["#0e7f94", "#3b55b8", "#6a3fbd", "#1d7a4c", "#a0621a"],
};

export default function Meteors({
  count = 12,
  tints,
  seed = "meteors",
  className = "",
}) {
  const theme = useTheme();
  const hues = tints ?? HUES[theme] ?? HUES.dark;

  const shower = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      tint: hues[i % hues.length],
      // Started off the left as well as across the top, so the
      // left-hand third of the section is not permanently empty.
      left: `${rand() * 118 - 18}%`,
      top: `${rand() * 40 - 30}%`,
      run: 4.5 + rand() * 6,
      // Short enough that a few are always crossing. At nine
      // seconds the section was empty more often than not.
      wait: rand() * 5,
      tail: 120 + Math.round(rand() * 150),
    }));
  }, [count, seed, hues]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {shower.map(({ left, top, run, wait, tail, tint }, i) => (
        <span
          key={i}
          className="absolute size-[3px] rotate-[218deg] rounded-full motion-safe:animate-[fall_var(--run)_linear_var(--wait)_infinite] motion-reduce:opacity-0"
          style={{
            left,
            top,
            background: tint,
            "--run": `${run}s`,
            "--wait": `${wait}s`,
            boxShadow: `0 0 7px 1px color-mix(in oklab, ${tint} 55%, transparent)`,
          }}
        >
          {/* The tail, drawn backwards from the head along the
              same angle. A pseudo-element would need a class per
              length; this is one gradient on a box. */}
          <span
            className="absolute right-0 top-1/2 h-[1.5px] -translate-y-1/2"
            style={{
              width: tail,
              background: `linear-gradient(to left, ${tint}, transparent)`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
