import {
  ball,
  box,
  cone,
  cyl,
  HALF,
  merge,
  place,
  plane,
  prism,
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
  // At the far end of the path and off to its left, where a row of
  // boxes actually stands. Dead ahead of the front door they read as
  // something installed in the middle of the lawn.
  mail: { x: -8.96, z: 12.43, yaw: HOUSE_YAW },
  billboard: { x: 13.5, z: 6.0, yaw: -0.28 },
};

/* ---------------------------------------------------------------- */

/**
 * The hoarding at the edge of town: the portrait, and beside it who the
 * face belongs to. Both are planes the scene mounts on the board,
 * because the About section's words belong painted on it rather than
 * floating in a panel over the top.
 */
export const BOARD = { w: 7.6, h: 3.5, y: 2.4, pad: 0.2 };
export const BOARD_PHOTO = BOARD.h - BOARD.pad * 2;

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
      cyl(0.045, 0.045, 0.7, 6, [side * 2, mid + hh + 0.35, 0.25], [0.7, 0, 0]),
    );
    lit.push(ball(0.1, [side * 2, mid + hh + 0.55, 0.47], null, [1, 0.7, 1]));
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
  lit.push(ball(0.08, [0, 1.95, hd + 0.2]));
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
      lit.push(ball(0.07, [side * 0.72, 0.33, z], null, [1, 0.8, 1]));
    }
  }

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
  lit.push(ball(0.05, [DESK.x - 0.24, 1.18, DESK.z - 1]));
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
  lit.push(ball(0.12, [0.2, R.h - 0.34, 0.4], null, [1, 0.72, 1]));
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
export const MAIL_BODY = { w: 0.58, h: 0.48, d: 0.88 };

export function mailrail(count) {
  const base = [];
  const span = (count - 1) * MAIL_GAP;
  base.push(box(span + 1.3, 0.13, 0.18, [0, 0.98, 0]));
  for (const s of [-1, 1]) {
    base.push(cyl(0.085, 0.1, 1.05, 8, [s * (span / 2 + 0.55), 0.52, 0]));
  }
  for (let i = 0; i < count; i++) {
    base.push(box(0.09, 0.3, 0.09, [-span / 2 + i * MAIL_GAP, 1.2, 0]));
  }
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

export function maillid() {
  const { w, h, d } = MAIL_BODY;
  const parts = [
    cyl(
      w / 2 + 0.03,
      w / 2 + 0.03,
      0.08,
      14,
      [0, 0, d / 2],
      [HALF, 0, 0],
      [1, 1, 0.8],
    ),
    box(w * 0.5, 0.045, 0.13, [0, -w / 2 + 0.05, d / 2 + 0.05]),
  ];
  place(parts, [0, h * 0.55, -d / 2], null);
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
 * One tree. Three kinds, so a wood of two hundred of them does not
 * read as one shape stamped two hundred times, and the leafy kind is
 * kept for the near ones because a sphere costs five times a cone.
 */
function tree(parts, i, x, z, near) {
  const kind = near ? i % 3 : i % 2;
  const h = 2.4 + rnd(i, 4.4) * 3.4;
  parts.push(
    cyl(0.1, 0.17, h, 6, [x, h / 2, z], [0, 0, (rnd(i, 6.6) - 0.5) * 0.12]),
  );

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
    parts.push(ball(0.92, [x, h + 0.4, z], null, [1, 1.2, 1]));
    parts.push(ball(0.6, [x + 0.46, h + 1, z - 0.2], null, [1, 1.05, 1]));
    parts.push(ball(0.5, [x - 0.4, h + 0.86, z + 0.3], null, [1, 1, 1]));
  }
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
      ball(0.13, [x, 4.05, ROAD.z - ROAD.half - 1.5], null, [1.4, 0.6, 1]),
    );
  }

  // The railing along the front of the park.
  for (let i = 0; i < 12; i++) {
    const x = -36 + i * 6.6;
    base.push(cyl(0.08, 0.12, 4.8, 8, [x, 2.4, -18.3]));
    base.push(box(0.09, 0.09, 1.3, [x, 4.75, -17.8]));
    lit.push(ball(0.15, [x, 4.65, -17.25], null, [1.4, 0.6, 1]));
  }
  for (let i = 0; i < 12; i++) {
    base.push(
      box(0.8, 0.6 + rnd(i, 5.5) * 0.2, 0.7, [-20 + i * 0.84, 0.3, 11.6]),
    );
  }

  // The wood. A jittered grid over everything behind and beside the
  // town, skipping the road, the clearing in front of it, and the
  // ground the town is standing on.
  let n = 0;
  for (let gx = 0; gx < 26; gx++) {
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
      tree(base, n, x, z, z < 42);
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
  };
}
