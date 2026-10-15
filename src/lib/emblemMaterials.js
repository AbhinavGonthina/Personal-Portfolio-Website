import * as THREE from "three";

/**
 * Every part of an emblem shares one of two materials - a dark body and
 * a brighter one for the parts meant to catch bloom - so the building
 * lerps two objects a frame rather than sixty.
 */
export function makeEmblemMaterials(color) {
  const base = new THREE.MeshStandardMaterial({
    color: "#08080d",
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.4,
  });
  const lit = new THREE.MeshStandardMaterial({
    color: "#08080d",
    emissive: new THREE.Color(color),
    emissiveIntensity: 1.4,
    roughness: 0.3,
    metalness: 0.4,
    toneMapped: false,
  });
  return { base, lit };
}
