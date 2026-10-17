import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Primitives, placed and then merged.
 *
 * Everything in this town is built this way. A house is forty boxes and a
 * server rack is sixty, but each finished object is one or two merged
 * buffers, so it costs one or two draw calls however much detail went
 * into it. That is the entire performance strategy: the scene can be as
 * dense as it likes as long as nothing ships as forty separate meshes.
 */

// `?? ` and not a default parameter: callers pass an explicit null to skip
// a rotation while still supplying a scale, and a default only fires on
// undefined.
export const V = (a) => new THREE.Vector3(...(a ?? [0, 0, 0]));
export const E = (a) => new THREE.Euler(...(a ?? [0, 0, 0]));
export const HALF = Math.PI / 2;

/** Places one primitive. Mutates and returns it; it is about to be merged. */
export function at(geo, pos, rot, scale = 1) {
  const s = typeof scale === "number" ? [scale, scale, scale] : scale;
  geo.applyMatrix4(
    new THREE.Matrix4().compose(
      V(pos),
      new THREE.Quaternion().setFromEuler(E(rot)),
      V(s),
    ),
  );
  return geo;
}

export const box = (w, h, d, pos, rot, scale) =>
  at(new THREE.BoxGeometry(w, h, d), pos, rot, scale);
export const cyl = (rt, rb, h, seg, pos, rot, scale) =>
  at(new THREE.CylinderGeometry(rt, rb, h, seg), pos, rot, scale);
export const cone = (r, h, seg, pos, rot, scale) =>
  at(new THREE.ConeGeometry(r, h, seg), pos, rot, scale);
export const ball = (r, pos, rot, scale) =>
  at(new THREE.SphereGeometry(r, 14, 10), pos, rot, scale);

/**
 * Two cheaper spheres, for the two things there are hundreds of.
 *
 * A lamp bulb is six pixels across and a tree is a silhouette in the
 * dark; neither needs the 280 triangles a full ball costs. Forty
 * bulbs and a hundred and twenty clumps of foliage were most of the
 * triangles in the town, and all of them were spent on roundness
 * nobody can see.
 */
export const dot = (r, pos, rot, scale) =>
  at(new THREE.SphereGeometry(r, 6, 4), pos, rot, scale);
export const puff = (r, pos, rot, scale) =>
  at(new THREE.SphereGeometry(r, 8, 5), pos, rot, scale);
export const ring = (r, t, pos, rot, scale) =>
  at(new THREE.TorusGeometry(r, t, 8, 24), pos, rot, scale);
export const plane = (w, h, pos, rot, scale) =>
  at(new THREE.PlaneGeometry(w, h), pos, rot, scale);

/**
 * A flat polygon given in XY, extruded along +Z from `pos`.
 *
 * For the shapes a box cannot be: a gable end is a triangle, and
 * covering one with angled slabs leaves a hole at the apex however
 * many slabs you use. `merge` levels the batch down when this lands
 * among boxes, so it costs the house's buffer its index and nothing
 * else.
 */
export const prism = (points, depth, pos, rot, scale) => {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++)
    shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  return at(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }),
    pos,
    rot,
    scale,
  );
};

export const merge = (parts) => {
  const keep = parts.filter(Boolean);
  if (!keep.length) return null;
  // Box, cylinder and cone geometries are indexed; ExtrudeGeometry is
  // not, and mergeGeometries refuses a mixed set. One un-indexed part
  // in a house of forty boxes was enough to return null and leave a
  // mesh with no geometry at all, so the whole batch is levelled down
  // when that happens.
  const mixed = keep.some((g) => !g.index) && keep.some((g) => g.index);
  const list = mixed ? keep.map((g) => (g.index ? g.toNonIndexed() : g)) : keep;
  return mergeGeometries(list, false);
};

/** Moves a finished set of parts into place as a group. */
export function place(parts, pos, rot, scale = 1) {
  const s = typeof scale === "number" ? [scale, scale, scale] : scale;
  const m = new THREE.Matrix4().compose(
    V(pos),
    new THREE.Quaternion().setFromEuler(E(rot)),
    V(s),
  );
  parts.forEach((g) => g.applyMatrix4(m));
  return parts;
}

/** A run of boxes following a polyline, for drawing a trace or a cord. */
export function polyline(points, thickness) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    out.push(
      box(
        Math.hypot(x2 - x1, y2 - y1) + thickness * 0.5,
        thickness,
        thickness * 0.5,
        [(x1 + x2) / 2, (y1 + y2) / 2, 0],
        [0, 0, Math.atan2(y2 - y1, x2 - x1)],
      ),
    );
  }
  return out;
}

/** A seeded 0..1, so the town looks the same on every visit. */
export const rnd = (i, salt = 12.9898) => {
  const v = Math.sin(i * salt) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * Paint a run of parts one colour, as a vertex attribute.
 *
 * Colour per object normally means a material per object, and a
 * material per object means a draw call per object - which is the
 * one thing the town cannot spend. A colour attribute survives
 * `merge`, so a wood of two hundred trees in half a dozen greens is
 * still the handful of draw calls it was when it was all one grey.
 *
 * `to` defaults to the end, so the usual shape is: paint everything
 * the base colour first, then paint the parts that differ over the
 * top. That way nothing can be left without the attribute, and a
 * merge of some geometries that have it and some that do not is a
 * merge that fails.
 */
export function tint(parts, from, hex, to = parts.length) {
  const c = new THREE.Color(hex);
  for (let i = from; i < to; i++) {
    const g = parts[i];
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let v = 0; v < n; v++) {
      col[v * 3] = c.r;
      col[v * 3 + 1] = c.g;
      col[v * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
}
