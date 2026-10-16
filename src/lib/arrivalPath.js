import { SCREEN_AT, SEAT } from "./carGeometry";
import { STOPS } from "./stops";

/**
 * Where the car is parked, in world space.
 *
 * Turned a quarter turn, so the nose points down -X and the car is
 * lying along the road rather than across it. That puts its right-hand
 * side - the side you get out of - facing -Z, which is the town. You
 * open the door and the city is already in front of you; there is no
 * second turn to make.
 */
export const CAR_PARK = { x: -2.3, z: 32.56, yaw: Math.PI / 2 };

/** Car-local to world. At this yaw it is just a swap of the two axes. */
const toWorld = ([lx, ly, lz]) => [
  CAR_PARK.x + lx * Math.cos(CAR_PARK.yaw) + lz * Math.sin(CAR_PARK.yaw),
  ly,
  CAR_PARK.z - lx * Math.sin(CAR_PARK.yaw) + lz * Math.cos(CAR_PARK.yaw),
];

const LAND = STOPS[0].free;

/** When the door starts to swing, shared with the car itself. */
export const DOOR_AT = 3.8;
/** When the headrest stops saying it is loading. */
export const ARRIVED_AT = 3.3;

/**
 * pos, look, and when to be there. The first frame is where you wake
 * up; the last is the landing shot, so the sequence hands over to the
 * scroll rig already standing in the right place.
 */
const SHOTS = [
  { at: 0, pos: SEAT, look: SCREEN_AT, local: true },
  { at: 3.3, pos: SEAT, look: SCREEN_AT, local: true },
  // Look right, through the door that has just opened.
  { at: 4.5, pos: [0.72, 1.3, 0.8], look: [2.9, 1.1, 0.9], local: true },
  // Slide out.
  { at: 6.0, pos: [1.8, 1.34, 0.95], look: [4.4, 1.34, 0.6], local: true },
  // Stand up, and the town is straight ahead.
  { at: 7.1, pos: [2.5, 1.84, 0.82], look: [5.2, 1.7, 0.2], local: true },
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
