import {
  box,
  cone,
  cyl,
  dot,
  HALF,
  tint,
  merge,
  place,
  plane,
  prism,
  puff,
  rnd,
} from "./geo";

/**
 * Everything in the town that is not a tower.
 *
 * Each builder returns merged buffers - usually a dark `base` and a
 * bright `lit` - so a house with forty boxes still draws in two calls.
 * The scene gates whole groups on where the camera is, so nothing off
 * the current stop is submitted at all.
 *
 * Layout, looking down the road from the landing camera:
 *
 *      the house            the city            the hoarding
 *      x = -16              x = 0               x = 14
 *      mailboxes in                             trees and park
 *      front of it                              off to the right
 *
 * The house is deliberately small - a little bigger than one of the
 * Northeastern blocks, not a mansion - because you walk into it and a
 * room has to feel like a room at that scale.
 */

/**
 * The house faces east, toward the city, so its door is the thing you
 * meet coming the other way. Walking over from the skyline you turn to
 * face it before you go in, which is what a person does and what the
 * camera was conspicuously not doing when it slid in through a wall.
 */
const HOUSE_YAW = Math.PI / 2 - 0.12;

export const TOWN = {
  house: { x: -19, z: 8, yaw: HOUSE_YAW },
  // On the wall down the left-hand side of the garden, facing back
  // across the path. You come out of the front door walking forwards,
  // turn right, and they are there - so they have to be looking the
  // way you will be looking, which is a quarter turn clockwise off
  // the house's own facing.
  mail: { x: -12.53, z: 12.81, yaw: HOUSE_YAW + Math.PI / 2 },
  billboard: { x: 13.5, z: 6.0, yaw: -0.28 },
};

/* ---------------------------------------------------------------- */

/**
 * The hoarding at the edge of town: the portrait, and beside it who the
 * face belongs to. Both are planes the scene mounts on the board,
 * because the About section's words belong painted on it rather than
 * floating in a panel over the top.
 */
export const BOARD = { w: 8.2, h: 4.0, y: 2.4, pad: 0.2 };
export const BOARD_PHOTO = BOARD.h - BOARD.pad * 2;

/** How far out from the middle the two gantry lamps hang. */
const LAMP_X = 2;

/**
 * The same two, as a fraction across the face. The pools of light are
 * painted into the face texture rather than cast by real lights, and
 * this is what keeps the paint under the lamps instead of near them.
 */
export const BOARD_LAMPS = [
  (BOARD.w / 2 - LAMP_X) / BOARD.w,
  (BOARD.w / 2 + LAMP_X) / BOARD.w,
];

/** The painted panel, which takes whatever the portrait leaves. */
export const BOARD_TEXT = BOARD.w - BOARD_PHOTO - BOARD.pad * 3;

/**
 * Where the right-hand lamp falls across that panel, as a fraction
 * of its width. The panel is its own plane drawn over the face, so
 * a pool painted on the face stops at its edge - the light has to be
 * painted into the panel as well to carry on across it, and this is
 * the only number that keeps the two halves of one pool in line.
 */
export const BOARD_PANEL_LAMP =
  (LAMP_X - (BOARD.w / 2 - BOARD.pad - BOARD_TEXT)) / BOARD_TEXT;

