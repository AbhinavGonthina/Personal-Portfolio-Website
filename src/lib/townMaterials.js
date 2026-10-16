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
