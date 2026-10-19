import { BOARD, DESK, HOUSE, TOWN, WALL_PANEL } from "./townGeometry";

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
// Through the door and well past it. Contact looks sixteen units
// down the path on its way out, which is why leaving the house reads
// as walking: the aim is pointed where the feet are going. This is
// the same idea coming in. At 2.0 it was a point short of the door
// the camera was about to pass through, so the aim swung hard all
// the way in and the approach read as a slow pan rather than a walk.
const DOORWAY = toWorld(TOWN.house, [0, EYE_IN, -2.2]);

export const STOPS = [
  {
    // The establishing shot, from the pavement: the house off to the
    // left, the city ahead, the hoarding to the right. Eye level, like
    // everything else.
    id: "landing",
    ...shot([-1.5, EYE + 0.25, 30], [-1, 2.6, 2]),
  },
  {
    // Square on to the hoarding. The board carries its own words, so
    // the camera does not have to leave room for a column of copy.
    id: "about",
    title: "Who I am",
    frame: {
      at: toWorld(TOWN.billboard, [0, BOARD.y + BOARD.h / 2, 0]),
      yaw: TOWN.billboard.yaw,
      dist: 9.2,
      centred: true,
      // No `eye` here, which is the whole difference. A centred frame
      // already defaults to the subject's own height, and this stop
      // was overriding that back down to standing - so the one shot
      // on the walk whose whole job is to be read was read from
      // underneath, with the type keystoning away towards the top.
      // The rest of the town keeps its feet on the ground.
    },
  },
  {
    // The one stop that is not a framed object: you stand in the
    // middle of the arc and look around.
    id: "experience",
    title: "Experience",
    street: true,
    // Looking about is the activity here, not a garnish on a shot.
    sway: 0.62,
    rise: 0.22,
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
    // Still, unlike every other stop.
    //
    // The board here is pointed at rather than looked at: each tag
    // is a target a few millimetres across on screen, and the usual
    // look-around swings the whole wall by a fifth of a radian as
    // the cursor crosses it. The tag you aimed at has moved by the
    // time you arrive, and then moves again as the damping settles.
    // A surface you are meant to point at cannot drift under the
    // pointer.
    sway: 0,
    rise: 0,
    frame: {
      at: toWorld(TOWN.house, [WALL_PANEL.x, WALL_PANEL.y, -HOUSE.d / 2 + 0.2]),
      yaw: TOWN.house.yaw,
      dist: 3.2,
      centred: true,
      eye: EYE_IN,
    },
    via: DOORSTEP,
    viaLook: DOORWAY,
    // Turn first, then go. Without this the turn is spread evenly
    // over the whole approach, so the camera drifts sideways into
    // the house instead of facing it and walking in.
    pivot: true,
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
    // Looking straight down the path on the way out, not already
    // swung round to the boxes. You leave the house walking forwards
    // and then turn to them; turning on the threshold is how you walk
    // out of a door sideways.
    viaLook: toWorld(TOWN.house, [0, EYE, 16]),
  },
];

export const STOP = Object.fromEntries(STOPS.map((s, i) => [s.id, i]));
