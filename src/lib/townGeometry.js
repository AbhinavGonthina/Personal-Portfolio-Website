import * as THREE from "three";
import { ball, box, cone, cyl, HALF, merge, place, plane, rnd } from "./geo";

/**
 * Everything in the town that is not a tower.
 *
 * Each builder returns merged buffers - usually a dark `base` and a
 * bright `lit`, occasionally a third for parts that animate - so a house
 * with forty boxes in it still draws in two calls. The scene gates whole
 * groups on visibility by where the camera is, so nothing off the
 * current stop is submitted at all.
 *
 * World layout, looking down the +Z axis from the landing camera:
 *
 *      billboard            the city            the house
 *      x = -15              x = 0               x = 19
 *                                               garage at x = 12
 *                                               mailboxes at z = 13
 */

export const TOWN = {
  billboard: { x: -15, z: 4, yaw: 0.34 },
  house: { x: 19, z: 5.5, yaw: -0.16 },
  garage: { x: 11.4, z: 7.2, yaw: -0.16 },
  mail: { x: 16.2, z: 18.5, yaw: -0.08 },
};

/* ---------------------------------------------------------------- */

/** Posts, frame and a gantry lamp. The photo plane is mounted separately. */
export const BILLBOARD_W = 5.4;
export const BILLBOARD_H = 4.2;
const BILLBOARD_Y = 3.4;

export function billboard() {
  const base = [];
  const lit = [];
  const hw = BILLBOARD_W / 2;
  const hh = BILLBOARD_H / 2;
  const mid = BILLBOARD_Y + hh;

  for (const side of [-1, 1]) {
    base.push(
      box(0.26, BILLBOARD_Y + 0.4, 0.26, [
        side * (hw - 0.7),
        (BILLBOARD_Y + 0.4) / 2,
        0,
      ]),
    );
    // Cross-brace, which is what stops it reading as a photo on sticks.
    base.push(
      box(
        0.12,
        0.12,
        2.4,
        [side * (hw - 0.7), BILLBOARD_Y * 0.55, -0.6],
        [0.7, 0, 0],
      ),
    );
  }
  base.push(box(BILLBOARD_W + 0.5, BILLBOARD_H + 0.5, 0.3, [0, mid, -0.1]));

  for (const [dx, dy, bw, bh] of [
    [0, hh + 0.14, BILLBOARD_W + 0.4, 0.17],
    [0, -hh - 0.14, BILLBOARD_W + 0.4, 0.17],
  ]) {
    lit.push(box(bw, bh, 0.17, [dx, mid + dy, 0.09]));
  }
  for (const side of [-1, 1]) {
    lit.push(
      box(0.17, BILLBOARD_H + 0.4, 0.17, [side * (hw + 0.14), mid, 0.09]),
    );
  }
  // Two gantry lamps on arms above the board.
  for (const side of [-1, 1]) {
    base.push(
      cyl(0.05, 0.05, 0.8, 6, [side * 1.5, mid + hh + 0.4, 0.3], [0.7, 0, 0]),
    );
    lit.push(
      ball(0.12, [side * 1.5, mid + hh + 0.62, 0.55], null, [1, 0.7, 1]),
    );
  }

  return { base: merge(base), lit: merge(lit), mid, hw, hh };
}

/* ---------------------------------------------------------------- */

const HOUSE_W = 9.4;
const HOUSE_D = 8.2;
const HOUSE_H = 3.9;
export const DOOR_W = 1.5;
const DOOR_H = 2.4;

/**
 * The house, with a real doorway cut in the front wall, because the
 * camera goes through it. The front is four boxes around a hole rather
 * than one wall with a door drawn on it.
 */
