import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ACCENT } from "../lib/townMaterials";
import { rnd } from "../lib/geo";

/**
 * Dust in the air.
 *
 * One Points object for the whole town - a few hundred specks that
 * drift up and wrap around, tinted from the same four accents as
 * everything else. It is the cheapest thing in the scene and it does
 * more for the emptiness than any amount of geometry: a black gap
 * between two buildings reads as a void, and the same gap with
 * something slowly moving in it reads as air.
 *
 * Positions are updated on the CPU because at this count that is a
 * few hundred float writes a frame, and it saves shipping a shader
 * for one effect.
 */
const COUNT = 420;
const SPAN = 64;
const HIGH = 13;

function makeSprite() {
  const S = 64;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.5)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function Motes() {
  const points = useRef();

  const { geometry, sprite, drift } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const spd = new Float32Array(COUNT);
    const hues = [ACCENT.cyan, ACCENT.blue, ACCENT.violet, ACCENT.amber].map(
      (h) => new THREE.Color(h),
    );
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (rnd(i, 12.9) - 0.5) * SPAN * 1.6;
      pos[i * 3 + 1] = rnd(i, 78.2) * HIGH;
      pos[i * 3 + 2] = (rnd(i, 37.7) - 0.5) * SPAN;
      // Mostly white, occasionally one of the accents - a field of
      // evenly coloured specks reads as confetti.
      const c = hues[i % hues.length]
        .clone()
        .lerp(new THREE.Color("#ffffff"), 0.55 + rnd(i, 4.4) * 0.4);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      spd[i] = 0.12 + rnd(i, 11.1) * 0.3;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geometry: geo, sprite: makeSprite(), drift: spd };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      sprite.dispose();
    },
    [geometry, sprite],
  );

  useFrame((state, delta) => {
    const arr = geometry.attributes.position.array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < COUNT; i++) {
      const y = i * 3 + 1;
      arr[y] += drift[i] * delta;
      if (arr[y] > HIGH) arr[y] -= HIGH;
      // A slow sideways wander, so they do not all rise in parallel.
      arr[i * 3] += Math.sin(t * 0.3 + i) * delta * 0.06;
    }
    geometry.attributes.position.needsUpdate = true;
    if (points.current) points.current.rotation.y = t * 0.004;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.09}
        map={sprite}
        vertexColors
        transparent
        opacity={0.55}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
