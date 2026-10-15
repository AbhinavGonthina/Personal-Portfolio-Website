import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";

/**
 * Wraps a 3D scene so it costs nothing until it is worth paying for.
 *
 * Three guards, and all three matter:
 *
 * - The module is code-split, so three.js and @react-three/fiber are not in
 *   the initial bundle. Someone who never scrolls here never downloads them.
 * - It only mounts once the section is near the viewport, and the scene's
 *   render loop is told to stop the moment it leaves. An idle canvas still
 *   runs a loop otherwise, which is what makes several 3D sections on one
 *   page untenable.
 * - Anyone who asked the OS to calm animations gets no canvas at all.
 */
export default function SceneSlot({ load, className, ...props }) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);
  const [Scene, setScene] = useState(null);
  const [still] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (still || !ref.current) return;
    const el = ref.current;
    // Two observers: a generous one to decide when to download and mount,
    // a tight one to decide when to actually render frames.
    const mount = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "400px" },
    );
    const run = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      threshold: 0,
    });
    mount.observe(el);
    run.observe(el);
    return () => {
      mount.disconnect();
      run.disconnect();
    };
  }, [still]);

  useEffect(() => {
    if (near && !Scene) setScene(() => lazy(load));
  }, [near, Scene, load]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      {Scene && (
        <Suspense fallback={null}>
          {/* pointer-events back on for the canvas itself, so towers stay
              clickable while the wrapper keeps out of the text's way. */}
          <div className="pointer-events-auto absolute inset-0">
            <Scene active={active} {...props} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