export function house() {
  const base = [];
  const lit = [];
  const hw = HOUSE_W / 2;
  const hd = HOUSE_D / 2;
  const T = 0.22;

  // Back and sides.
  base.push(box(HOUSE_W, HOUSE_H, T, [0, HOUSE_H / 2, -hd]));
  for (const side of [-1, 1]) {
    base.push(box(T, HOUSE_H, HOUSE_D, [side * hw, HOUSE_H / 2, 0]));
  }
  base.push(box(HOUSE_W, T, HOUSE_D, [0, 0.04, 0]));
  base.push(box(HOUSE_W, T, HOUSE_D, [0, HOUSE_H, 0]));

  // Front wall, in four pieces around the doorway.
  const side = (HOUSE_W - DOOR_W) / 2;
  for (const s of [-1, 1]) {
    base.push(
      box(side, HOUSE_H, T, [s * (DOOR_W / 2 + side / 2), HOUSE_H / 2, hd]),
    );
  }
  base.push(
    box(DOOR_W, HOUSE_H - DOOR_H, T, [0, DOOR_H + (HOUSE_H - DOOR_H) / 2, hd]),
  );
  // Doorframe.
  for (const s of [-1, 1]) {
    base.push(box(0.12, DOOR_H, 0.3, [s * (DOOR_W / 2), DOOR_H / 2, hd]));
  }
  base.push(box(DOOR_W + 0.24, 0.12, 0.3, [0, DOOR_H, hd]));
  // Warm light spilling out of the doorway.
  lit.push(plane(DOOR_W - 0.1, 0.1, [0, 0.06, hd + 0.02]));

  // Pitched roof: two slabs and the gable ends.
  const rise = 2.0;
  const slope = Math.atan2(rise, hw);
  const len = Math.hypot(rise, hw);
  for (const s of [-1, 1]) {
    base.push(
      box(
        len + 0.3,
        0.2,
        HOUSE_D + 0.9,
        [s * hw * 0.5, HOUSE_H + rise / 2, 0],
        [0, 0, -s * slope],
      ),
    );
  }
  for (const s of [-1, 1]) {
    const g = new THREE.Shape();
    g.moveTo(-hw, 0);
    g.lineTo(hw, 0);
    g.lineTo(0, rise);
    base.push(
      new THREE.ExtrudeGeometry(g, { depth: T, bevelEnabled: false }).translate(
        0,
        HOUSE_H,
        s * hd - (s > 0 ? 0 : T),
      ),
    );
  }
  base.push(box(0.7, 2.0, 0.7, [hw * 0.45, HOUSE_H + rise * 0.6, -hd * 0.5]));

  // Windows: two on the front, one each side, all lit warm.
  for (const s of [-1, 1]) {
    const x = s * (DOOR_W / 2 + side / 2);
    base.push(box(1.5, 1.2, 0.1, [x, 2.0, hd + 0.04]));
    lit.push(plane(1.26, 0.96, [x, 2.0, hd + 0.1]));
    base.push(box(0.07, 1.0, 0.03, [x, 2.0, hd + 0.11]));
    base.push(box(1.3, 0.07, 0.03, [x, 2.0, hd + 0.11]));
  }
  for (const s of [-1, 1]) {
    base.push(box(0.1, 1.2, 1.4, [s * (hw + 0.04), 2.0, -1.4]));
    lit.push(plane(1.16, 0.96, [s * (hw + 0.1), 2.0, -1.4], [0, s * HALF, 0]));
  }

  // Porch.
  base.push(box(DOOR_W + 2.6, 0.14, 1.8, [0, 0.07, hd + 0.9]));
  for (const s of [-1, 1]) {
    base.push(cyl(0.1, 0.11, 2.6, 8, [s * (DOOR_W / 2 + 1.0), 1.3, hd + 1.6]));
  }
  base.push(box(DOOR_W + 2.8, 0.16, 2.0, [0, 2.65, hd + 1.0]));
  lit.push(ball(0.11, [0, 2.4, hd + 0.3]));

  // A path out to the mailboxes.
  for (let i = 0; i < 7; i++) {
    base.push(box(1.1, 0.04, 0.7, [i * 0.3, 0.03, hd + 2.3 + i * 1.15]));
  }

  return { base: merge(base), lit: merge(lit) };
}

/* ---------------------------------------------------------------- */

const ROOM_W = 7.0;
const ROOM_D = 6.0;
const ROOM_H = 3.4;

/**
 * The desk the camera settles on inside the house, plus just enough room
 * around it to feel enclosed. The screen is its own plane so the scene
 * can paint it with whatever project is selected.
 */
export const SCREEN = { w: 2.3, h: 1.35, y: 1.72, z: -1.52 };

