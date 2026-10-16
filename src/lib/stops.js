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

/** Eye level, outdoors and indoors. Nothing is ever seen from above. */
export const EYE = 1.68;
const EYE_IN = 1.5;

/** Standing on the path outside the front door, facing it. */
const DOORSTEP = toWorld(TOWN.house, [0, EYE, 5.2]);
const DOORWAY = toWorld(TOWN.house, [0, EYE_IN, 2.0]);

export const STOPS = [
  {
    // The establishing shot, from the pavement: the house off to the
    // left, the city ahead, the hoarding to the right. Eye level, like
    // everything else.
    id: "landing",
    ...shot([-1.5, EYE + 0.25, 30], [-1, 2.6, 2]),
    sway: 0.14,
  },
  {
    // Square on to the hoarding. The board carries its own words, so
    // the camera does not have to leave room for a column of copy.
    id: "about",
    title: "Who I am",
    frame: {
      at: toWorld(TOWN.billboard, [0, 4.2, 0]),
      yaw: TOWN.billboard.yaw,
      dist: 9.2,
      centred: true,
      eye: EYE,
    },
    sway: 0.05,
  },
  {
    // The one stop that is not a framed object: you stand in the
    // middle of the arc and look around.
    id: "experience",
    title: "Experience",
    street: true,
    sway: 0.62,
  },
  {
    // Inside, turned to the left wall and the servers.
    //
    // The way in matters: left to itself the camera would cut the
    // corner and phase through the side wall straight from the city.
    // `via` bends the path out to the doorstep first, so you walk up
    // the path, face the door and go through it.
    id: "skills",
    title: "Skills",
    frame: {
      at: toWorld(TOWN.house, [WALL_PANEL.x, WALL_PANEL.y, -HOUSE.d / 2 + 0.2]),
      yaw: TOWN.house.yaw,
      dist: 3.2,
      centred: true,
      eye: EYE_IN,
    },
    via: DOORSTEP,
    viaLook: DOORWAY,
    sway: 0.05,
  },
  {
    // Turned to the right wall and the desk.
    id: "projects",
    title: "Projects",
    frame: {
      at: toWorld(TOWN.house, [DESK.x - 0.06, DESK.y, DESK.z]),
      yaw: TOWN.house.yaw - Math.PI / 2,
      dist: 2.3,
      centred: true,
      eye: EYE_IN,
    },
    sway: 0.05,
  },
  {
    // Held: the camera does not move across the second half of the
    // Projects section, the screen changes instead.
    id: "projects-hold",
    title: "Projects",
    frame: {
      at: toWorld(TOWN.house, [DESK.x - 0.06, DESK.y, DESK.z]),
      yaw: TOWN.house.yaw - Math.PI / 2,
      dist: 2.3,
      centred: true,
      eye: EYE_IN,
    },
    sway: 0.05,
  },
  {
    // Back out through the same door, then down the path.
    id: "contact",
    title: "Contact",
    frame: {
      at: toWorld(TOWN.mail, [0, 1.3, 0]),
      yaw: TOWN.mail.yaw,
      dist: 5,
      centred: true,
      eye: EYE,
    },
    via: DOORSTEP,
    viaLook: toWorld(TOWN.mail, [0, 1.3, 0]),
    sway: 0.06,
  },
];

export const STOP = Object.fromEntries(STOPS.map((s, i) => [s.id, i]));
