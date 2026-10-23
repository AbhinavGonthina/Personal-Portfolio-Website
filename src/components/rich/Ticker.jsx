import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * A figure that counts up to itself when it comes into view.
 *
 * Magic UI's NumberTicker, with the part that matters here kept:
 * the numbers on this page are not all numbers. "$140K", "10 → 4"
 * and "~722M" are the figures worth quoting and none of them
 * parses, so this finds the first run of digits, animates that,
 * and leaves everything around it alone.
 *
 * Written straight to the DOM node rather than through state. A
 * count from 0 to 722 through React is 722 renders of whatever is
 * around it; through `textContent` it is 722 string writes to one
 * text node, which is what the browser was going to do anyway.
 */
const DIGITS = /\d[\d,]*/;

export default function Ticker({ value, className }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const still = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !seen || still) return;
    const m = String(value).match(DIGITS);
    if (!m) return;
    const target = Number(m[0].replace(/,/g, ""));
    if (!Number.isFinite(target) || target === 0) return;

    const grouped = m[0].includes(",");
    const start = performance.now();
    const RUN = 1100;
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / RUN);
      // Eased out hard: a counter that arrives slowly reads as a
      // counter, and one that arrives linearly reads as a stopwatch.
      const n = Math.round(target * (1 - Math.pow(1 - t, 4)));
      el.textContent = String(value).replace(
        DIGITS,
        grouped ? n.toLocaleString() : String(n),
      );
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, still]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