export function billboard() {
  const base = [];
  const lit = [];
  const hw = BOARD.w / 2;
  const hh = BOARD.h / 2;
  const mid = BOARD.y + hh;

  for (const side of [-1, 1]) {
    base.push(
      box(0.24, BOARD.y + 0.4, 0.24, [
        side * (hw - 0.9),
        (BOARD.y + 0.4) / 2,
        0,
      ]),
    );
    base.push(
      box(
        0.1,
        0.1,
        1.9,
        [side * (hw - 0.9), BOARD.y * 0.55, -0.5],
        [0.7, 0, 0],
      ),
    );
  }
  base.push(box(BOARD.w + 0.4, BOARD.h + 0.4, 0.26, [0, mid, -0.1]));

  for (const dy of [hh + 0.12, -hh - 0.12]) {
    lit.push(box(BOARD.w + 0.34, 0.13, 0.14, [0, mid + dy, 0.08]));
  }
  for (const side of [-1, 1]) {
    lit.push(box(0.13, BOARD.h + 0.34, 0.14, [side * (hw + 0.12), mid, 0.08]));
  }
  for (const side of [-1, 1]) {
    base.push(
      cyl(
        0.045,
        0.045,
        0.7,
        6,
        [side * LAMP_X, mid + hh + 0.35, 0.25],
        [0.7, 0, 0],
      ),
    );
    lit.push(
      dot(0.1, [side * LAMP_X, mid + hh + 0.55, 0.47], null, [1, 0.7, 1]),
    );
  }

  // Ticks at the portrait's corners. A photograph is the one thing on
  // this board that is not made of lines, and left bare it sat on the
  // black as a rectangle of colour that had arrived from somewhere
  // else. Ticks rather than a border, which is how everything here is
  // framed, and in the merged buffer with the rest of the lit work so
  // the whole board stays one draw call.
  const px = -hw + BOARD.pad + BOARD_PHOTO / 2;
  const pr = BOARD_PHOTO / 2 + 0.05;
  const t = 0.025;
  const arm = 0.3;
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const x = px + sx * pr;
      const y = mid + sy * pr;
      lit.push(box(arm, t, t, [x - (sx * (arm - t)) / 2, y, 0.08]));
      lit.push(box(t, arm, t, [x, y - (sy * (arm - t)) / 2, 0.08]));
    }
  }

  // A hairline just inside the photograph's edge, inside the ticks.
  // The ticks say where the portrait is; this says it is behind
  // glass. It is drawn in the lit material with the rest, so the
  // bloom picks it up and it reads as an edge that is lit rather
  // than an edge that is drawn.
  const ir = BOARD_PHOTO / 2 - 0.045;
  const it = 0.012;
  for (const dy of [ir, -ir]) {
    lit.push(box(ir * 2 + it, it, it, [px, mid + dy, 0.075]));
  }
  for (const dx of [ir, -ir]) {
    lit.push(box(it, ir * 2 - it, it, [px + dx, mid, 0.075]));
  }

  return { base: merge(base), lit: merge(lit), mid, hw, hh };
}

/* ---------------------------------------------------------------- */

export const HOUSE = { w: 6.2, d: 6.2, h: 3.1, door: 1.15, doorH: 2.05 };
const T = 0.16;

/**
 * A small house with a real doorway, because the camera goes through
 * it. The front is four boxes around a hole rather than a wall with a
 * door drawn on it, and the leaf itself swings - the scene hinges it.
 */
/**
 * A roof that is not the same grey as the walls under it, which is
 * most of what made the house read as one untouched block beside a
 * city of colour.
 */
const HOUSE_WALL = "#4c4859";
const HOUSE_ROOF = "#6d3a45";

