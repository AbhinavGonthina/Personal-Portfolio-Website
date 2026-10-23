import * as THREE from "three";
import {
  ball,
  box,
  cone,
  cyl,
  HALF,
  merge,
  place,
  polyline,
  ring,
} from "./geo";

/**
 * The roof emblems, built as geometry rather than as components.
 *
 * Each one is thirty-odd primitives - a fuselage with engines and
 * winglets, a bed with a patient under a blanket, a palm with a bent
 * trunk and coconuts - and all of them are baked into two merged
 * buffers, one dull and one lit. So an emblem costs two draw calls no
 * matter how much detail goes into it, which is the only reason it can
 * have this much. Built the naive way, eight of these would have put
 * two hundred extra meshes on a page that already reported stutter.
 *
 * Everything sits inside roughly a one-unit cube, upright, facing +Z.
 */

// `?? ` and not a default parameter: callers pass an explicit null to
// skip a rotation while still supplying a scale, and a default only
// fires on undefined.

/* ------------------------------------------------------------------ */

/**
 * An airliner, seen as a shape rather than as a model.
 *
 * The first one was a scale drawing: a long thin fuselage, swept
 * wings, engines on pylons. At the size this is actually seen it read
 * as a red cigar. This one is stubbier and the wings are twice the
 * chord, which is what makes it an aeroplane from across the street.
 */
function plane() {
  const base = [];
  const lit = [];

  base.push(cyl(0.11, 0.115, 0.6, 14, [0, 0, 0], [HALF, 0, 0]));
  // Both cones used to have their apex pointing inward, which left
  // the plane flared at both ends - a nose that widens toward the
  // front reads as a funnel pointing the wrong way. A cone's apex
  // is at +Y, so +90 about X aims it at +Z and -90 at -Z: the nose
  // takes the first and the tail the second.
  base.push(cone(0.115, 0.26, 14, [0, 0, 0.42], [HALF, 0, 0]));
  base.push(cone(0.11, 0.3, 14, [0, 0.055, -0.42], [-HALF, 0, 0]));

  // One slab per side, wide in chord and only lightly swept. A narrow
  // wing disappears at this distance; a broad one reads instantly.
  for (const side of [-1, 1]) {
    base.push(
      box(0.46, 0.035, 0.34, [side * 0.3, -0.02, -0.02], [0, side * 0.22, 0]),
    );
    base.push(
      box(0.04, 0.12, 0.16, [side * 0.52, 0.055, -0.08], [0, side * 0.22, 0]),
    );
    base.push(
      box(0.22, 0.03, 0.16, [side * 0.15, 0.075, -0.44], [0, side * 0.26, 0]),
    );
  }

  // Tall fin, because the silhouette needs something above the line.
  base.push(box(0.035, 0.3, 0.26, [0, 0.21, -0.38], [0.3, 0, 0]));

  for (const side of [-1, 1]) {
    lit.push(box(0.016, 0.03, 0.42, [side * 0.105, 0.03, 0.04]));
    lit.push(
      cyl(0.055, 0.055, 0.14, 12, [side * 0.27, -0.1, 0.04], [HALF, 0, 0]),
    );
  }
  lit.push(ball(0.028, [0, -0.06, 0.5]));

  return { base: merge(base), lit: merge(lit) };
}

