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
 * Three numbers set everything else. BELT is where the bodywork stops
 * and the glass starts, ROOFLINE is where the glass stops, and the eye
 * sits between them with room to spare. Every pillar, rail and pane -
 * on the shell and on the door that swings away from it - is measured
 * off those two, so the opening in the body and the frame in the door
 * meet instead of leaving a band of nothing between them.
 */

const BELT = 1.0;
const ROOFLINE = 1.64;
const GLASS_H = ROOFLINE - BELT - 0.06;
const GLASS_Y = BELT + GLASS_H / 2;
const RAIL_Y = ROOFLINE - 0.03;

export const CAR = {
  len: 4.6,
  wide: 1.9,
  roof: ROOFLINE + 0.035,
};

const HL = CAR.len / 2;
const HW = CAR.wide / 2;

/** The camera's seat, and the screen it is looking at, in car-local space. */
export const SEAT = [0.46, 1.34, 0.95];
export const SCREEN_AT = [0.46, 1.45, -0.255];
export const SCREEN = { w: 0.44, h: 0.28 };

/** Where the right-hand rear door is hinged, and how long the leaf is. */
export const HINGE = [HW - 0.02, 0, 0.1];
export const DOOR_LEN = 1.25;

/** The glass in a side opening, and the rail over the top of it. */
const pane = (x, z, len) => box(0.03, GLASS_H, len, [x, GLASS_Y, z]);
const rail = (x, z, len) => box(0.09, 0.06, len, [x, RAIL_Y, z]);

/**
 * The shell and everything bolted to it, as four merged buffers:
 * painted bodywork, upholstery, clear glass, and the two front
 * windows, which are not clear - see `tint` in the scene.
 */
