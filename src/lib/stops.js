import { DESK, HOUSE, TOWN, WALL_PANEL } from "./townGeometry";

/**
 * Where the camera stands at each section, in order down the page.
 *
 * Scroll interpolates between neighbours, so the site is one walk: a
 * wide look at the town, across to the hoarding, forward into the
 * business district, back left to the house, in through the door to
 * the servers, turn to the desk, and out to the mailboxes.
 *
 * Only the Experience stop puts anything in a panel beside the scene.
 * Every other stop carries its words on a surface in the world - the
 * hoarding, a board over the racks, the monitor, the mailboxes - which
 * is why none of them needs a split screen.
 */

/** Local offset inside a group turned by `yaw` about Y. */
export const toWorld = (b, [lx, ly, lz]) => [
  b.x + lx * Math.cos(b.yaw) + lz * Math.sin(b.yaw),
  ly,
  b.z - lx * Math.sin(b.yaw) + lz * Math.cos(b.yaw),
];

/** A shot that looks from one point at another, both in world space. */
const shot = (pos, look) => ({ free: { pos, look } });

export const STOPS = [
  {
    // The establishing shot: the name on the pavement, the hoarding off
    // to the right, the city ahead. Nothing is framed - this is the
    // whole town at once.
    id: "landing",
    ...shot([-3, 8.5, 36], [0, 3.4, 2]),
    sway: 0.12,
  },
  {
    // Square on to the hoarding, filling the frame. The board carries
    // its own words, so the camera does not have to leave room for a
    // column of copy.
    id: "about",
    frame: {
      at: toWorld(TOWN.billboard, [0, 4.2, 0]),
      yaw: TOWN.billboard.yaw,
      dist: 8.4,
      centred: true,
    },
    sway: 0.05,
  },
  {
    // The one stop that is not a framed object: you stand in the middle
    // of the arc and look around.
    id: "experience",
    street: true,
    sway: 0.62,
  },
  {
    // Inside the house, turned to the left wall and the servers.
    id: "skills",
    frame: {
      at: toWorld(TOWN.house, [WALL_PANEL.x, WALL_PANEL.y, -HOUSE.d / 2 + 0.2]),
      yaw: TOWN.house.yaw,
      dist: 3.2,
      centred: true,
    },
    sway: 0.05,
  },
  {
    // Turned to the right wall and the desk.
    id: "projects",
    frame: {
      at: toWorld(TOWN.house, [DESK.x - 0.06, DESK.y, DESK.z]),
      yaw: TOWN.house.yaw - Math.PI / 2,
      dist: 2.3,
      centred: true,
    },
    sway: 0.05,
  },
  {
    // Held: the camera does not move across the second half of the
    // Projects section, the screen changes instead.
    id: "projects-hold",
    frame: {
      at: toWorld(TOWN.house, [DESK.x - 0.06, DESK.y, DESK.z]),
      yaw: TOWN.house.yaw - Math.PI / 2,
      dist: 2.45,
      centred: true,
    },
    sway: 0.05,
  },
  {
    id: "contact",
    frame: {
      at: toWorld(TOWN.mail, [0, 1.3, 0]),
      yaw: TOWN.mail.yaw,
      dist: 5.6,
      centred: true,
    },
    sway: 0.06,
  },
];

export const STOP = Object.fromEntries(STOPS.map((s, i) => [s.id, i]));