export function study() {
  const base = [];
  const lit = [];
  const hw = ROOM_W / 2;
  const hd = ROOM_D / 2;

  base.push(box(ROOM_W, 0.1, ROOM_D, [0, 0, 0]));
  base.push(box(ROOM_W, 0.1, ROOM_D, [0, ROOM_H, 0]));
  base.push(box(ROOM_W, ROOM_H, 0.12, [0, ROOM_H / 2, -hd]));
  for (const s of [-1, 1]) {
    base.push(box(0.12, ROOM_H, ROOM_D, [s * hw, ROOM_H / 2, 0]));
  }

  // Desk.
  base.push(box(3.6, 0.1, 1.5, [0, 0.78, -1.0]));
  for (const s of [-1, 1]) {
    base.push(box(0.1, 0.78, 1.3, [s * 1.7, 0.39, -1.0]));
  }
  base.push(box(3.4, 0.08, 0.08, [0, 0.3, -1.6]));

  // Monitor: a slab on an arm, plus a keyboard and a mug.
  base.push(
    box(SCREEN.w + 0.14, SCREEN.h + 0.14, 0.09, [0, SCREEN.y, SCREEN.z]),
  );
  base.push(cyl(0.05, 0.05, 0.42, 8, [0, 1.0, SCREEN.z - 0.04]));
  base.push(box(0.6, 0.05, 0.3, [0, 0.85, SCREEN.z + 0.05]));
  base.push(box(1.3, 0.04, 0.42, [0, 0.85, -0.65], [-0.06, 0, 0]));
  base.push(cyl(0.11, 0.1, 0.22, 10, [1.1, 0.94, -0.7]));
  lit.push(
    box(SCREEN.w + 0.2, SCREEN.h + 0.2, 0.01, [0, SCREEN.y, SCREEN.z - 0.06]),
  );

  // Shelf of books above the desk, in whatever colours they come in.
  base.push(box(3.0, 0.08, 0.4, [0, 2.7, -hd + 0.3]));
  for (let i = 0; i < 11; i++) {
    const h = 0.3 + rnd(i, 7.1) * 0.18;
    base.push(
      box(0.14 + rnd(i, 3.3) * 0.08, h, 0.3, [
        -1.3 + i * 0.26,
        2.74 + h / 2,
        -hd + 0.3,
      ]),
    );
  }

  // A desk lamp and a strip under the shelf: the room's only light.
  base.push(cyl(0.16, 0.18, 0.04, 10, [-1.45, 0.85, -1.2]));
  base.push(cyl(0.025, 0.025, 0.5, 6, [-1.45, 1.1, -1.2], [0, 0, 0.2]));
  base.push(cone(0.18, 0.22, 10, [-1.3, 1.4, -1.2], [0, 0, Math.PI + 0.5]));
  lit.push(ball(0.07, [-1.28, 1.31, -1.2]));
  lit.push(box(2.6, 0.03, 0.03, [0, 2.66, -hd + 0.5]));

  // Chair.
  base.push(box(0.9, 0.08, 0.8, [0, 0.52, 0.2]));
  base.push(box(0.85, 0.9, 0.1, [0, 0.98, 0.56], [0.1, 0, 0]));
  base.push(cyl(0.06, 0.06, 0.5, 8, [0, 0.27, 0.2]));
  base.push(cyl(0.3, 0.3, 0.05, 12, [0, 0.04, 0.2]));

  return { base: merge(base), lit: merge(lit) };
}

/* ---------------------------------------------------------------- */

/**
 * An open-fronted workshop holding four server racks, one per skill
 * group. The rack units are the lit buffer, so the whole wall of them
 * brightens together.
 */
const BAY_W = 8.6;
const BAY_D = 5.4;
const BAY_H = 3.6;
export const RACK_X = [-2.7, -0.9, 0.9, 2.7];

export function workshop() {
  const base = [];
  const lit = [];
  const hw = BAY_W / 2;
  const hd = BAY_D / 2;

  base.push(box(BAY_W, 0.1, BAY_D, [0, 0.03, 0]));
  base.push(box(BAY_W, BAY_H, 0.14, [0, BAY_H / 2, -hd]));
  for (const s of [-1, 1]) {
    base.push(box(0.14, BAY_H, BAY_D, [s * hw, BAY_H / 2, 0]));
  }
  base.push(box(BAY_W + 0.5, 0.18, BAY_D + 0.5, [0, BAY_H, 0]));
  base.push(box(BAY_W + 0.5, 0.3, 0.2, [0, BAY_H - 0.25, hd + 0.2]));

  // Four racks against the back wall.
  for (const x of RACK_X) {
    base.push(box(1.5, 2.7, 0.9, [x, 1.35, -hd + 0.6]));
    base.push(box(1.56, 0.1, 0.96, [x, 2.72, -hd + 0.6]));
    for (let u = 0; u < 9; u++) {
      const y = 0.3 + u * 0.26;
      base.push(box(1.3, 0.2, 0.06, [x, y, -hd + 1.06]));
      lit.push(box(0.06, 0.05, 0.03, [x - 0.5, y, -hd + 1.11]));
      lit.push(box(0.06, 0.05, 0.03, [x - 0.38, y, -hd + 1.11]));
      if (u % 3 === 0)
        lit.push(box(0.5, 0.025, 0.03, [x + 0.3, y, -hd + 1.11]));
    }
  }

  // A lit wall behind the racks. Without it the whole bay read as a
  // hole in the page with a few LEDs floating in it.
  lit.push(box(BAY_W - 0.6, 0.05, 0.05, [0, 2.95, -hd + 0.2]));
  lit.push(box(0.05, 2.4, 0.05, [-hw + 0.3, 1.4, -hd + 0.2]));
  lit.push(box(0.05, 2.4, 0.05, [hw - 0.3, 1.4, -hd + 0.2]));

  // Cable tray overhead and a strip light.
  base.push(box(BAY_W - 1.0, 0.1, 0.4, [0, 3.1, -hd + 1.4]));
  lit.push(box(BAY_W - 1.6, 0.05, 0.12, [0, 3.0, 0.2]));

  return { base: merge(base), lit: merge(lit) };
}

