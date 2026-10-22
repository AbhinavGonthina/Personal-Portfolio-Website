/**
 * Where everything in the town is, as numbers.
 *
 * Split out of `townGeometry` for one reason: the walk's camera
 * stops are defined against these, so `lib/stops` imports them, and
 * `lib/stops` is read by the navigation bar on every visit. While
 * they lived next to the builders, that import reached `lib/geo`
 * and from there the whole of three, and the entry's static graph
 * carried a 193 kB gzip renderer for a reader who had chosen the
 * plain read and would never see a polygon.
 *
 * Nothing here builds anything. If a constant in this file ever
 * needs a `BufferGeometry` to work out its value, it belongs back
 * in `townGeometry`.
 */

export const HOUSE_YAW = Math.PI / 2 - 0.12;

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
export const LAMP_X = 2;

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

/* ---------------------------------------------------------------- */

export const HOUSE = { w: 6.2, d: 6.2, h: 3.1, door: 1.15, doorH: 2.05 };
export const T = 0.16;

/* ---------------------------------------------------------------- */

export const R = { w: HOUSE.w - T * 2, d: HOUSE.d - T * 2, h: HOUSE.h - T };

/** Where the two things on the walls sit, in house-local coordinates. */
export const RACKS = { x: -R.w / 2 + 0.42, y: 1.2 };
export const DESK = { x: R.w / 2 - 0.4, y: 1.68, z: -0.1 };
/**
 * An ultrawide, and deliberately not the shape of the skills board.
 *
 * Both are a lit rectangle on a dark wall at about the same distance,
 * and at 1.5 x 0.92 this one was close enough to the board's 3.4 x
 * 1.71 that the two stops read as the same room furniture twice. At
 * 21:9 it is a monitor, which is also the shape that fits three
 * repository cards across instead of two.
 */
export const DESK_SCREEN = { w: 2.52, h: 1.35 };

/**
 * The part of the panel the page is on, under the browser chrome.
 *
 * Still 21:9: the monitor grew to make room for an address bar, not
 * to make the page a different shape. Everything that scrolls, the
 * scrollbar and the hint are measured against this and not against
 * the glass.
 */
export const DESK_PAGE = { w: 2.52, h: 1.09 };

/** Where the floor lamp stands, and so where its light comes from. */
export const FLOOR_LAMP = { x: R.w / 2 - 0.18, y: 1.64, z: 1.72 };
/**
 * The skills board hangs on the back wall rather than over the racks.
 * Above them it had to be small enough to clear the rack tops, which
 * left the type unreadable; on the back wall it can be the size it
 * needs to be and the racks still fill the left of the shot.
 */
// Wider than it was, because the board is a terminal window now and
// the right third of it is a screen that answers what the pointer is
// on. The back wall is 6.2 across, so this still has room either
// side.
export const WALL_PANEL = { w: 3.4, h: 1.71, x: -0.55, y: 1.72 };

/* ---------------------------------------------------------------- */

export const MAIL_GAP = 1.4;
// Taller than it was by a third. The face has to hold a mark at its
// own aspect ratio and a name under it, and at 0.48 it held the mark
// and pushed the name off the bottom edge.
export const MAIL_BODY = { w: 0.58, h: 0.7, d: 0.88 };

/** The top of the face: the straight part, plus the arc over it. */
export const MAIL_TOP = MAIL_BODY.h * 0.55 + MAIL_BODY.w / 2;

/**
 * The road along the front of the town. `z` is where its centre
 * line runs; the car stands in the near lane, kerbside.
 */
export const ROAD = { z: 34.2, half: 4.5, from: -92, to: 92 };
