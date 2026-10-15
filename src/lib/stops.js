import { SCREEN, TOWN } from "./townGeometry";

/**
 * Where the camera stands at each section, in order down the page.
 *
 * Scroll interpolates between neighbours, so the whole site is one
 * continuous walk: back off the town, up to the hoarding, into the
 * middle of the business district, across to the workshop, in through
 * the front door to the desk, and back out to the mailboxes.
 *
 * `free` stops give explicit camera and target positions. `frame` stops
 * name an object instead - where it is, which way it faces, how far
 * back to stand - and the rig works out a shot that puts it on the left
 * of the viewport with the copy beside it, using the viewport's real
 * aspect so the framing holds from a laptop to an ultrawide.
 */

/** Local offset inside a group turned by `yaw` about Y. */
export const toWorld = (b, [lx, ly, lz]) => [
  b.x + lx * Math.cos(b.yaw) + lz * Math.sin(b.yaw),
  ly,
  b.z - lx * Math.sin(b.yaw) + lz * Math.cos(b.yaw),
];

export const STOPS = [
  {
    id: "landing",
    // Far enough back to hold the hoarding, the city and the house in
    // one frame. This is the establishing shot and nothing else.
    free: { pos: [-4, 10.5, 41], look: [-1.5, 4.4, 2] },
    sway: 0.1,
  },
  {
    id: "about",
    frame: {
      at: toWorld(TOWN.billboard, [0, 5.5, 0.1]),
      yaw: TOWN.billboard.yaw,
      dist: 9.6,
    },
    sway: 0.06,
  },
  {
    // The one stop that is not a framed object: you stand in the middle
    // of the arc and look around.
    id: "experience",
    street: true,
    sway: 0.62,
  },
  {
    id: "skills",
    frame: {
      at: toWorld(TOWN.garage, [0, 1.9, 0.4]),
      yaw: TOWN.garage.yaw,
      dist: 9.4,
    },
    sway: 0.07,
  },
  {
    id: "projects",
    // Inside the house, at the desk. The approach runs through the
    // doorway, which is why the front wall is built around a hole.
    frame: {
      at: toWorld(TOWN.house, [0, SCREEN.y, SCREEN.z]),
      yaw: TOWN.house.yaw,
      dist: 3.1,
    },
    sway: 0.04,
  },
  {
    id: "contact",
    frame: {
      at: toWorld(TOWN.mail, [0, 1.45, 0]),
      yaw: TOWN.mail.yaw,
      dist: 7.4,
    },
    sway: 0.06,
  },
];

export const STOP_INDEX = Object.fromEntries(STOPS.map((s, i) => [s.id, i]));
