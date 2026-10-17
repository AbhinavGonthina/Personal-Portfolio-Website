import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The ground everything in the town stands on, and the lettering that
 * stands on it.
 */

const FACE = new THREE.Color("#ffffff");
const SIDE = new THREE.Color("#2b2b33");

/**
 * Lettering with real depth, made by stacking the same glyphs back
 * into the scene over a short run and darkening each copy.
 *
 * That is not a drop shadow: the layers are separate planes in world
 * space, so turning the camera slides the sides of the letters past
 * their fronts the way an extrusion does.
 *
 * `matRef` is handed every layer's material, so the caller can fade
 * the whole word from its own frame loop.
 */
export function ExtrudedText({
  tex,
  aspect,
  height,
  // A fraction of the glyph height, not a fixed distance. The far
  // layer is near black, so depth is how much of each letter reads
  // dark - and a depth that does not scale means a small word is a
  // mostly dark word. The cluster signs on the road are 0.52 high
  // and were taking the old flat 0.26: half of every letter was the
  // shadow colour, which is why they came out grey beside WELCOME
  // while WELCOME, at 0.22 on 0.92, came out white. 0.24 is the
  // ratio the two words that looked right were already using.
  depth = height * 0.24,
  layers = 14,
  matRef,
}) {
  // One mesh, not one per layer.
  //
  // A layer each meant fourteen draw calls and fourteen materials for
  // a single word; three cluster signs, the welcome and the thanks
  // came to sixty-odd calls of nothing but lettering. The stack is
  // merged into one buffer instead, with the darkening carried as a
  // vertex colour rather than as a material per copy - which also
  // leaves one opacity to fade rather than fourteen.
  const geo = useMemo(() => {
    const parts = [];
    // Farthest first. With depth writing off, the order inside the
    // buffer is the order they paint in, and the near face has to
    // land on top of the ones behind it.
    for (let i = layers - 1; i >= 0; i--) {
      const t = i / (layers - 1);
      const g = new THREE.PlaneGeometry(height * aspect, height);
      g.translate(0, 0, -t * depth);
      const c = FACE.clone().lerp(SIDE, t);
      const n = g.attributes.position.count;
      const col = new Float32Array(n * 3);
      for (let v = 0; v < n; v++) {
        col[v * 3] = c.r;
        col[v * 3 + 1] = c.g;
        col[v * 3 + 2] = c.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      parts.push(g);
    }
    return mergeGeometries(parts, false);
  }, [aspect, height, depth, layers]);

  useEffect(() => () => geo?.dispose(), [geo]);
  if (!geo) return null;

  return (
    // After the ground, always. The floor is a transparent pane -
    // it has to be, or the mirrored town under it would not show
    // through - so it sits in the transparent pass and is sorted by
    // distance, and its origin is the middle of a 150 unit plane
    // the camera is usually standing on. That puts it nearest, so it
    // paints last, over lettering that is genuinely in front of it,
    // and the grid lines come through the letters. A render order
    // settles it rather than leaving it to a sort that cannot see
    // the difference. Each layer used to carry its own, which is
    // what this quietly dropped when they were merged into one.
    <mesh geometry={geo} renderOrder={2}>
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        vertexColors
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * The pavement: a plain grid over a dark glossy sheet.
 *
 * This is the original gridHelper, dark grey and unlit. It was
 * replaced by a glowing texture with a radial falloff, and the
 * glowing version - at every brightness it was tried at - turned the
 * floor into the loudest thing in the frame. Dark grey lines read as
 * a surface the town is standing on; blue ones read as a feature.
 *
 * A sheet rather than a reflective material: MeshReflectorMaterial
 * renders the whole scene a second time into a texture, and mirrored
 * geometry under a dark pane is far cheaper for the same read.
 *
 * `grid` goes false indoors. A grid of any colour is the wrong floor
 * for someone's living room, and switching it off is what lets the
 * floorboards in there read as a room.
 */
export function Ground({
  size = 150,
  divisions = 60,
  opacity = 0.88,
  grid = true,
}) {
  return (
    <>
      {grid && (
        <gridHelper
          args={[size, divisions, "#343438", "#1e1e22"]}
          position={[0, 0.02, 0]}
        />
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#05050a"
          roughness={0.16}
          metalness={0.92}
          transparent
          opacity={opacity}
        />
      </mesh>
    </>
  );
}