/** A lumpy cumulus. The rain is separate, because it falls. */
function cloud() {
  // Sat high in its own cube, because the drops need somewhere to fall
  // that is not the inside of the building.
  const Y = 0.3;
  const base = [
    ball(0.17, [-0.26, Y - 0.01, 0], null, [1, 0.72, 0.85]),
    ball(0.21, [-0.05, Y + 0.05, 0.02], null, [1, 0.76, 0.88]),
    ball(0.16, [0.17, Y + 0.02, -0.03], null, [1, 0.74, 0.86]),
    ball(0.13, [0.3, Y - 0.04, 0.02], null, [1, 0.7, 0.84]),
    ball(0.12, [0.03, Y + 0.14, -0.04], null, [1, 0.72, 0.8]),
    ball(0.1, [-0.15, Y + 0.11, 0.04], null, [1, 0.7, 0.82]),
  ];
  // Rain, hanging rather than falling. Animated it drew the eye to a
  // corner of the skyline and held it there, which is a lot of
  // attention for a weather effect on a logo.
  const drops = [
    [-0.26, 0],
    [-0.12, -0.11],
    [0.02, -0.22],
    [0.16, -0.05],
    [0.28, -0.16],
    [-0.04, -0.3],
    [0.22, -0.26],
  ].map(([x, y]) => box(0.018, 0.11, 0.018, [x, Y + y - 0.26, 0]));

  return { base: merge(base), lit: merge(drops) };
}

/**
 * A bedside monitor and the bed it is watching: frame, mattress, pillow,
 * a patient under a blanket, a drip stand, and a trace on the screen.
 */
const SCREEN = [0.44, 0.18, 0.02];
const SCREEN_ROT = [0, -0.5, 0];
const SCREEN_W = 0.26;

function ward() {
  const base = [];
  const lit = [];

  // Bed, lying along X with the head at -X.
  base.push(box(0.74, 0.05, 0.3, [-0.12, -0.12, 0]));
  base.push(box(0.7, 0.042, 0.27, [-0.12, -0.082, 0]));
  for (const x of [-0.45, 0.2]) {
    for (const z of [-0.12, 0.12]) {
      base.push(box(0.026, 0.18, 0.026, [x, -0.22, z]));
      base.push(cyl(0.028, 0.028, 0.018, 8, [x, -0.315, z], [0, 0, HALF]));
    }
  }
  // Head and foot rails.
  base.push(box(0.026, 0.16, 0.28, [-0.48, -0.03, 0]));
  for (const z of [-0.1, 0.1])
    base.push(box(0.02, 0.1, 0.02, [-0.48, -0.03, z]));
  base.push(box(0.026, 0.09, 0.28, [0.24, -0.075, 0]));

  // The patient: a head on the pillow, a mound under a blanket.
  base.push(box(0.16, 0.042, 0.2, [-0.39, -0.038, 0], [0, 0, 0.1]));
  base.push(ball(0.058, [-0.37, 0.012, 0]));
  base.push(ball(0.095, [-0.2, -0.03, 0], null, [1.5, 0.62, 1.15]));
  base.push(box(0.42, 0.055, 0.23, [-0.03, -0.035, 0]));
  base.push(box(0.43, 0.012, 0.235, [-0.03, -0.006, 0]));

  // Monitor on a wheeled stand at the foot of the bed.
  base.push(cyl(0.1, 0.11, 0.015, 12, [0.44, -0.3, 0]));
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    base.push(
      cyl(
        0.02,
        0.02,
        0.018,
        8,
        [0.44 + Math.cos(a) * 0.1, -0.308, Math.sin(a) * 0.1],
        [0, 0, HALF],
      ),
    );
  }
  base.push(cyl(0.018, 0.02, 0.4, 10, [0.44, -0.095, 0]));
  base.push(box(0.34, 0.26, 0.055, SCREEN, SCREEN_ROT));
  base.push(box(0.09, 0.028, 0.04, [0.44, 0.03, 0], SCREEN_ROT));

  // A drip stand behind the head of the bed.
  base.push(cyl(0.012, 0.014, 0.62, 8, [-0.52, 0.0, -0.1]));
  base.push(cyl(0.07, 0.075, 0.012, 10, [-0.52, -0.305, -0.1]));
  base.push(box(0.055, 0.1, 0.045, [-0.455, 0.23, -0.1]));
  base.push(cyl(0.004, 0.004, 0.3, 6, [-0.44, 0.03, -0.07], [0, 0, 0.18]));

  // Lit: the glass, the bed lamp, the drip bag, three vital readouts.
  lit.push(box(0.285, 0.205, 0.012, [0.4475, 0.18, 0.0465], SCREEN_ROT));
  lit.push(box(0.044, 0.085, 0.012, [-0.4555, 0.23, -0.1]));
  lit.push(box(0.2, 0.012, 0.05, [-0.32, 0.22, -0.085]));

  const trace = polyline(
    [
      [-0.12, 0.01],
      [-0.095, 0.01],
      [-0.083, 0.028],
      [-0.07, -0.004],
      [-0.057, 0.07],
      [-0.044, -0.03],
      [-0.031, 0.016],
      [-0.005, 0.01],
      [0.02, 0.01],
      [0.032, 0.028],
      [0.045, -0.004],
      [0.058, 0.07],
      [0.071, -0.03],
      [0.084, 0.016],
      [0.12, 0.01],
    ],
    0.009,
  ).concat(
    polyline(
      [
        [-0.12, -0.055],
        [-0.06, -0.055],
        [-0.04, -0.03],
        [-0.02, -0.055],
        [0.03, -0.055],
        [0.05, -0.03],
        [0.07, -0.055],
        [0.12, -0.055],
      ],
      0.007,
    ),
  );
  place(trace, [0.4435, 0.18, 0.0525], SCREEN_ROT);
  lit.push(...trace);

  // The sweep bar is the only part that moves, and it is built in the
  // screen's own frame so the component can slide it along X without it
  // ever leaving the glass.
  const sweep = box(0.008, 0.19, 0.004);

  return {
    base: merge(base),
    lit: merge(lit),
    sweep,
    sweepAt: [0.4435, 0.18, 0.054],
    sweepRot: SCREEN_ROT,
    sweepSpan: SCREEN_W / 2 - 0.012,
  };
}

