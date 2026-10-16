import * as THREE from "three";

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
  depth = 0.26,
  layers = 14,
  matRef,
}) {
  return Array.from({ length: layers }, (_, i) => {
    const t = i / (layers - 1);
    return (
      <mesh
        key={i}
        position={[0, 0, -t * depth]}
        // Nearest layer last, so the painter's sort three does on
        // transparent objects stacks them in the right order.
        renderOrder={layers - i}
      >
        <planeGeometry args={[height * aspect, height]} />
        <meshBasicMaterial
          ref={matRef}
          map={tex}
          color={FACE.clone().lerp(SIDE, t)}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    );
  });
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