export function house() {
  const base = [];
  const lit = [];
  const hw = HOUSE.w / 2;
  const hd = HOUSE.d / 2;
  const { door, doorH } = HOUSE;

  base.push(box(HOUSE.w, HOUSE.h, T, [0, HOUSE.h / 2, -hd]));
  for (const s of [-1, 1]) {
    base.push(box(T, HOUSE.h, HOUSE.d, [s * hw, HOUSE.h / 2, 0]));
  }
  base.push(box(HOUSE.w, T, HOUSE.d, [0, 0.02, 0]));
  base.push(box(HOUSE.w, T, HOUSE.d, [0, HOUSE.h, 0]));

  const side = (HOUSE.w - door) / 2;
  for (const s of [-1, 1]) {
    base.push(
      box(side, HOUSE.h, T, [s * (door / 2 + side / 2), HOUSE.h / 2, hd]),
    );
  }
  base.push(
    box(door, HOUSE.h - doorH, T, [0, doorH + (HOUSE.h - doorH) / 2, hd]),
  );
  for (const s of [-1, 1]) {
    base.push(box(0.1, doorH, 0.22, [s * (door / 2), doorH / 2, hd]));
  }
  base.push(box(door + 0.2, 0.1, 0.22, [0, doorH, hd]));

  const roofFrom = base.length;
  const rise = 1.5;
  const slope = Math.atan2(rise, hw);
  const len = Math.hypot(rise, hw);
  for (const s of [-1, 1]) {
    base.push(
      box(
        len + 0.22,
        0.16,
        HOUSE.d + 0.7,
        [s * hw * 0.5, HOUSE.h + rise / 2, 0],
        [0, 0, -s * slope],
      ),
    );
  }
  // The gable ends, filled. They were a pair of angled slabs per side,
  // which covered the bottom third of each triangle and left the rest
  // of it open - from the front the house had a roof with nothing
  // under it. A triangle is not a box, so it is extruded.
  for (const z of [hd - T / 2, -hd - T / 2]) {
    base.push(
      prism(
        [
          [-hw, 0],
          [hw, 0],
          [0, rise],
        ],
        T,
        [0, HOUSE.h, z],
      ),
    );
  }
  base.push(box(0.5, 1.3, 0.5, [hw * 0.5, HOUSE.h + rise * 0.7, -hd * 0.5]));
  const roofTo = base.length;

  for (const s of [-1, 1]) {
    const x = s * (door / 2 + side / 2);
    // Clear of the wall, not flush with it.
    //
    // The wall is T thick and centred on hd, so its outer face is at
    // hd + T/2 = hd + 0.08 - which is exactly where the lit pane sat.
    // Two coplanar surfaces means the depth buffer picks a winner per
    // pixel per frame, and the window stipples and crawls as the
    // camera moves. Everything here now stands in front of the wall
    // with room to spare.
    base.push(box(1.1, 0.9, 0.08, [x, 1.55, hd + 0.11]));
    lit.push(plane(0.92, 0.72, [x, 1.55, hd + 0.16]));
    base.push(box(0.05, 0.76, 0.03, [x, 1.55, hd + 0.175]));
  }
  for (const s of [-1, 1]) {
    base.push(box(0.08, 0.9, 1, [s * (hw + 0.11), 1.55, -1]));
    lit.push(plane(0.84, 0.72, [s * (hw + 0.16), 1.55, -1], [0, s * HALF, 0]));
  }

  base.push(box(door + 1.8, 0.1, 1.3, [0, 0.05, hd + 0.65]));
  for (const s of [-1, 1]) {
    base.push(cyl(0.08, 0.09, 2.1, 8, [s * (door / 2 + 0.7), 1.05, hd + 1.15]));
  }
  base.push(box(door + 2, 0.12, 1.45, [0, 2.15, hd + 0.72]));
  lit.push(dot(0.08, [0, 1.95, hd + 0.2]));
  // A lantern either side of the door.
  for (const s of [-1, 1]) {
    base.push(box(0.1, 0.16, 0.1, [s * (door / 2 + 0.26), 1.85, hd + 0.12]));
    lit.push(box(0.12, 0.2, 0.12, [s * (door / 2 + 0.26), 1.68, hd + 0.12]));
  }

  // Stepping stones out to the mailboxes, each with a ground light
  // beside it. An unlit path at night is a row of grey rectangles.
  for (let i = 0; i < 8; i++) {
    const z = hd + 1.7 + i * 0.92;
    base.push(box(0.85, 0.03, 0.55, [0, 0.02, z]));
    if (i % 2 === 0) {
      const side = i % 4 === 0 ? -1 : 1;
      base.push(cyl(0.035, 0.045, 0.3, 6, [side * 0.72, 0.15, z]));
      lit.push(dot(0.07, [side * 0.72, 0.33, z], null, [1, 0.8, 1]));
    }
  }

  tint(base, 0, HOUSE_WALL);
  tint(base, roofFrom, HOUSE_ROOF, roofTo);
  return { base: merge(base), lit: merge(lit) };
}

/** The door leaf. Hinged on its left edge, so it is built off-centre. */
export function doorLeaf() {
  const { door, doorH } = HOUSE;
  return merge([
    box(door - 0.05, doorH - 0.05, 0.06, [door / 2, doorH / 2, 0]),
    box(0.05, 0.05, 0.09, [door - 0.16, doorH / 2, 0.05]),
  ]);
}

/* ---------------------------------------------------------------- */

const R = { w: HOUSE.w - T * 2, d: HOUSE.d - T * 2, h: HOUSE.h - T };

