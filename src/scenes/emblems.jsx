import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { EMBLEMS } from "../lib/emblemGeometry";

/**
 * The object standing on each roof, saying what the company does.
 *
 * All the shapes are merged into two buffers before they get here - one
 * dull, one lit - so an emblem is two draw calls however many primitives
 * went into it. The only separate meshes are the parts that move: the
 * rain under the cloud and the sweep bar crossing the monitor.
 *
 * It turns slowly on the spot, like something mounted up there to be
 * seen from every side of the block, and breathes a little so it never
 * looks frozen. The materials belong to the building, which lerps them
 * with everything else it owns - so the emblem brightens on hover and
 * drops back when another building is focused.
 */
/** Each shape fills its cube differently, so they are evened out here. */
const SIZE = {
  plane: 1.15,
  cloud: 1.35,
  ward: 1.2,
  chart: 1.05,
  car: 1.2,
  palm: 1.1,
  husky: 1.4,
  cap: 1.15,
};

export default function Emblem({ kind, mats, scale = 1 }) {
  const spin = useRef();
  const fall = useRef();
  const sweep = useRef();

  const built = useMemo(() => EMBLEMS[kind]?.(), [kind]);
  useEffect(
    () => () => {
      if (!built) return;
      for (const g of Object.values(built)) g?.dispose?.();
    },
    [built],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (spin.current) {
      spin.current.rotation.y = t * 0.24;
      spin.current.position.y = Math.sin(t * 0.8) * 0.035;
    }
    // Half a unit of fall, over and over. The drops are staggered inside
    // the bundle, so one translation moves them all without them landing
    // in step.
    if (fall.current)
      fall.current.position.y = -((t * 0.75) % (built.fallSpan ?? 0.5));
    // Clamped to the glass: the bar is built in the screen's own frame,
    // so sliding it along X can never take it off the side of a monitor
    // that has no way to clip.
    if (sweep.current && built.sweepSpan != null) {
      sweep.current.position.x = (((t * 0.45) % 1) * 2 - 1) * built.sweepSpan;
    }
  });

  if (!built) return null;

  return (
    <group ref={spin} scale={scale * (SIZE[kind] ?? 1)}>
      <mesh geometry={built.base} material={mats.base} />
      {built.lit && <mesh geometry={built.lit} material={mats.lit} />}

      {built.fall && (
        <mesh ref={fall} geometry={built.fall} material={mats.lit} />
      )}

      {built.sweep && (
        <group position={built.sweepAt} rotation={built.sweepRot}>
          <mesh ref={sweep} geometry={built.sweep} material={mats.lit} />
        </group>
      )}
    </group>
  );
}
