import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "../lib/cn";

/**
 * A card that turns to follow the pointer, with its contents standing off
 * the surface at different depths.
 *
 * Modelled on Aceternity UI's 3D Card Effect. This is how the portrait
 * stays three-dimensional now that the hero has no WebGL of its own: real
 * perspective, real parallax between the layers, and nothing but two
 * `rotate` values on one element to produce it. A canvas would cost a
 * second GL context on a page that already runs one.
 *
 * Children opt into depth with `[transform:translateZ(Npx)]`; the
 * `transform-style: preserve-3d` on the inner element is what makes that
 * mean anything.
 */
const SPRING = { stiffness: 140, damping: 16, mass: 0.6 };

export default function TiltCard({ children, className, max = 11 }) {
  // The tilt is a JS spring, so the global prefers-reduced-motion rule in
  // index.css - which only touches CSS durations - does not reach it.
  const [still] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const ref = useRef(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // Pointer right tips the right edge away, which is the direction that
  // reads as "turning toward you" rather than as a slab sliding.
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), SPRING);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), SPRING);

  const track = (e) => {
    const b = ref.current?.getBoundingClientRect();
    if (!b || still) return;
    px.set((e.clientX - b.left) / b.width - 0.5);
    py.set((e.clientY - b.top) / b.height - 0.5);
  };

  const rest = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerLeave={rest}
      className={cn("[perspective:1100px]", className)}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}