export function car() {
  const base = [];
  const trim = [];
  const lit = [];
  const glass = [];
  const tint = [];

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

  // Six pillars and a roof. Each runs from just under the belt to the
  // roof, so there is no daylight where the body meets its own glass.
  for (const s of [-1, 1]) {
    const x = s * (HW - 0.05);
    const h = ROOFLINE - BELT + 0.02;
    const y = BELT - 0.01 + h / 2;
    base.push(box(0.1, h, 0.16, [x, y, -HL + 1.15]));
    base.push(box(0.09, h, 0.12, [x, y, 0.1]));
    base.push(box(0.12, h, 0.18, [x, y, HL - 0.95]));
    base.push(rail(x, -0.55, 0.95));
    tint.push(pane(s * (HW - 0.02), -0.55, 0.9));
  }
  // The left rear opening, which has no door that moves.
  base.push(rail(-HW + 0.04, 0.72, DOOR_LEN));
  glass.push(pane(-HW + 0.02, 0.72, DOOR_LEN - 0.1));

  base.push(box(CAR.wide, 0.07, 3.0, [0, CAR.roof, 0.05]));
  trim.push(box(CAR.wide - 0.16, 0.03, 2.84, [0, CAR.roof - 0.06, 0.05]));

  // Windscreen and rear window, both raked.
  tint.push(
    box(CAR.wide - 0.22, 0.68, 0.03, [0, GLASS_Y, -HL + 1.2], [0.4, 0, 0]),
  );
  glass.push(
    box(CAR.wide - 0.26, 0.62, 0.03, [0, GLASS_Y, HL - 0.98], [-0.36, 0, 0]),
  );

  // Dashboard and wheel, right forward under the screen. They used to
  // sit a hand's width off the front seats, which from behind meant a
  // steering wheel hanging through the driver's back.
  trim.push(box(CAR.wide - 0.14, 0.26, 0.26, [0, 1.04, -1.14]));
  base.push(cyl(0.16, 0.16, 0.04, 14, [-0.44, 1.06, -0.92], [-0.4, 0, 0]));
  base.push(cyl(0.03, 0.03, 0.2, 8, [-0.44, 0.99, -1.01], [-0.4, 0, 0]));
  // Instrument spill along the top of the dash. Kept thin: a basic
  // material with bloom behind it is the brightest thing in the scene
  // whatever size it is drawn at.
  lit.push(box(0.34, 0.012, 0.07, [-0.34, 1.176, -1.1]));

  // Front seats, facing the front.
  //
  // They used to have the cushion behind the backrest, which from the
  // row behind is a seat someone would be sitting in backwards. The
  // cushion runs forward from the squab now, the recline leans the
  // top away towards the windscreen, and the headrest stands clear on
  // two posts instead of sinking into the shoulders.
  for (const s of [-1, 1]) {
    const x = s * 0.46;
    trim.push(box(0.6, 0.14, 0.52, [x, 0.6, -0.72]));
    trim.push(box(0.62, 0.63, 0.16, [x, 0.945, -0.38], [-0.07, 0, 0]));
    base.push(box(0.045, 0.12, 0.045, [x - 0.12, 1.29, -0.36]));
    base.push(box(0.045, 0.12, 0.045, [x + 0.12, 1.29, -0.36]));
    trim.push(box(0.44, 0.26, 0.15, [x, 1.45, -0.34]));
  }

  // The rear bench, which is what you are sitting on. Same way round.
  trim.push(box(CAR.wide - 0.26, 0.16, 0.58, [0, 0.6, 0.8]));
  trim.push(box(CAR.wide - 0.26, 0.72, 0.16, [0, 1.02, 1.22], [0.07, 0, 0]));
  for (const s of [-1, 1]) {
    base.push(box(0.045, 0.1, 0.045, [s * 0.46 - 0.11, 1.31, 1.2]));
    base.push(box(0.045, 0.1, 0.045, [s * 0.46 + 0.11, 1.31, 1.2]));
    trim.push(box(0.4, 0.24, 0.13, [s * 0.46, 1.45, 1.2]));
  }

  // Wheels, lamps, mirrors.
  for (const s of [-1, 1]) {
    for (const z of [-1.25, 1.25]) {
      base.push(cyl(0.34, 0.34, 0.2, 16, [s * HW, 0.34, z], [0, 0, HALF]));
      base.push(cyl(0.15, 0.15, 0.22, 10, [s * HW, 0.34, z], [0, 0, HALF]));
    }
    lit.push(box(0.34, 0.13, 0.05, [s * 0.56, 0.88, -HL - 0.01]));
    lit.push(box(0.28, 0.1, 0.05, [s * 0.6, 0.92, HL + 0.01]));
    base.push(box(0.16, 0.1, 0.06, [s * (HW + 0.09), 1.2, -HL + 1.3]));
  }

  return {
    base: merge(base),
    trim: merge(trim),
    lit: merge(lit),
    glass: merge(glass),
    tint: merge(tint),
  };
}

/**
 * The right-hand rear door, as a leaf and its pane.
 *
 * Both are built running from the origin along +Z, because the group
 * that holds them is the hinge: a door modelled around its own centre
 * swings a quarter of itself through the back seat. The frame starts
 * at the belt and ends at the roofline, the same two numbers the
 * opening it fills is cut to.
 */
export function carDoor() {
  const c = DOOR_LEN / 2;
  const h = ROOFLINE - BELT + 0.02;
  const y = BELT - 0.01 + h / 2;
  return {
    base: merge([
      // Skin below the belt, then a frame around the window.
      box(0.1, 0.56, DOOR_LEN, [0, 0.74, c]),
      box(0.09, 0.06, DOOR_LEN, [0.01, RAIL_Y, c]),
      box(0.08, h, 0.07, [0.01, y, 0.035]),
      box(0.08, h, 0.07, [0.01, y, DOOR_LEN - 0.035]),
      // Handle, on the outside.
      box(0.13, 0.05, 0.16, [0.06, BELT - 0.14, c - 0.44]),
    ]),
    trim: merge([
      // Armrest and door card, on the inside.
      box(0.1, 0.07, 0.42, [-0.05, BELT - 0.06, c - 0.1]),
      box(0.08, 0.34, DOOR_LEN - 0.12, [-0.04, 0.81, c]),
    ]),
    glass: merge([box(0.03, GLASS_H, DOOR_LEN - 0.18, [0.02, GLASS_Y, c])]),
  };
}

/** The bezel the headrest screen sits in. */
export function headrestScreen() {
  return merge([box(SCREEN.w + 0.05, SCREEN.h + 0.05, 0.03, [0, 0, 0])]);
}