/** Where the two things on the walls sit, in house-local coordinates. */
export const RACKS = { x: -R.w / 2 + 0.42, y: 1.2 };
export const DESK = { x: R.w / 2 - 0.4, y: 1.26, z: -0.1 };
export const DESK_SCREEN = { w: 1.5, h: 0.92 };
/**
 * The skills board hangs on the back wall rather than over the racks.
 * Above them it had to be small enough to clear the rack tops, which
 * left the type unreadable; on the back wall it can be the size it
 * needs to be and the racks still fill the left of the shot.
 */
export const WALL_PANEL = { w: 2.3, h: 1.71, x: -0.95, y: 1.72 };

/**
 * The room: servers down the left wall, a desk and monitor on the
 * right, and enough of a bedroom around them that it reads as somewhere
 * someone works rather than a showroom for two props.
 */
export function interior() {
  const base = [];
  const lit = [];
  // The rack indicators, kept apart so they can blink on their own,
  // and the floorboards, which want a warmer matte than the walls.
  const led = [];
  const floor = [];
  const hw = R.w / 2;
  const hd = R.d / 2;

  floor.push(box(R.w, 0.04, R.d, [0, 0.1, 0]));
  for (let i = 0; i < 9; i++) {
    floor.push(box(R.w, 0.01, 0.025, [0, 0.122, -hd + 0.3 + i * 0.62]));
  }
  base.push(box(2.2, 0.02, 1.6, [0.1, 0.13, 0.9]));

  // Three racks, each a stack of bays with its own lights. The LEDs
  // are their own buffer so the scene can pulse them without
  // touching anything else in the room.
  for (let r = 0; r < 3; r++) {
    const z = -1.5 + r * 1.5;
    base.push(box(0.6, 2, 1.1, [RACKS.x, 1, z]));
    base.push(box(0.64, 0.07, 1.16, [RACKS.x, 2.02, z]));
    // Recessed bay, so each unit sits in a shadow rather than on a
    // flat face.
    base.push(box(0.05, 1.78, 1.0, [RACKS.x + 0.28, 1.0, z]));
    for (let u = 0; u < 8; u++) {
      const y = 0.26 + u * 0.21;
      base.push(box(0.06, 0.16, 0.95, [RACKS.x + 0.31, y, z]));
      // Two indicators and, on a third of the bays, a status bar.
      led.push(box(0.03, 0.04, 0.05, [RACKS.x + 0.345, y, z - 0.36]));
      led.push(box(0.03, 0.04, 0.05, [RACKS.x + 0.345, y, z - 0.28]));
      if (u % 3 === 0) {
        led.push(box(0.03, 0.022, 0.34, [RACKS.x + 0.345, y, z + 0.2]));
      }
      if (u % 4 === 1) {
        led.push(box(0.03, 0.05, 0.14, [RACKS.x + 0.345, y, z + 0.34]));
      }
    }
    // A glow strip up the edge of each rack. Cyan with the rest of
    // the hardware - in the warm buffer it came out as an orange bar
    // down a server, which belongs to the lamp side of the room.
    led.push(box(0.025, 1.84, 0.035, [RACKS.x + 0.33, 1.0, z - 0.52]));
  }
  base.push(box(0.1, 0.1, R.d - 0.6, [RACKS.x - 0.2, 2.45, 0]));

  base.push(box(0.9, 0.07, 2.3, [DESK.x, 0.78, DESK.z]));
  for (const z of [DESK.z - 1.05, DESK.z + 1.05]) {
    base.push(box(0.07, 0.78, 0.8, [DESK.x, 0.39, z]));
  }
  base.push(box(0.22, 0.05, 0.5, [DESK.x, 0.88, DESK.z]));
  base.push(cyl(0.035, 0.035, 0.34, 8, [DESK.x, 1.03, DESK.z]));
  base.push(
    box(0.06, DESK_SCREEN.h + 0.1, DESK_SCREEN.w + 0.1, [
      DESK.x - 0.02,
      DESK.y,
      DESK.z,
    ]),
  );
  base.push(
    box(0.3, 0.025, 0.85, [DESK.x - 0.38, 0.83, DESK.z - 0.1], [0, 0, 0.05]),
  );
  base.push(cyl(0.07, 0.065, 0.14, 10, [DESK.x - 0.3, 0.89, DESK.z + 0.75]));
  base.push(cyl(0.1, 0.11, 0.03, 10, [DESK.x - 0.1, 0.83, DESK.z - 1]));
  base.push(
    cyl(0.018, 0.018, 0.42, 6, [DESK.x - 0.1, 1.03, DESK.z - 1], [0, 0, 0.18]),
  );
  base.push(
    cone(
      0.13,
      0.16,
      10,
      [DESK.x - 0.22, 1.25, DESK.z - 1],
      [0, 0, Math.PI + 0.6],
    ),
  );
  lit.push(dot(0.05, [DESK.x - 0.24, 1.18, DESK.z - 1]));
  base.push(box(0.5, 0.06, 0.5, [DESK.x - 0.95, 0.5, DESK.z]));
  base.push(box(0.07, 0.6, 0.48, [DESK.x - 1.18, 0.78, DESK.z]));
  base.push(cyl(0.045, 0.045, 0.4, 8, [DESK.x - 0.95, 0.27, DESK.z]));
  base.push(cyl(0.22, 0.22, 0.04, 12, [DESK.x - 0.95, 0.09, DESK.z]));

  base.push(box(1.5, 0.3, 2, [-0.5, 0.26, -hd + 1.1]));
  base.push(box(1.56, 0.22, 2.06, [-0.5, 0.48, -hd + 1.1]));
  base.push(box(1.56, 0.5, 0.1, [-0.5, 0.52, -hd + 0.08]));
  base.push(box(0.6, 0.13, 0.38, [-0.82, 0.64, -hd + 0.35]));
  base.push(box(0.6, 0.13, 0.38, [-0.2, 0.64, -hd + 0.35]));
  base.push(box(1.5, 0.08, 1.15, [-0.5, 0.62, -hd + 1.6]));
  base.push(box(0.44, 0.5, 0.4, [0.52, 0.35, -hd + 0.42]));
  base.push(cyl(0.075, 0.095, 0.2, 10, [0.52, 0.7, -hd + 0.42]));
  lit.push(cyl(0.1, 0.075, 0.15, 10, [0.52, 0.86, -hd + 0.42]));

  base.push(cyl(0.15, 0.19, 0.28, 10, [hw - 0.5, 0.25, hd - 0.6]));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    base.push(
      cone(
        0.1,
        0.78,
        5,
        [hw - 0.5 + Math.cos(a) * 0.15, 0.72, hd - 0.6 + Math.sin(a) * 0.15],
        [0, -a, -0.5 - (i % 2) * 0.3],
        [1, 1, 0.34],
      ),
    );
  }
  for (let i = 0; i < 3; i++) {
    base.push(
      box(
        0.28,
        0.05,
        0.2,
        [-hw + 1.3, 0.16 + i * 0.055, hd - 0.8],
        [0, rnd(i, 4.1) * 0.5, 0],
      ),
    );
  }
  base.push(
    cyl(0.18, 0.18, 0.05, 16, [hw - 0.6, 2.45, -hd + 0.06], [HALF, 0, 0]),
  );

  base.push(cyl(0.014, 0.014, 0.3, 6, [0.2, R.h - 0.15, 0.4]));
  lit.push(dot(0.12, [0.2, R.h - 0.34, 0.4], null, [1, 0.72, 1]));
  lit.push(box(0.035, 0.03, R.d - 1.2, [RACKS.x + 0.1, R.h - 0.12, 0]));

  // A bezel around the monitor, so the screen has an edge to glow
  // against rather than ending on the dark of the wall behind it.
  for (const dy of [DESK_SCREEN.h / 2 + 0.02, -DESK_SCREEN.h / 2 - 0.02]) {
    lit.push(
      box(0.02, 0.016, DESK_SCREEN.w + 0.06, [
        DESK.x - 0.045,
        DESK.y + dy,
        DESK.z,
      ]),
    );
  }
  for (const dz of [DESK_SCREEN.w / 2 + 0.02, -DESK_SCREEN.w / 2 - 0.02]) {
    lit.push(
      box(0.02, DESK_SCREEN.h + 0.05, 0.016, [
        DESK.x - 0.045,
        DESK.y,
        DESK.z + dz,
      ]),
    );
  }

  return {
    base: merge(base),
    lit: merge(lit),
    led: merge(led),
    floor: merge(floor),
  };
}

