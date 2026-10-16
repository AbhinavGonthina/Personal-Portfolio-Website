import { box, cyl, HALF, merge } from "./geo";

/**
 * The car you arrive in.
 *
 * Built in the same frame a camera uses: the nose points down -Z, up
 * is +Y, and +X is therefore the right-hand side. That matters here
 * more than it usually would, because the whole sequence is "look
 * right, open the door, step out", and getting the handedness wrong
 * put the door on the left and the exit facing away from the town.
 *
 * Two numbers set everything else: the beltline, which is where the
 * bodywork stops and the glass starts, and the eye. The eye has to
 * sit well above the belt or the first thing you see on arriving is
 * the top of a door card filling the bottom half of the screen.
 */

const BELT = 1.0;
const GLASS_Y = 1.33;
const GLASS_H = 0.56;

export const CAR = {
  len: 4.6,
  wide: 1.9,
  roof: 1.66,
};

const HL = CAR.len / 2;
const HW = CAR.wide / 2;

/** The camera's seat, and the screen it is looking at, in car-local space. */
export const SEAT = [0.46, 1.32, 0.78];
export const SCREEN_AT = [0.46, 1.36, -0.6];
export const SCREEN = { w: 0.44, h: 0.28 };

/** Where the right-hand rear door is hinged, and how long the leaf is. */
export const HINGE = [HW - 0.02, 0, 0.1];
export const DOOR_LEN = 1.25;

/** The glass in a side opening, and the rail over the top of it. */
const pane = (x, z, len) => box(0.03, GLASS_H - 0.06, len, [x, GLASS_Y, z]);
const rail = (x, z, len) =>
  box(0.09, 0.06, len, [x, GLASS_Y + GLASS_H / 2 - 0.03, z]);

/**
 * The shell, the cabin and everything bolted to them, as three merged
 * buffers: painted bodywork, glass, and the few surfaces that glow.
 */
