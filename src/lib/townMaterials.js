import { useEffect, useMemo } from "react";
import * as THREE from "three";

/** Two shared materials for all the dark structure in the town. */
export function useTownMaterials() {
  const mats = useMemo(
    () => ({
      shell: new THREE.MeshStandardMaterial({
        // Light enough to catch the key light. At #0b0b11 a whole
        // house read as a hole in the page.
        color: "#45454f",
        roughness: 0.78,
        metalness: 0.1,
      }),
      // Warm: windows, lamps, the light under a door. Untonemapped so
      // bloom catches it the way it catches the tower crowns.
      warm: new THREE.MeshBasicMaterial({
        color: "#ffc98a",
        toneMapped: false,
      }),
      cool: new THREE.MeshBasicMaterial({
        color: "#9fb4ff",
        toneMapped: false,
      }),
      // The mailboxes sit on their own in the dark at the end of the
      // path, so they are a touch lighter than the rest of the town or
      // the marks on them read as floating.
      post: new THREE.MeshStandardMaterial({
        color: "#5a5a68",
        roughness: 0.6,
        metalness: 0.25,
      }),
    }),
    [],
  );
  useEffect(
    () => () => Object.values(mats).forEach((m) => m.dispose()),
    [mats],
  );
  return mats;
}
