import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * One palette for the whole town.
 *
 * Four accents and nothing else: amber for anything with a filament
 * in it, cyan for glass and status, violet for the things that are
 * decoration, and a cool off-white for structure that catches light.
 * Every lit surface in the place picks one of these, which is what
 * makes the sections read as one world rather than four rooms lit by
 * different people.
 */
export const ACCENT = {
  amber: "#ffc07a",
  cyan: "#6fe3f5",
  blue: "#8fa8ff",
  violet: "#b48bff",
};

export function useTownMaterials() {
  const mats = useMemo(() => {
    const lit = (color) =>
      new THREE.MeshBasicMaterial({ color, toneMapped: false });
    return {
      // Structure. Light enough to catch the key light - at near-black
      // a whole house read as a hole in the page.
      shell: new THREE.MeshStandardMaterial({
        color: "#3c3c48",
        roughness: 0.78,
        metalness: 0.12,
      }),
      // Anything standing on its own in the dark, where the structure
      // tone would disappear: mailboxes, posts, lamp columns.
      post: new THREE.MeshStandardMaterial({
        color: "#56566a",
        roughness: 0.6,
        metalness: 0.25,
      }),
      // Anything whose colour is carried in the geometry rather than
      // in the material. One material, one draw call per buffer, and
      // as many colours as the buffer has vertices - which is how a
      // wood gets to be six greens without being six draw calls.
      painted: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.82,
        metalness: 0.06,
      }),
      // The inside of something you are meant to read as open. Unlit
      // on purpose: every other surface here takes the sky, and the
      // one that does not is the one the eye calls a hole.
      void: new THREE.MeshBasicMaterial({
        color: "#06060b",
        toneMapped: false,
      }),
      // Interior walls, a good deal darker than the outside shells.
      // Outdoors a surface has the sky to catch; in here the only
      // light is a desk lamp and a rack, and the walls have to fall
      // away for either of them to read as a light source at all.
      room: new THREE.MeshStandardMaterial({
        color: "#23232c",
        roughness: 0.92,
        metalness: 0.02,
      }),
      // Floorboards: matte, warm, and nothing like the grid outside.
      boards: new THREE.MeshStandardMaterial({
        color: "#3a2f26",
        roughness: 0.95,
        metalness: 0,
      }),
      // Tarmac, and the paint on it. The lines are given a little
      // emissive so they still read as white at the far end of a road
      // lit by six lamps.
      road: new THREE.MeshStandardMaterial({
        color: "#0d0e12",
        roughness: 0.96,
        metalness: 0.04,
      }),
      paint: new THREE.MeshStandardMaterial({
        color: "#c9ccc4",
        roughness: 0.85,
        metalness: 0,
        emissive: "#41433e",
      }),
      door: new THREE.MeshStandardMaterial({
        color: "#6b5440",
        roughness: 0.75,
        metalness: 0.05,
      }),
      warm: lit(ACCENT.amber),
      cool: lit(ACCENT.blue),
      cyan: lit(ACCENT.cyan),
      violet: lit(ACCENT.violet),
    };
  }, []);

  useEffect(
    () => () => Object.values(mats).forEach((m) => m.dispose()),
    [mats],
  );
  return mats;
}