/** A patient chart on a clipboard: the record, not the hardware. */
function chart() {
  const base = [
    box(0.5, 0.66, 0.035),
    box(0.46, 0.6, 0.012, [0, -0.02, 0.024]),
    box(0.2, 0.07, 0.045, [0, 0.33, 0.01]),
    box(0.1, 0.05, 0.06, [0, 0.36, 0.01]),
    ring(0.055, 0.012, [0, 0.36, 0.045], [HALF, 0, 0]),
  ];
  const lit = [
    box(0.055, 0.19, 0.01, [-0.11, 0.1, 0.032]),
    box(0.19, 0.055, 0.01, [-0.11, 0.1, 0.032]),
    box(0.17, 0.016, 0.01, [0.07, 0.15, 0.032]),
    box(0.13, 0.016, 0.01, [0.05, 0.1, 0.032]),
  ];
  // A pulse across the lower half of the sheet.
  const beat = [
    [-0.18, -0.12],
    [-0.08, -0.12],
    [-0.05, -0.07],
    [-0.02, -0.17],
    [0.01, -0.02],
    [0.04, -0.2],
    [0.07, -0.12],
    [0.18, -0.12],
  ];
  for (let i = 0; i < beat.length - 1; i++) {
    const [x1, y1] = beat[i];
    const [x2, y2] = beat[i + 1];
    lit.push(
      box(
        Math.hypot(x2 - x1, y2 - y1),
        0.014,
        0.01,
        [(x1 + x2) / 2, (y1 + y2) / 2, 0.032],
        [0, 0, Math.atan2(y2 - y1, x2 - x1)],
      ),
    );
  }
  return { base: merge(base), lit: merge(lit) };
}