/* ---------------------------------------------------------------- */

export const MAIL_GAP = 1.4;
// Taller than it was by a third. The face has to hold a mark at its
// own aspect ratio and a name under it, and at 0.48 it held the mark
// and pushed the name off the bottom edge.
export const MAIL_BODY = { w: 0.58, h: 0.7, d: 0.88 };

/** The top of the face: the straight part, plus the arc over it. */
export const MAIL_TOP = MAIL_BODY.h * 0.55 + MAIL_BODY.w / 2;

export function mailrail(count) {
  const base = [];
  const span = (count - 1) * MAIL_GAP;
  // A low garden wall rather than a pair of legs, because that is
  // what a row of boxes at the end of a drive actually stands on.
  // Built in courses with a hair between them, so it reads as laid
  // rather than poured.
  //
  // It runs a good deal further towards the house than away from it,
  // which puts the boxes at the near end of the wall instead of in
  // the middle: the one on the end used to sit close enough to the
  // house to have it looming over the shot.
  const x0 = -(span / 2 + 1.35);
  const x1 = span / 2 + 3.55;
  const wall = x1 - x0;
  const n = Math.max(4, Math.round(wall / 0.86));
  const pw = wall / n;
  for (let i = 0; i < n; i++) {
    base.push(
      box(pw - 0.045, 0.98 + rnd(i, 5.5) * 0.03, 0.46, [
        x0 + pw * (i + 0.5),
        0.49,
        0,
      ]),
    );
  }
  // The capping course the boxes sit on, proud of the wall either side.
  base.push(box(wall + 0.14, 0.1, 0.58, [(x0 + x1) / 2, 1.05, 0]));
  return { base: merge(base) };
}