/* ---------------------------------------------------------------- */

/**
 * Four mailboxes on one rail. The lids are returned separately and one
 * at a time, because each opens on its own when you point at it.
 */
export const MAIL_GAP = 1.5;
export const MAIL_BODY = { w: 0.62, h: 0.52, d: 0.95 };

export function mailrail(count) {
  const base = [];
  const lit = [];
  const span = (count - 1) * MAIL_GAP;

  base.push(box(span + 1.4, 0.14, 0.2, [0, 1.02, 0]));
  for (const s of [-1, 1]) {
    base.push(cyl(0.09, 0.11, 1.1, 8, [s * (span / 2 + 0.6), 0.55, 0]));
  }
  for (let i = 0; i < count; i++) {
    const x = -span / 2 + i * MAIL_GAP;
    base.push(box(0.1, 0.32, 0.1, [x, 1.25, 0]));
  }
  return { base: merge(base), lit: merge(lit) };
}

/** One mailbox body, built at the origin facing +Z. */
export function mailbox() {
  const { w, h, d } = MAIL_BODY;
  const base = [
    box(w, h * 0.55, d, [0, h * 0.275, 0]),
    // A rounded back, so it reads as a mailbox and not a shoebox.
    cyl(w / 2, w / 2, d, 14, [0, h * 0.55, 0], [HALF, 0, 0], [1, 1, 0.8]),
    box(w * 0.9, 0.06, 0.06, [0, h * 0.2, d / 2 + 0.02]),
  ];
  return merge(base);
}

/** The hinged lid and the flag, which move. */
export function maillid() {
  const { w, h, d } = MAIL_BODY;
  // Hinged at the back: the pivot is the group, so the geometry is built
  // forward of the origin.
  const parts = [
    cyl(
      w / 2 + 0.03,
      w / 2 + 0.03,
      0.09,
      14,
      [0, 0, d / 2],
      [HALF, 0, 0],
      [1, 1, 0.8],
    ),
    box(w * 0.5, 0.05, 0.14, [0, -w / 2 + 0.06, d / 2 + 0.05]),
  ];
  place(parts, [0, h * 0.55, -d / 2], null);
  return merge(parts);
}

export function mailflag() {
  const parts = [
    box(0.035, 0.34, 0.035, [0, 0.17, 0]),
    box(0.025, 0.16, 0.19, [0, 0.27, 0.11]),
  ];
  return merge(parts);
}

/* ---------------------------------------------------------------- */

/**
 * Ground dressing: kerbs, street lamps, a hedge and a few trees. One
 * merged pair for the lot, drawn at every stop, because an empty plane
 * between the landmarks is what made the first version feel like three
 * objects floating rather than a place.
 */
export function dressing() {
  const base = [];
  const lit = [];

  // Everything here sits *behind* the landmarks. The first pass put a
  // row of trees at z = 20, which from the establishing shot was a
  // hedge three metres in front of the lens.
  for (const z of [-19, 17]) {
    base.push(box(78, 0.16, 0.5, [2, 0.08, z]));
  }

  // Street lamps along the far kerb.
  for (let i = 0; i < 11; i++) {
    const x = -34 + i * 7;
    base.push(cyl(0.09, 0.13, 5.2, 8, [x, 2.6, -18.4]));
    base.push(box(0.1, 0.1, 1.4, [x, 5.15, -17.9]));
    lit.push(ball(0.17, [x, 5.05, -17.3], null, [1.4, 0.6, 1]));
  }

  // A hedge in front of the house and trees filling the gaps between
  // the three landmarks.
  for (let i = 0; i < 15; i++) {
    base.push(
      box(0.9, 0.7 + rnd(i, 5.5) * 0.2, 0.8, [8.5 + i * 0.9, 0.35, 11.4]),
    );
  }
  for (let i = 0; i < 11; i++) {
    const x = -30 + i * 6.4 + rnd(i, 2.2) * 2.4;
    const z = -14 + rnd(i, 9.7) * 11;
    // Nothing in the middle of the road, and nothing standing in the arc.
    if (Math.hypot(x, z) < 14) continue;
    const h = 2.6 + rnd(i, 4.4) * 2.2;
    base.push(cyl(0.13, 0.19, h, 7, [x, h / 2, z]));
    base.push(ball(0.95, [x, h + 0.5, z], null, [1, 1.25, 1]));
    base.push(ball(0.62, [x + 0.4, h + 1.2, z - 0.2], null, [1, 1.1, 1]));
  }

  return { base: merge(base), lit: merge(lit) };
}