/** An open-wheel racer: front and rear wings, sidepods, roll hoop. */
function car() {
  const base = [];
  const lit = [];

  base.push(box(0.17, 0.07, 0.42, [0, 0.015, 0.02]));
  base.push(box(0.21, 0.09, 0.26, [0, 0.035, -0.17]));
  base.push(cone(0.072, 0.3, 10, [0, 0.01, 0.37], [-HALF, 0, 0]));

  base.push(box(0.46, 0.018, 0.1, [0, -0.03, 0.47]));
  base.push(box(0.4, 0.02, 0.07, [0, 0.01, 0.48], [0.22, 0, 0]));
  for (const side of [-1, 1]) {
    base.push(box(0.016, 0.09, 0.12, [side * 0.23, 0.005, 0.47]));
    base.push(box(0.016, 0.1, 0.17, [side * 0.21, 0.08, -0.4]));
    base.push(box(0.11, 0.08, 0.28, [side * 0.14, 0.015, -0.09], [0, 0, 0]));
  }

  base.push(box(0.36, 0.02, 0.14, [0, 0.16, -0.42]));
  base.push(box(0.32, 0.018, 0.1, [0, 0.12, -0.41], [-0.3, 0, 0]));
  base.push(box(0.14, 0.11, 0.1, [0, 0.11, -0.2], [0.2, 0, 0]));
  base.push(cone(0.055, 0.1, 8, [0, 0.185, -0.21], [-0.3, 0, 0]));
  base.push(box(0.23, 0.03, 0.17, [0, -0.025, -0.4], [0.25, 0, 0]));

  for (const [x, z] of [
    [-0.23, 0.26],
    [0.23, 0.26],
    [-0.24, -0.26],
    [0.24, -0.26],
  ]) {
    base.push(cyl(0.11, 0.11, 0.1, 14, [x, 0.0, z], [0, 0, HALF]));
    lit.push(cyl(0.045, 0.045, 0.104, 10, [x, 0.0, z], [0, 0, HALF]));
  }

  lit.push(box(0.12, 0.035, 0.012, [0, 0.055, 0.215]));
  lit.push(box(0.08, 0.025, 0.012, [0, 0.07, -0.49]));

  return { base: merge(base), lit: merge(lit) };
}

/** A palm on a sand mound: bent trunk, drooping fronds, coconuts. */
function palm() {
  const base = [];
  const lit = [];

  base.push(ball(0.3, [0, -0.52, 0], null, [1, 0.3, 1]));

  // The trunk is a stack of short segments walked along a curve, which
  // is how it gets a lean instead of standing like a pipe.
  let x = 0;
  let y = -0.45;
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const lean = 0.1 * t * t;
    x += lean * 0.5;
    const h = 0.14;
    base.push(
      cyl(
        0.05 - t * 0.016,
        0.058 - t * 0.016,
        h + 0.02,
        8,
        [x, y, 0],
        [0, 0, -lean],
      ),
    );
    y += h;
  }

  const crown = [x + 0.03, y + 0.02, 0];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    // Well past horizontal, and alternating, so the crown arches over
    // instead of standing up in a star.
    const droop = -1.72 - (i % 2) * 0.3;
    const reach = 0.3;
    const p = [
      crown[0] + Math.cos(a) * reach,
      crown[1] - 0.03 - (i % 2) * 0.05,
      crown[2] + Math.sin(a) * reach,
    ];
    base.push(cone(0.1, 0.58, 6, p, [0, -a, droop], [1, 1, 0.3]));
    lit.push(cone(0.03, 0.54, 5, p, [0, -a, droop], [1, 1, 0.26]));
  }
  for (const [dx, dz] of [
    [0.06, 0.05],
    [-0.05, 0.07],
    [0.01, -0.07],
  ]) {
    base.push(ball(0.04, [crown[0] + dx, crown[1] - 0.04, crown[2] + dz]));
  }

  return { base: merge(base), lit: merge(lit) };
}

/**
 * A paw print.
 *
 * It was a husky's head, built from a dozen overlapping spheres, and
 * from the street it read as a lump. A paw is one silhouette with
 * nothing to misread, it says the same thing, and it is the first half
 * of the name.
 */
