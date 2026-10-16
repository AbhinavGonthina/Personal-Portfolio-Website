import { ball, box, cyl, HALF, merge } from "./geo";

/**
 * The car you arrive in.
 *
 * Built in its own local frame: +Z is the nose, +X is the passenger
 * side, and the rear bench is at -Z. The camera starts in the
 * back-right seat looking at the headrest in front of it, so the
 * inside is where the detail went - the outside only has to hold up
 * for the second and a half it takes to step away from it.
 *
 * Doors are returned separately because the right one opens.
 */

export const CAR = {
  len: 4.5,
  wide: 1.94,
  tall: 1.46,
  cabinY: 1.42,
};

/** Where the camera sits, and what it looks at, in car-local space. */
export const SEAT = [0.44, 1.18, -0.78];
// On the back of the headrest, not floating in front of it.
export const HEADREST = [0.44, 1.26, 0.63];
export const DOORWAY = [1.55, 1.12, -0.6];
export const SCREEN = { w: 0.46, h: 0.3 };

const T = 0.07;

/** The body, cabin and everything bolted to them. */
export function car() {
  const base = [];
  const lit = [];
  const glass = [];
  const hw = CAR.wide / 2;
  const hl = CAR.len / 2;

  // Floor pan and sills.
  base.push(box(CAR.wide, 0.12, CAR.len, [0, 0.42, 0]));
  for (const s of [-1, 1]) {
    base.push(box(0.14, 0.4, CAR.len - 0.3, [s * (hw - 0.07), 0.62, 0]));
  }

  // Lower body, front and rear ends.
  base.push(box(CAR.wide, 0.62, CAR.len, [0, 0.78, 0]));
  base.push(box(CAR.wide - 0.1, 0.42, 0.5, [0, 1.12, hl - 0.25]));
  base.push(box(CAR.wide - 0.1, 0.38, 0.4, [0, 1.1, -hl + 0.2]));

  // Cabin: four pillars, a roof and a headliner.
  for (const s of [-1, 1]) {
    base.push(
      box(0.1, 0.62, 0.12, [s * (hw - 0.06), CAR.cabinY - 0.2, hl - 0.75]),
    );
    base.push(box(0.09, 0.62, 0.1, [s * (hw - 0.06), CAR.cabinY - 0.2, -0.05]));
    base.push(
      box(0.11, 0.62, 0.14, [s * (hw - 0.06), CAR.cabinY - 0.2, -hl + 0.65]),
    );
  }
  base.push(box(CAR.wide, T, CAR.len - 1.1, [0, CAR.cabinY + 0.12, -0.1]));
  base.push(
    box(CAR.wide - 0.16, 0.03, CAR.len - 1.3, [0, CAR.cabinY + 0.07, -0.1]),
  );

  // Glass: windscreen, rear window, and a pane in each door opening.
  glass.push(
    box(
      CAR.wide - 0.2,
      0.6,
      0.03,
      [0, CAR.cabinY - 0.18, hl - 0.78],
      [-0.42, 0, 0],
    ),
  );
  glass.push(
    box(
      CAR.wide - 0.24,
      0.52,
      0.03,
      [0, CAR.cabinY - 0.2, -hl + 0.68],
      [0.38, 0, 0],
    ),
  );
  glass.push(box(0.03, 0.5, 0.95, [-hw + 0.04, CAR.cabinY - 0.22, -0.78]));

  // Dashboard, wheel and a pair of front seats.
  base.push(box(CAR.wide - 0.2, 0.26, 0.4, [0, 1.12, hl - 0.6]));
  base.push(cyl(0.17, 0.17, 0.04, 16, [-0.42, 1.14, hl - 0.95], [0.42, 0, 0]));
  base.push(cyl(0.03, 0.03, 0.22, 8, [-0.42, 1.06, hl - 0.86], [0.42, 0, 0]));
  lit.push(box(0.3, 0.1, 0.02, [0.1, 1.18, hl - 0.82], [-0.42, 0, 0]));

  for (const s of [-1, 1]) {
    const x = s * 0.44;
    // Base, back and headrest.
    base.push(box(0.6, 0.14, 0.56, [x, 0.62, 0.52]));
    base.push(box(0.6, 0.62, 0.16, [x, 0.98, 0.76], [0.12, 0, 0]));
    base.push(box(0.46, 0.3, 0.14, [x, 1.26, 0.72]));
    base.push(box(0.05, 0.1, 0.05, [x - 0.1, 1.1, 0.72]));
    base.push(box(0.05, 0.1, 0.05, [x + 0.1, 1.1, 0.72]));
  }

  // Rear bench, which is what the camera is sitting on.
  base.push(box(CAR.wide - 0.3, 0.16, 0.62, [0, 0.62, -0.78]));
  base.push(box(CAR.wide - 0.3, 0.66, 0.16, [0, 1, -1.06], [0.1, 0, 0]));
  for (const s of [-1, 1]) {
    base.push(box(0.42, 0.26, 0.13, [s * 0.44, 1.3, -1.02]));
  }

  // Wheels, lights, mirrors.
  for (const [x, z] of [
    [-hw, hl - 1.1],
    [hw, hl - 1.1],
    [-hw, -hl + 1.1],
    [hw, -hl + 1.1],
  ]) {
    base.push(cyl(0.36, 0.36, 0.22, 18, [x, 0.36, z], [0, 0, HALF]));
    base.push(cyl(0.17, 0.17, 0.24, 10, [x, 0.36, z], [0, 0, HALF]));
  }
  for (const s of [-1, 1]) {
    lit.push(box(0.36, 0.14, 0.05, [s * 0.56, 0.95, hl + 0.01]));
    lit.push(box(0.3, 0.1, 0.05, [s * 0.6, 0.98, -hl - 0.01]));
    base.push(box(0.16, 0.1, 0.06, [s * (hw + 0.1), 1.16, hl - 1.0]));
  }

  return { base: merge(base), lit: merge(lit), glass: merge(glass) };
}

/**
 * A door leaf, hinged at its front edge. Built forward of the origin
 * so the group can be the hinge - a door modelled around its own
 * centre swings through the car when you rotate it.
 */
export function carDoor() {
  const hl = CAR.len / 2;
  const parts = [
    box(0.1, 0.62, 1.42, [0, 0.78, -0.71]),
    box(0.08, 0.5, 1.3, [0.02, CAR.cabinY - 0.22, -0.71]),
    box(0.12, 0.08, 0.3, [-0.03, 0.92, -0.9]),
    box(0.1, 0.16, 0.5, [-0.04, 0.66, -0.6]),
  ];
  return { geo: merge(parts), hinge: [0, 0, hl - 0.78] };
}

/** The screen on the back of the headrest in front of you. */
export function headrestScreen() {
  return merge([
    box(SCREEN.w + 0.05, SCREEN.h + 0.05, 0.03, [0, 0, 0]),
    ball(0.015, [0, -SCREEN.h / 2 - 0.05, 0.01]),
  ]);
}
