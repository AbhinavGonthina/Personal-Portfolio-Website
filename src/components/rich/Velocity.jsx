import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

/**
 * Magic UI's ScrollVelocity.
 *
 *   https://magicui.design/docs/components/scroll-based-velocity
 *
 * A row that drifts sideways on its own and then reacts to the
 * page: scroll down and it speeds up, scroll up and it turns
 * round and runs the other way. That coupling is the whole point
 * of it - a band moving at a constant rate is wallpaper, and one
 * that answers the wheel is the page acknowledging you.
 *
 * Changed from upstream: TypeScript stripped, `cn` dropped for
 * plain template strings, and a `fade` prop that masks both ends
 * of the row to nothing so it reads as a band of movement rather
 * than a strip with two hard edges.
 *
 * It replaces a hand-rolled CSS marquee. The cost is real and
 * worth being honest about: this runs a frame callback while it is
 * on screen, where the CSS version ran on the compositor and cost
 * the main thread nothing. What makes it affordable is that the
 * callback is two multiplications, and that upstream already stops
 * it the moment the row leaves the viewport or the tab goes to the
 * background.
 */

const wrap = (min, max, v) => {
  const size = max - min;
  return ((((v - min) % size) + size) % size) + min;
};

/** How fast the page is moving, shared by every row inside. */
const VelocityContext = createContext(null);

const useVelocityFactor = () => {
  const { scrollY } = useScroll();
  const raw = useVelocity(scrollY);
  const smooth = useSpring(raw, { damping: 50, stiffness: 400 });
  return useTransform(smooth, (v) => {
    const sign = v < 0 ? -1 : 1;
    return sign * Math.min(5, (Math.abs(v) / 1000) * 5);
  });
};

/**
 * Wrap two or more rows in this and they share one reading of the
 * scroll. Two rows each with their own spring is two springs
 * settling at slightly different times, which shows.
 */
export function VelocityRows({ children, className = "" }) {
  const factor = useVelocityFactor();
  return (
    <VelocityContext.Provider value={factor}>
      <div className={`relative w-full ${className}`}>{children}</div>
    </VelocityContext.Provider>
  );
}

export function VelocityRow(props) {
  const shared = useContext(VelocityContext);
  const own = useVelocityFactor();
  return <Row {...props} factor={shared ?? own} />;
}

const FADE = "7rem";
const EDGE = `linear-gradient(to right, transparent, black ${FADE}, black calc(100% - ${FADE}), transparent)`;

function Row({
  children,
  baseVelocity = 5,
  direction = 1,
  className = "",
  factor,
  fade = true,
}) {
  const boxRef = useRef(null);
  const blockRef = useRef(null);
  const [copies, setCopies] = useState(1);

  const baseX = useMotionValue(0);
  const home = useRef(direction >= 0 ? 1 : -1);
  const way = useRef(direction >= 0 ? 1 : -1);
  const unit = useMotionValue(0);

  const seen = useRef(true);
  const open = useRef(true);
  const still = useRef(false);

  useEffect(() => {
    const box = boxRef.current;
    const block = blockRef.current;
    if (!box || !block) return;

    const measure = () => {
      const bw = block.scrollWidth || 0;
      unit.set(bw);
      // Enough copies to cover the box twice over, so the row is
      // never short of content at either end of the wrap.
      const want = bw > 0 ? Math.max(3, Math.ceil(box.offsetWidth / bw) + 2) : 1;
      setCopies((was) => (was === want ? was : want));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(block);

    // Nothing moves off screen, and nothing moves in a tab nobody
    // is looking at.
    const io = new IntersectionObserver(([e]) => {
      seen.current = e.isIntersecting;
    });
    io.observe(box);

    const onShow = () => {
      open.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onShow, { passive: true });
    onShow();

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onStill = () => {
      still.current = mq.matches;
    };
    mq.addEventListener("change", onStill);
    onStill();

    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onShow);
      mq.removeEventListener("change", onStill);
    };
  }, [children, unit]);

  const x = useTransform([baseX, unit], ([v, w]) => {
    return `${-wrap(0, Number(w) || 1, Number(v) || 0)}px`;
  });

  useAnimationFrame((_, delta) => {
    if (!seen.current || !open.current) return;
    const vf = factor.get();
    const push = Math.min(5, Math.abs(vf));
    // Somebody who asked for less motion gets the drift and not
    // the reaction to it - the row keeps its place in the design
    // without the page yanking it about.
    const gain = still.current ? 1 : 1 + push;
    if (push > 0.1) way.current = home.current * (vf >= 0 ? 1 : -1);

    const w = unit.get() || 0;
    if (w <= 0) return;
    baseX.set(baseX.get() + way.current * ((w * baseVelocity) / 100) * gain * (delta / 1000));
  });

  return (
    <div
      ref={boxRef}
      className={`w-full overflow-hidden whitespace-nowrap ${className}`}
      style={
        fade
          ? { maskImage: EDGE, WebkitMaskImage: EDGE }
          : undefined
      }
    >
      <motion.div
        className="inline-flex transform-gpu select-none items-center will-change-transform"
        style={{ x }}
      >
        {Array.from({ length: copies }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? blockRef : null}
            aria-hidden={i !== 0}
            className="inline-flex shrink-0 items-center"
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