function husky() {
  const base = [];
  const lit = [];

  // Main pad: a flattened sphere, and nothing else.
  //
  // There was a box across the bottom of it, to square the pad off
  // into a rounded triangle. It was 0.25 deep against a pad 0.126
  // deep, so it came out through the front and cut the highlight
  // sitting there in half - which is what the block in the middle
  // of the paw was. Not a shape of its own: the pale oval with its
  // bottom sliced off square and one corner of the box left
  // standing in it.
  //
  // Pulled back far enough to clear the highlight, the box stopped
  // reaching the silhouette it was there to square off - it is
  // narrower than the sphere at that height - and all it still did
  // was poke two notches through the bottom of the pad. So it is
  // gone. The pad is the oval it always looked like.
  base.push(ball(0.3, [0, -0.12, 0], null, [1.15, 1, 0.42]));
  // Proud of the pad, the way each toe's highlight is proud of its
  // toe. At 0.06 it sat buried inside a pad 0.126 deep.
  lit.push(ball(0.235, [0, -0.11, 0.09], null, [1.1, 0.95, 0.3]));

  // Four toes over it, the outer pair dropped and turned out.
  const toes = [
    [-0.33, 0.14, 0.9, -0.45],
    [-0.13, 0.3, 1, -0.16],
    [0.13, 0.3, 1, 0.16],
    [0.33, 0.14, 0.9, 0.45],
  ];
  for (const [x, y, k, tilt] of toes) {
    base.push(ball(0.125 * k, [x, y, 0], [0, 0, tilt], [1, 1.25, 0.46]));
    lit.push(ball(0.085 * k, [x, y + 0.01, 0.05], [0, 0, tilt], [1, 1.2, 0.3]));
  }

  return { base: merge(base), lit: merge(lit) };
}

/** A mortarboard resting on a stack of books. */
function cap() {
  const base = [];
  const lit = [];

  const books = [
    [0.56, 0.062, 0.4, -0.3, 0.0],
    [0.5, 0.055, 0.36, -0.238, 0.22],
    [0.44, 0.05, 0.33, -0.183, -0.16],
  ];
  books.forEach(([w, h, d, y, rot]) => {
    base.push(box(w, h, d, [0, y, 0], [0, rot, 0]));
    lit.push(box(w * 0.08, h * 0.8, d * 1.01, [-w * 0.44, y, 0], [0, rot, 0]));
  });

  base.push(cyl(0.2, 0.225, 0.15, 14, [0, -0.07, 0]));
  base.push(ball(0.2, [0, 0.0, 0], null, [1, 0.42, 1]));
  base.push(box(0.6, 0.026, 0.6, [0, 0.085, 0], [0, Math.PI / 4, 0]));
  lit.push(box(0.56, 0.014, 0.56, [0, 0.1, 0], [0, Math.PI / 4, 0]));
  base.push(cyl(0.032, 0.032, 0.035, 10, [0, 0.11, 0]));

  // The cord drapes over the edge instead of hanging from the middle.
  const cord = [
    [0.07, 0.108, 0.07],
    [0.16, 0.105, 0.16],
    [0.26, 0.095, 0.26],
    [0.33, 0.04, 0.33],
  ];
  for (let i = 0; i < cord.length - 1; i++) {
    const a = cord[i];
    const b = cord[i + 1];
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const yaw = Math.atan2(b[0] - a[0], b[2] - a[2]);
    const pitch = Math.asin((b[1] - a[1]) / len);
    base.push(cyl(0.012, 0.012, len, 6, mid, [HALF + pitch, yaw, 0]));
  }
  lit.push(cyl(0.032, 0.022, 0.14, 8, [0.33, -0.04, 0.33]));

  return { base: merge(base), lit: merge(lit) };
}

export const EMBLEMS = {
  plane,
  cloud,
  ward,
  chart,
  car,
  palm,
  husky,
  cap,
};
