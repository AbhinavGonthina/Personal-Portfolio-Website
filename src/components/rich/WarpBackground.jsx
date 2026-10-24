import { useCallback, useMemo } from "react";
import { motion } from "motion/react";

import { cn } from "../../lib/cn";

/**
 * Magic UI's Warp Background, adapted.
 *
 *   https://magicui.design/docs/components/warp-background
 *
 * Four copies of a grid, each rotated ninety degrees out of the
 * page and pushed through a `perspective`, so the top of the box
 * folds away from you and the sides fold inward: a tunnel, drawn
 * entirely in CSS gradients. Coloured bars travel up each plane
 * and inherit the fold, so they appear to come at you.
 *
 * Taken from its registry rather than installed, like everything
 * else here. Its only dependency is `motion`, which this site
 * already uses, and there is no canvas and no WebGL in it - the
 * whole thing is four background gradients and a handful of
 * transformed divs, which is why it is affordable where a shader
 * is not.
 *
 * Changed from upstream:
 *
 * - TypeScript stripped and `cn` repointed.
 *
 * - The wrapper no longer draws itself. Upstream's outer div is
 *   `rounded border p-20`, because the component is documented as
 *   a card you put content inside. Here it is a backdrop with no
 *   children, and a rounded bordered box with five rem of padding
 *   around the whole section is exactly the panel-floating-in-
 *   the-page look the rest of these backgrounds were built to
 *   avoid.
 *
 * - The beams are no longer a rainbow. Upstream gives each one
 *   `Math.random() * 360` degrees of hue, which on a page with
 *   one accent reads as a screensaver. `hues` is a range, and it
 *   defaults to the same 190-290 the vortex under Experience
 *   runs through: the site's cyan at one end, its violet at the
 *   other.
 *
 * - `beamAlpha` and `beamLength` are new, and both are here to
 *   keep the bars behind the reading rather than over it.
 *
 * - Each beam's hue and length are decided once, alongside its
 *   position and delay, instead of inside `Beam` on every render.
 *   Upstream rolls both in the child's body, so any re-render of
 *   the parent - a theme change, a resize, anything - restyles
 *   every bar mid-flight and the colours jump.
 */

const Beam = ({ width, x, delay, duration, hue, ar, alpha }) => (
  <motion.div
    style={{
      "--x": `${x}`,
      "--width": `${width}`,
      "--aspect-ratio": `${ar}`,
      "--background": `linear-gradient(hsl(${hue} 80% 60% / ${alpha}), transparent)`,
    }}
    className="absolute top-0 left-(--x) aspect-[1/var(--aspect-ratio)] w-(--width) [background:var(--background)]"
    initial={{ y: "100cqmax", x: "-50%" }}
    animate={{ y: "-100%", x: "-50%" }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

export const WarpBackground = ({
  children,
  perspective = 100,
  className,
  beamsPerSide = 3,
  beamSize = 5,
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  hues = [190, 290],
  beamAlpha = 1,
  // How long a beam is, as a multiple of its width. Upstream
  // rolls 1 to 10, and a 1 is a square: at a beam width of a
  // twentieth of the wall that is a slab the size of a card,
  // which is a shape crossing the page rather than light
  // travelling up it.
  beamLength = [4, 12],
  gridColor = "var(--border)",
  ...props
}) => {
  // Destructured before the callback below, not inside it: an
  // array literal is a new object every render, so a range
  // passed inline as a prop would change the callback's identity
  // every time and reshuffle every beam mid-flight.
  const [loHue, hiHue] = hues;
  const [shortest, longest] = beamLength;

  const generateBeams = useCallback(() => {
    const beams = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;

    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      const hue = Math.floor(loHue + Math.random() * (hiHue - loHue));
      const ar = Math.floor(shortest + Math.random() * (longest - shortest));
      beams.push({ x, delay, hue, ar });
    }
    return beams;
  }, [
    beamsPerSide,
    beamSize,
    beamDelayMax,
    beamDelayMin,
    loHue,
    hiHue,
    shortest,
    longest,
  ]);

  const topBeams = useMemo(() => generateBeams(), [generateBeams]);
  const rightBeams = useMemo(() => generateBeams(), [generateBeams]);
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
  const leftBeams = useMemo(() => generateBeams(), [generateBeams]);

  const side = (beams, where) =>
    beams.map((beam, index) => (
      <Beam
        key={`${where}-${index}`}
        width={`${beamSize}%`}
        x={`${beam.x * beamSize}%`}
        delay={beam.delay}
        duration={beamDuration}
        hue={beam.hue}
        ar={beam.ar}
        alpha={beamAlpha}
      />
    ));

  return (
    <div className={cn("relative", className)} {...props}>
      <div
        style={{
          "--perspective": `${perspective}px`,
          "--grid-color": gridColor,
          "--beam-size": `${beamSize}%`,
        }}
        className="@container-[size] pointer-events-none absolute top-0 left-0 size-full overflow-hidden [clipPath:inset(0)] perspective-(--perspective) transform-3d"
      >
        {/* top side */}
        <div className="@container absolute z-20 h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {side(topBeams, "top")}
        </div>
        {/* bottom side */}
        <div className="@container absolute top-full h-[100cqmax] w-[100cqi] origin-[50%_0%] transform-[rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {side(bottomBeams, "bottom")}
        </div>
        {/* left side */}
        <div className="@container absolute top-0 left-0 h-[100cqmax] w-[100cqh] origin-[0%_0%] transform-[rotate(90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {side(leftBeams, "left")}
        </div>
        {/* right side */}
        <div className="@container absolute top-0 right-0 h-[100cqmax] w-[100cqh] origin-[100%_0%] transform-[rotate(-90deg)_rotateX(-90deg)] bg-size-[var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,var(--grid-color)_0_1px,transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] transform-3d">
          {side(rightBeams, "right")}
        </div>
      </div>
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
};