export function mailbox() {
  const { w, h, d } = MAIL_BODY;
  return merge([
    box(w, h * 0.55, d, [0, h * 0.275, 0]),
    cyl(w / 2, w / 2, d, 14, [0, h * 0.55, 0], [HALF, 0, 0], [1, 1, 0.8]),
    box(w * 0.9, 0.055, 0.055, [0, h * 0.2, d / 2 + 0.02]),
  ]);
}

/**
 * The door on the front, cut to the same outline as the box.
 *
 * What opened before was a disc on a stalk sitting inside the body,
 * which is not a part a mailbox has: it swung up out of the middle
 * of the box and left the face - the one surface with the mark on
 * it - standing still. This is the face. It is hinged along its top
 * edge and the mark is mounted on it, so what lifts is the thing
 * you were pointing at.
 *
 * Built around its own hinge rather than around the box, so the
 * caller can rotate it without first having to move it.
 */
/**
 * The opening the door was covering.
 *
 * Set into the face rather than laid on it, and in the unlit black
 * rather than the body colour: the ring of lit bodywork left around
 * it is what reads as the thickness of the wall, and without it an
 * open mailbox is a box with a lid hovering over a solid front.
 */
export function mailmouth() {
  const { w, h, d } = MAIL_BODY;
  const inset = 0.055;
  const r = w / 2 - inset;
  return merge([
    box(w - inset * 2, h * 0.55 - inset, 0.012, [
      0,
      h * 0.275 + inset / 2,
      d / 2,
    ]),
    cyl(r, r, 0.012, 14, [0, h * 0.55, d / 2], [HALF, 0, 0], [1, 1, 0.8]),
  ]);
}

export function maildoor() {
  const { w, h, d } = MAIL_BODY;
  const t = 0.05;
  const r = w / 2 - 0.012;
  const parts = [
    box(w - 0.024, h * 0.55, t, [0, h * 0.275, 0]),
    cyl(r, r, t, 14, [0, h * 0.55, 0], [HALF, 0, 0], [1, 1, 0.8]),
  ];
  // Built around its hinge: the top of the arc, on the front face.
  // Only the panel thickness sits forward of it, so the caller puts
  // the pivot on the front edge and the door tips about that edge.
  // Carrying the box depth in here instead put the pivot back at
  // the middle of the box, and the door swung out on a 0.46 radius
  // arc and ended up hanging in the air in front of its own box.
  void d;
  place(parts, [0, -MAIL_TOP, t / 2], null);
  return merge(parts);
}