export function car() {
  const base = [];
  const lit = [];
  const glass = [];
  // Upholstery and headlining, kept apart from the bodywork. They are
  // the nearest things to the camera for the first four seconds, and
  // in the body's own paint - lit by a lamp a foot away - they read
  // as poured concrete.
  const trim = [];

  // Floor pan, then the lower body as a tub rather than a solid block.
  // Solid was cheaper and looked fine from outside, but from the back
  // seat the top of it became the floor - a cabin you sit on rather
  // than in, with your chin at the window line.
  base.push(box(CAR.wide, 0.12, CAR.len, [0, 0.4, 0]));
  for (const s of [-1, 1]) {
    base.push(box(0.13, 0.54, CAR.len, [s * (HW - 0.065), 0.73, 0]));
    base.push(box(CAR.wide, 0.54, 0.13, [0, 0.73, s * (HL - 0.065)]));
  }
  // Bulkhead under the dash and a tunnel down the middle, so the
  // footwells are not a view into an empty hull.
  base.push(box(CAR.wide, 0.5, 0.12, [0, 0.71, -HL + 1.5]));
  base.push(box(0.3, 0.2, CAR.len - 1.6, [0, 0.54, 0.3]));

  // Bonnet and boot, inset a little so the shoulder line reads.
  base.push(box(CAR.wide - 0.08, 0.3, 1.2, [0, BELT + 0.15, -HL + 0.6]));
  base.push(box(CAR.wide - 0.08, 0.26, 0.8, [0, BELT + 0.13, HL - 0.4]));

  // Six pillars and a roof. The openings between them are left as
  // openings - a solid panel where the window should be is the whole
  // difference between sitting in a car and sitting in a crate.
  for (const s of [-1, 1]) {
    const x = s * (HW - 0.05);
    base.push(box(0.1, GLASS_H + 0.06, 0.16, [x, GLASS_Y, -HL + 1.15]));
    base.push(box(0.09, GLASS_H + 0.06, 0.12, [x, GLASS_Y, 0.1]));
    base.push(box(0.12, GLASS_H + 0.06, 0.18, [x, GLASS_Y, HL - 0.95]));
    base.push(rail(x, -0.55, 0.95));
    glass.push(pane(s * (HW - 0.02), -0.55, 0.9));
  }
  // The left rear opening, which has no door that moves.
  base.push(rail(-HW + 0.04, 0.72, DOOR_LEN));
  glass.push(pane(-HW + 0.02, 0.72, DOOR_LEN - 0.1));

  base.push(box(CAR.wide, 0.07, 3.0, [0, CAR.roof, 0.05]));
  trim.push(box(CAR.wide - 0.16, 0.03, 2.84, [0, CAR.roof - 0.06, 0.05]));

  // Windscreen and rear window, both raked.
  glass.push(
    box(CAR.wide - 0.22, 0.66, 0.03, [0, GLASS_Y, -HL + 1.2], [0.4, 0, 0]),
  );
  glass.push(
    box(CAR.wide - 0.26, 0.6, 0.03, [0, GLASS_Y, HL - 0.98], [-0.36, 0, 0]),
  );

  // Dashboard and wheel, and the glow off the instruments. The glow is
  // kept small: a basic material with bloom behind it is the brightest
  // thing in the scene whatever size it is drawn at.
  trim.push(box(CAR.wide - 0.14, 0.26, 0.34, [0, 1.17, -HL + 1.38]));
  base.push(cyl(0.16, 0.16, 0.04, 14, [-0.44, 1.2, -HL + 1.62], [-0.4, 0, 0]));
  base.push(cyl(0.03, 0.03, 0.2, 8, [-0.44, 1.12, -HL + 1.54], [-0.4, 0, 0]));
  lit.push(box(0.14, 0.03, 0.02, [-0.44, 1.23, -HL + 1.42], [0.42, 0, 0]));
  lit.push(box(0.1, 0.025, 0.02, [0.26, 1.22, -HL + 1.42], [0.42, 0, 0]));

  // Front seats. The right-hand one is the thing you spend the first
  // three seconds looking at, so its headrest carries the screen.
  for (const s of [-1, 1]) {
    const x = s * 0.46;
    trim.push(box(0.58, 0.14, 0.56, [x, 0.6, -0.5]));
    trim.push(box(0.58, 0.7, 0.16, [x, 1.0, -0.78], [-0.1, 0, 0]));
    trim.push(box(0.44, 0.3, 0.14, [x, 1.4, -0.72]));
    base.push(box(0.04, 0.1, 0.04, [x - 0.11, 1.26, -0.72]));
    base.push(box(0.04, 0.1, 0.04, [x + 0.11, 1.26, -0.72]));
  }

  // The rear bench, which is what you are sitting on.
  trim.push(box(CAR.wide - 0.26, 0.16, 0.62, [0, 0.6, 0.82]));
  trim.push(box(CAR.wide - 0.26, 0.72, 0.16, [0, 1.02, 1.14], [-0.1, 0, 0]));
  for (const s of [-1, 1]) {
    trim.push(box(0.4, 0.26, 0.12, [s * 0.46, 1.42, 1.1]));
  }

  // Wheels, lamps, mirrors.
  for (const s of [-1, 1]) {
    for (const z of [-1.25, 1.25]) {
      base.push(cyl(0.34, 0.34, 0.2, 16, [s * HW, 0.34, z], [0, 0, HALF]));
      base.push(cyl(0.15, 0.15, 0.22, 10, [s * HW, 0.34, z], [0, 0, HALF]));
    }
    lit.push(box(0.34, 0.13, 0.05, [s * 0.56, 0.88, -HL - 0.01]));
    lit.push(box(0.28, 0.1, 0.05, [s * 0.6, 0.92, HL + 0.01]));
    base.push(box(0.16, 0.1, 0.06, [s * (HW + 0.09), 1.24, -HL + 1.3]));
  }

  return {
    base: merge(base),
    trim: merge(trim),
    lit: merge(lit),
    glass: merge(glass),
  };
}

/**
 * The right-hand rear door, as a leaf and its pane.
 *
 * Both are built running from the origin along +Z, because the group
 * that holds them is the hinge: a door modelled around its own centre
 * swings a quarter of itself through the back seat.
 */
export function carDoor() {
  const c = DOOR_LEN / 2;
  return {
    base: merge([
      // Skin below the belt, then a frame around the window.
      box(0.1, 0.54, DOOR_LEN, [0, 0.73, c]),
      box(0.09, 0.06, DOOR_LEN, [0.01, GLASS_Y + GLASS_H / 2 - 0.03, c]),
      box(0.08, GLASS_H, 0.07, [0.01, GLASS_Y, 0.035]),
      box(0.08, GLASS_H, 0.07, [0.01, GLASS_Y, DOOR_LEN - 0.035]),
      // Handle, on the outside.
      box(0.13, 0.05, 0.16, [0.06, BELT - 0.14, c - 0.44]),
    ]),
    trim: merge([
      // Armrest and door card, on the inside.
      box(0.1, 0.07, 0.42, [-0.05, BELT - 0.06, c - 0.1]),
      box(0.08, 0.3, DOOR_LEN - 0.12, [-0.04, 0.84, c]),
    ]),
    glass: merge([
      box(0.03, GLASS_H - 0.1, DOOR_LEN - 0.18, [0.02, GLASS_Y - 0.02, c]),
    ]),
  };
}

/** The bezel the headrest screen sits in. */
export function headrestScreen() {
  return merge([box(SCREEN.w + 0.05, SCREEN.h + 0.05, 0.03, [0, 0, 0])]);
}
