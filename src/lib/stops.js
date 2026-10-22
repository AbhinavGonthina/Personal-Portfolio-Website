import { BOARD, DESK, HOUSE, TOWN, WALL_PANEL } from "./townLayout";

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
    // This one looks around like the rest of the town does.
    //
    // It was held still for a while, on the grounds that the board
    // is pointed at rather than looked at and a surface you aim at
    // should not drift under the pointer. True as far as it goes,
    // but it cost the room every bit of life it had: both walls
    // inside the house went dead at once and the whole indoor
    // stretch stopped responding to the mouse at all. Pointing at a
    // tag here is a hover that costs nothing to retry, which is not
    // the same as the desk, where you are dragging a list and
    // clicking cards.
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
    //
    // There used to be a second, identical stop after this one, so
    // that a viewport of scrolling could walk the list without
    // moving the camera. The monitor takes its own wheel now, so
    // that stop was a viewport of page you scrolled through for no
    // visible reason.
    id: "projects",
    title: "Projects",
    // The one stop in the town that does not look around, and the
    // only one that has earned it.
    //
    // The look-around swings the panel by a fifth of a radian as
    // the cursor crosses it. Everywhere else that is parallax; here
    // it is a fight. The list is dragged by hand, so the camera
    // moves along the same axis as the drag and pulls against it
    // the whole way, and every card is a click target that has
    // moved by the time you reach it. Skills is pointed at too, but
    // a hover there costs nothing to retry - this one you are
    // holding on to.
    sway: 0,
    rise: 0,
    frame: {
      // Aimed a hand above the middle of the monitor, which is what
      // puts the monitor itself low enough in the shot to clear the
      // section plate in the top left corner.
      //
      // Raising `eye` does not do this. The camera looks at `at`
      // whatever height it is standing at, so lifting the eye just
      // tilts the view back down and the panel stays exactly where
      // it was, now keystoned. Moving the aim is the thing that
      // moves the subject in the frame.
      at: toWorld(TOWN.house, [DESK.x - 0.06, DESK.y + 0.1, DESK.z]),
      yaw: TOWN.house.yaw - Math.PI / 2,
      // Close enough that the screen is most of the shot, the way you
      // actually sit at an ultrawide.
      dist: 2.4,
      centred: true,
      // Level with the middle of the panel.
      eye: DESK.y,
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