export function mailflag() {
  return merge([
    box(0.032, 0.3, 0.032, [0, 0.15, 0]),
    box(0.022, 0.14, 0.17, [0, 0.24, 0.1]),
  ]);
}

/* ---------------------------------------------------------------- */

/**
 * The road the car is parked on.
 *
 * It runs along X, parallel with the frontage of the town, so you
 * arrive alongside the place rather than driving at it. `z` is the
 * centre line; the car stands in the near lane, kerbside.
 */
export const ROAD = { z: 34.2, half: 4.5, from: -92, to: 92 };

/** The clearing: no tree stands inside this, or it would block the town. */
const CLEARING = { x: 12, from: 11, to: 31.5 };

/**
 * Where the camera stands to read the mailboxes: `dist` out along the
 * way they face. Out past the clearing and clear of the house, so
 * without this the wood grows a tree in the middle of the shot.
 */
const MAIL_VIEW = {
  x: TOWN.mail.x + 5 * Math.sin(TOWN.mail.yaw),
  z: TOWN.mail.z + 5 * Math.cos(TOWN.mail.yaw),
};

/**
 * One tree. Three kinds, so a wood of two hundred of them does not
 * read as one shape stamped two hundred times, and the leafy kind is
 * kept for the near ones because a sphere costs five times a cone.
 */
/**
 * What a wood looks like at night: still dark, but not all one dark.
 * Every colour here is below the city in value on purpose - the
 * point is that the forest stops being a single grey mass, not that
 * it starts competing with the neon.
 */
const BARK = ["#3a3330", "#332e2f", "#2f3034", "#3b352c"];
const LEAF = ["#2f4a39", "#27423f", "#334257", "#3a4030", "#2b3a4c", "#43412f"];

function tree(parts, i, x, z, near) {
  const kind = near ? i % 3 : i % 2;
  const h = 2.4 + rnd(i, 4.4) * 3.4;
  const trunkFrom = parts.length;
  parts.push(
    cyl(0.1, 0.17, h, 6, [x, h / 2, z], [0, 0, (rnd(i, 6.6) - 0.5) * 0.12]),
  );
  tint(parts, trunkFrom, BARK[i % BARK.length]);
  const leafFrom = parts.length;

  if (kind === 0) {
    // Conifer: a stack of skirts, narrowing.
    const n = 4 + (i % 2);
    for (let t = 0; t < n; t++) {
      parts.push(cone(1.08 - t * 0.19, 1.15, 7, [x, h * 0.58 + t * 0.62, z]));
    }
  } else if (kind === 1) {
    // Bare and branchy, which is what gives a wood its depth.
    for (let b = 0; b < 5; b++) {
      const a = (b / 5) * Math.PI * 2 + rnd(i, 3.3);
      parts.push(
        cyl(
          0.03,
          0.05,
          1.2,
          5,
          [x + Math.cos(a) * 0.36, h * 0.84 + b * 0.12, z + Math.sin(a) * 0.36],
          [0, -a, 0.72],
        ),
      );
    }
    parts.push(cone(0.62, 1.5, 7, [x, h + 0.5, z]));
  } else {
    parts.push(puff(0.92, [x, h + 0.4, z], null, [1, 1.2, 1]));
    parts.push(puff(0.6, [x + 0.46, h + 1, z - 0.2], null, [1, 1.05, 1]));
    parts.push(puff(0.5, [x - 0.4, h + 0.86, z + 0.3], null, [1, 1, 1]));
  }
  tint(parts, leafFrom, LEAF[i % LEAF.length]);
}

/**
 * Ground dressing: the road, the woods either side of it, the park
 * railing and the roadside lamps.
 *
 * The wood is a jittered grid rather than a scatter of hand-placed
 * spots. A scatter of twenty reads as twenty trees standing on an
 * empty plane; a grid of two hundred, thinned where it would block
 * something and jittered so no two rows line up, reads as a wood the
 * town was cut out of. It is all one merged buffer either way.
 */
