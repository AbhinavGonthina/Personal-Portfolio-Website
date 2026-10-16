import { useEffect, useMemo } from "react";
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
 * The pavement.
 *
 * A grid drawn into one texture rather than a gridHelper, because a
 * helper draws every line at full strength all the way to the edge of
 * the world and ends on a hard square - which is what made the floor
 * read as a sheet of graph paper floating in a void. This one is
 * brightest underfoot and gone by the horizon, so the ground has
 * somewhere to end.
 *
 * Over a dark glossy sheet rather than a reflective material:
 * MeshReflectorMaterial renders the whole scene a second time into a
 * texture, and mirrored geometry under a dark pane is far cheaper for
 * the same read.
 */
const GRID_SPAN = 170;

function makeGridTexture() {
  const S = 2048;
  const CELLS = 68;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");

  // Slate-cyan rather than electric blue: the floor is the one
  // thing in frame at every stop, so it has to sit under the
  // accents rather than compete with them.
  g.strokeStyle = "#86b6cc";
  for (let i = 0; i <= CELLS; i++) {
    const p = Math.round((i / CELLS) * S) + 0.5;
    // Every fourth line heavier, so the floor has a grain as well as
    // a grid and does not strobe when the camera moves. Thin and
    // quiet with it: underfoot the texture is magnified several times
    // over, and at any real strength the floor stops being a surface
    // and becomes the loudest thing in the frame.
    g.lineWidth = i % 4 === 0 ? 1.7 : 0.9;
    g.globalAlpha = i % 4 === 0 ? 0.34 : 0.17;
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, S);
    g.moveTo(0, p);
    g.lineTo(S, p);
    g.stroke();
  }

  // Radial falloff: full strength across the part of the town the
  // camera actually walks, gone well before the edge of the plane.
  g.globalAlpha = 1;
  g.globalCompositeOperation = "destination-in";
  const fade = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  // A long tail rather than a cliff, so the grid dissolves into the
  // fog instead of stopping on a visible ring.
  fade.addColorStop(0, "rgba(0,0,0,1)");
  fade.addColorStop(0.24, "rgba(0,0,0,0.92)");
  fade.addColorStop(0.46, "rgba(0,0,0,0.5)");
  fade.addColorStop(0.66, "rgba(0,0,0,0.18)");
  fade.addColorStop(0.86, "rgba(0,0,0,0)");
  g.fillStyle = fade;
  g.fillRect(0, 0, S, S);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * `grid` goes false indoors. A neon floor is the wrong surface to be
 * standing on in someone's living room, and switching it off is what
 * lets the floorboards in there read as a room.
 */
export function Ground({ opacity = 0.9, grid = true }) {
  const lines = useMemo(makeGridTexture, []);
  useEffect(() => () => lines.dispose(), [lines]);

  return (
    <>
      {/* The sheet. Below zero, because at y=0.01 it intersected and
          sliced every building's base. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[GRID_SPAN, GRID_SPAN]} />
        <meshStandardMaterial
          color="#05050a"
          roughness={0.16}
          metalness={0.92}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* The grid, above the sheet: the sheet is transparent, so it
          draws after everything opaque and would paint the grid out. */}
      <mesh
        visible={grid}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <planeGeometry args={[GRID_SPAN, GRID_SPAN]} />
        <meshBasicMaterial
          map={lines}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}
