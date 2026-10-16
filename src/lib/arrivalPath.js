import { HEADREST, SEAT } from "./carGeometry";
import { STOPS } from "./stops";

/** Where the car is parked, in world space. */
export const CAR_PARK = { x: 1.35, z: 31.6, yaw: Math.PI - 0.12 };

const toWorld = ([lx, ly, lz]) => [
  CAR_PARK.x + lx * Math.cos(CAR_PARK.yaw) + lz * Math.sin(CAR_PARK.yaw),
  ly,
  CAR_PARK.z - lx * Math.sin(CAR_PARK.yaw) + lz * Math.cos(CAR_PARK.yaw),
];

const LAND = STOPS[0].free;

/**
 * pos, look, and how long to take getting there. The first frame is
 * where you wake up; the last is the landing shot, so the sequence
 * hands over to the scroll rig already in the right place.
 */
const SHOTS = [
  { at: 0, pos: SEAT, look: HEADREST, local: true },
  { at: 3.4, pos: SEAT, look: HEADREST, local: true },
  // Turn right, to the door.
  { at: 4.5, pos: SEAT, look: [2.6, 1.05, -0.9], local: true },
  // Out, and stand up.
  { at: 6.0, pos: [1.9, 1.25, -0.75], look: [4.2, 1.3, -1.2], local: true },
  { at: 7.1, pos: [2.5, 1.75, -1.3], look: [4.4, 1.6, -2.6], local: true },
  // Turn to face the town. Both ends in world space now.
  { at: 8.6, pos: LAND.pos, look: LAND.look },
];
export const ARRIVAL_END = SHOTS[SHOTS.length - 1].at;

const ease = (p) => p * p * (3 - 2 * p);

/** Fills `out` with the shot for time `t`. */
export function arrivalShot(t, out) {
  let i = 0;
  while (i < SHOTS.length - 2 && t > SHOTS[i + 1].at) i++;
  const a = SHOTS[i];
  const b = SHOTS[i + 1];
  const f = ease(Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at))));

  const ap = a.local ? toWorld(a.pos) : a.pos;
  const al = a.local ? toWorld(a.look) : a.look;
  const bp = b.local ? toWorld(b.pos) : b.pos;
  const bl = b.local ? toWorld(b.look) : b.look;

  out.px = ap[0] + (bp[0] - ap[0]) * f;
  out.py = ap[1] + (bp[1] - ap[1]) * f;
  out.pz = ap[2] + (bp[2] - ap[2]) * f;
  out.lx = al[0] + (bl[0] - al[0]) * f;
  out.ly = al[1] + (bl[1] - al[1]) * f;
  out.lz = al[2] + (bl[2] - al[2]) * f;
  return out;
}