export function dressing() {
  const base = [];
  const lit = [];
  const road = [];
  const paint = [];
  const len = ROAD.to - ROAD.from;
  const mid = (ROAD.to + ROAD.from) / 2;

  // The road itself, and the markings. Black slab, solid white at the
  // kerbs, broken white down the middle.
  road.push(box(len, 0.05, ROAD.half * 2, [mid, 0.035, ROAD.z]));
  for (const s of [-1, 1]) {
    paint.push(
      box(len - 1, 0.02, 0.16, [mid, 0.065, ROAD.z + s * (ROAD.half - 0.5)]),
    );
  }
  for (let i = 0; i < Math.floor(len / 5.4); i++) {
    paint.push(
      box(2.6, 0.02, 0.17, [ROAD.from + 1.4 + i * 5.4, 0.065, ROAD.z]),
    );
  }

  // Lamps along the near kerb, spaced to miss the spot you end up
  // standing on when you step out of the car.
  for (let i = 0; i < 7; i++) {
    const x = -48 + i * 16;
    base.push(cyl(0.07, 0.1, 4.2, 7, [x, 2.1, ROAD.z - ROAD.half - 0.7]));
    base.push(box(0.08, 0.08, 1, [x, 4.15, ROAD.z - ROAD.half - 1.1]));
    lit.push(
      dot(0.13, [x, 4.05, ROAD.z - ROAD.half - 1.5], null, [1.4, 0.6, 1]),
    );
  }

  // The railing along the front of the park.
  for (let i = 0; i < 12; i++) {
    const x = -36 + i * 6.6;
    base.push(cyl(0.08, 0.12, 4.8, 8, [x, 2.4, -18.3]));
    base.push(box(0.09, 0.09, 1.3, [x, 4.75, -17.8]));
    lit.push(dot(0.15, [x, 4.65, -17.25], null, [1.4, 0.6, 1]));
  }

  // The wood, in columns rather than as one buffer.
  //
  // Merged whole it was a single mesh whose bounding sphere covered
  // the entire map, so it passed the frustum test from everywhere -
  // including from inside the house, where forty thousand triangles
  // of tree were being drawn behind a wall. Split into columns, the
  // ones behind you are rejected before they cost anything.
  const woods = [];
  const COLS = 7;
  for (let i = 0; i < COLS; i++) woods.push([]);
  let n = 0;
  for (let gx = 0; gx < 26; gx++) {
    const col = woods[Math.min(COLS - 1, Math.floor((gx / 26) * COLS))];
    for (let gz = 0; gz < 12; gz++) {
      n++;
      const x = -78 + gx * 6.24 + (rnd(n, 2.2) - 0.5) * 4.4;
      const z = 14 + gz * 5.6 + (rnd(n, 9.7) - 0.5) * 4;
      // Off the tarmac and off the verges.
      if (Math.abs(z - ROAD.z) < ROAD.half + 1.8) continue;
      // Out of the way of the shot down the road into the town.
      if (Math.abs(x) < CLEARING.x && z > CLEARING.from && z < CLEARING.to) {
        continue;
      }
      // And clear of the hoarding, the house, and the two spots the
      // camera stands on to look at them - a tree a metre from the
      // lens is a grey wall across the shot.
      if (Math.hypot(x - 13.5, z - 6) < 8) continue;
      if (Math.hypot(x + 19, z - 8) < 10) continue;
      if (Math.hypot(x - 11, z - 14.8) < 8) continue;
      if (Math.hypot(x - MAIL_VIEW.x, z - MAIL_VIEW.z) < 6.5) continue;
      tree(col, n, x, z, z < 42);
    }
  }

  // The park, off to the right of the house, which was there before
  // the road was and is a good deal thinner than the wood.
  for (let i = 0; i < 14; i++) {
    const x = 7 + rnd(i, 2.2) * 28;
    const z = -16 + rnd(i, 9.7) * 26;
    if (Math.hypot(x - 13.5, z - 6) < 7) continue;
    if (Math.hypot(x, z) < 15) continue;
    tree(base, 900 + i, x, z, true);
  }

  return {
    base: merge(base),
    lit: merge(lit),
    road: merge(road),
    paint: merge(paint),
    woods: woods.map(merge).filter(Boolean),
  };
}
