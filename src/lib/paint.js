import * as THREE from "three";
import { ACCENT } from "./townMaterials";

/**
 * Canvas textures for the things in the town that have to show content:
 * the marks on the mailboxes and whatever is on the monitor.
 *
 * Drawn rather than loaded, for the same reason everything else here is
 * procedural - no asset pipeline, nothing to 404, and the type matches
 * the rest of the site because it is the same font stack.
 */

const MONO = '"Geist Mono Variable", ui-monospace, monospace';
const SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif';

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d")];
}

function finish(c) {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ------------------------------------------------------------------ */

/**
 * The mark on a mailbox. Icons are drawn as paths rather than loaded as
 * brand SVGs: at this size a recognisable glyph beats an accurate one,
 * and the name is underneath anyway.
 */
const ICONS = {
  github(g, s) {
    // The git graph: a branch leaving a trunk and rejoining it.
    g.lineWidth = s * 0.075;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(s * 0.3, s * 0.18);
    g.lineTo(s * 0.3, s * 0.82);
    g.stroke();
    g.beginPath();
    g.moveTo(s * 0.3, s * 0.5);
    g.quadraticCurveTo(s * 0.3, s * 0.3, s * 0.7, s * 0.3);
    g.stroke();
    for (const [x, y] of [
      [0.3, 0.2],
      [0.3, 0.8],
      [0.7, 0.3],
    ]) {
      g.beginPath();
      g.arc(s * x, s * y, s * 0.09, 0, Math.PI * 2);
      g.fill();
    }
  },
  linkedin(g, s) {
    g.lineWidth = s * 0.07;
    g.strokeRect(s * 0.14, s * 0.14, s * 0.72, s * 0.72);
    g.font = `700 ${s * 0.46}px ${SANS}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("in", s * 0.5, s * 0.54);
  },
  email(g, s) {
    g.lineWidth = s * 0.07;
    g.lineJoin = "round";
    g.strokeRect(s * 0.12, s * 0.26, s * 0.76, s * 0.48);
    g.beginPath();
    g.moveTo(s * 0.12, s * 0.26);
    g.lineTo(s * 0.5, s * 0.56);
    g.lineTo(s * 0.88, s * 0.26);
    g.stroke();
  },
  resume(g, s) {
    g.lineWidth = s * 0.07;
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(s * 0.24, s * 0.12);
    g.lineTo(s * 0.62, s * 0.12);
    g.lineTo(s * 0.78, s * 0.3);
    g.lineTo(s * 0.78, s * 0.88);
    g.lineTo(s * 0.24, s * 0.88);
    g.closePath();
    g.stroke();
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(s * 0.34, s * (0.46 + i * 0.14));
      g.lineTo(s * 0.68, s * (0.46 + i * 0.14));
      g.stroke();
    }
  },
};

export function paintMark(icon, name) {
  const S = 256;
  const [c, g] = canvas(S, S + 72);
  g.strokeStyle = "#e8ecff";
  g.fillStyle = "#e8ecff";
  g.save();
  g.translate(0, 8);
  (ICONS[icon] ?? ICONS.resume)(g, S);
  g.restore();

  g.font = `700 46px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = "5px";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(name.toUpperCase(), c.width / 2, S + 40);
  return finish(c);
}

/* ------------------------------------------------------------------ */

/**
 * What is on the monitor in the study: the selected project, laid out
 * like an editor window so the screen reads as a screen.
 */
export function paintScreen(project, index, total) {
  const W = 1024;
  const H = 600;
  const [c, g] = canvas(W, H);

  g.fillStyle = "#07080e";
  g.fillRect(0, 0, W, H);

  // Title bar.
  g.fillStyle = "#101320";
  g.fillRect(0, 0, W, 54);
  for (let i = 0; i < 3; i++) {
    g.fillStyle = ["#ff5f57", "#febc2e", "#28c840"][i];
    g.beginPath();
    g.arc(32 + i * 26, 27, 7.5, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#6f7694";
  g.font = `500 22px ${MONO}`;
  g.textAlign = "left";
  g.textBaseline = "middle";
  g.fillText(`projects — ${index + 1} / ${total}`, 128, 28);

  if (!project) return finish(c);

  // Body.
  g.fillStyle = "#ffffff";
  g.font = `600 56px ${SANS}`;
  g.fillText(project.title ?? project.name ?? "", 56, 124);

  g.fillStyle = "#9aa2bd";
  g.font = `400 26px ${SANS}`;
  const words = String(project.blurb ?? project.summary ?? "").split(" ");
  let line = "";
  let y = 196;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (g.measureText(next).width > W - 112) {
      g.fillText(line, 56, y);
      y += 38;
      line = w;
    } else line = next;
    if (y > 350) break;
  }
  if (line) g.fillText(line, 56, y);

  // Tech chips.
  g.font = `500 22px ${MONO}`;
  let x = 56;
  for (const t of (project.tech ?? []).slice(0, 6)) {
    const w = g.measureText(t).width + 34;
    g.strokeStyle = "#2a2f45";
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(x, 430, w, 44, 10);
    g.stroke();
    g.fillStyle = "#c3c9e0";
    g.fillText(t, x + 17, 453);
    x += w + 14;
    if (x > W - 140) break;
  }

  // A prompt line at the bottom, which is what makes it look switched on.
  g.fillStyle = "#4ad66d";
  g.font = `500 22px ${MONO}`;
  g.fillText("$", 56, 540);
  g.fillStyle = "#6f7694";
  g.fillText("keep scrolling", 84, 540);

  return finish(c);
}

/* ------------------------------------------------------------------ */

/**
 * The right-hand half of the hoarding: who the face belongs to.
 *
 * A hoarding is read from a moving car and the version before this
 * was written to be read at a desk - a paragraph of prose on black,
 * which is a profile readme that happens to be outdoors. Nothing
 * else in this town is made of sentences: the towers carry mono
 * caps, the headings carry a number and a rule. So the paragraph is
 * gone, and what is left is the four things a sign can say before
 * you have driven past it - who, what they do, what they build with,
 * and where they are up to. The paragraph is not lost, but it is not
 * here either: it is in the Hero and the About section, which is to
 * say it is one toggle away in the simpler read, where there is a
 * chair under the reader and no reason to be brief.
 *
 * One accent, and it is the blue the frame around this board is lit
 * in, so the paint and the geometry agree. The corner ticks came off
 * with the prose: this is half of a board that already has a frame,
 * and ticking its own corners made it a card sitting on one.
 *
 * Drawn at 2x, because at 1024 across a board that fills half the
 * screen the type was visibly soft.
 */
const S = 2;

export function paintBoard(profile, education) {
  const W = 1100 * S;
  const H = 880 * S;
  const [c, g] = canvas(W, H);
  const pad = 70 * S;
  const ACC = ACCENT.blue;
  const RULE = "#23232b";

  // The same black the board face is painted, not pure black: this
  // sits on that face, and a shade between them is a rectangle.
  g.fillStyle = "#05050a";
  g.fillRect(0, 0, W, H);

  // The ground grid, carried up onto the board.
  g.strokeStyle = "#0d0d11";
  g.lineWidth = 1 * S;
  g.beginPath();
  for (let x = 0; x <= W; x += 55 * S) {
    g.moveTo(x, 0);
    g.lineTo(x, H);
  }
  for (let y = 0; y <= H; y += 55 * S) {
    g.moveTo(0, y);
    g.lineTo(W, y);
  }
  g.stroke();

  g.textAlign = "left";
  g.textBaseline = "alphabetic";

  const mono = (px, space) => {
    g.font = `400 ${px * S}px ${MONO}`;
    if ("letterSpacing" in g) g.letterSpacing = `${space * S}px`;
  };
  const sans = (px, weight = 400) => {
    g.font = `${weight} ${px * S}px ${SANS}`;
    if ("letterSpacing" in g) g.letterSpacing = "0px";
  };
  const rule = (y) => {
    g.fillStyle = RULE;
    g.fillRect(pad, y, W - pad * 2, 2 * S);
  };

  // Eyebrow, in the accent. The board is a lit sign, so the small
  // type on it is lit too rather than being another shade of grey.
  g.fillStyle = ACC;
  mono(26, 6);
  g.fillText(
    `${profile.role.toUpperCase()}  ·  ${profile.location.toUpperCase()}`,
    pad,
    pad + 26 * S,
  );

  // The name, stacked. Two lines carry half again the type size of
  // one across the same width, and on a hoarding the size is the
  // whole argument.
  const [first, ...rest] = profile.name.split(" ");
  g.fillStyle = "#ffffff";
  sans(140, 600);
  g.fillText(first, pad - 6 * S, pad + 182 * S);
  g.fillText(rest.join(" "), pad - 6 * S, pad + 320 * S);
  rule(pad + 364 * S);

  // What the work is made of, in the mono caps the towers wear.
  g.fillStyle = "#9aa0ab";
  mono(25, 4);
  g.fillText(
    profile.focus.map((f) => f.toUpperCase()).join("  ·  "),
    pad,
    pad + 432 * S,
  );

  // Two standing facts, a label and a value on one line each: a
  // plaque, not the last paragraph.
  const rows = [
    ["CURRENTLY", profile.currently],
    ["GRADUATING", `${education.graduation}  ·  GPA ${education.gpa}`],
  ];
  let y = pad + 556 * S;
  for (const [label, value] of rows) {
    rule(y - 44 * S);
    g.fillStyle = ACC;
    mono(23, 5);
    g.fillText(label, pad, y);
    g.fillStyle = "#d4d4d8";
    sans(29);
    g.fillText(value, pad, y + 46 * S);
    y += 128 * S;
  }

  return finish(c);
}

/** The board above the racks: every skill, grouped. */
export function paintSkills(groups) {
  const W = 1024;
  const H = 760;
  const [c, g] = canvas(W, H);

  g.fillStyle = "#080a12";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#232942";
  g.lineWidth = 6;
  g.strokeRect(3, 3, W - 6, H - 6);

  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillStyle = "#ffffff";
  g.font = "600 52px " + SANS;
  g.fillText("Skills", 44, 78);
  g.strokeStyle = "#ffffff";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(46, 96);
  g.lineTo(118, 96);
  g.stroke();

  let y = 158;
  for (const group of groups) {
    g.fillStyle = "#6f7694";
    g.font = "500 22px " + MONO;
    if ("letterSpacing" in g) g.letterSpacing = "4px";
    g.fillText(group.label.toUpperCase(), 44, y);
    if ("letterSpacing" in g) g.letterSpacing = "0px";

    g.font = "500 24px " + MONO;
    let x = 44;
    y += 36;
    for (const item of group.items) {
      const w = g.measureText(item).width + 30;
      if (x + w > W - 44) {
        x = 44;
        y += 44;
      }
      g.strokeStyle = "#262c45";
      g.lineWidth = 2;
      g.beginPath();
      g.roundRect(x, y - 26, w, 38, 9);
      g.stroke();
      g.fillStyle = "#c6cde4";
      g.fillText(item, x + 15, y);
      x += w + 10;
    }
    y += 56;
  }

  return finish(c);
}

/* ------------------------------------------------------------------ */

/**
 * Where the progress bar sits on the headrest screen, as fractions of
 * the plane measured from its left edge and its top.
 *
 * The bar is geometry, not paint. A bar drawn into the canvas has to
 * be redrawn and re-uploaded every time it moves, which for something
 * that moves for three solid seconds is a texture upload a frame; a
 * quad that scales costs nothing. This is the contract between the
 * track, which is painted, and the fill, which is not.
 */
export const HEADREST_BAR = { x: 0.11, y: 0.737, w: 0.78, h: 0.03 };

/**
 * The screen on the back of the headrest in front of you.
 *
 * Dressed like the rest of the town rather than like a web page: a
 * faint grid for a floor, ticks at the corners instead of a border,
 * a tracked mono eyebrow over a hairline rule, and one accent. The
 * same shapes the section headings and the signage use, drawn small.
 *
 * The block sits in the middle of the panel. Laid out from the top
 * down it left ninety pixels of nothing under the bar and a third of
 * that above the eyebrow, which read as a readout that had slipped.
 * These numbers are the same layout shifted so the two margins
 * match; `HEADREST_BAR` moves with them.
 */
export function paintHeadrest(label, note) {
  const W = 640;
  const H = 420;
  const [c, g] = canvas(W, H);
  const pad = 58;

  g.fillStyle = "#04060b";
  g.fillRect(0, 0, W, H);

  // The grid under everything, at the same spacing and nearly the same
  // tone as the one the town is standing on.
  g.strokeStyle = "#0e1118";
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= W; x += 40) {
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, H);
  }
  for (let y = 0; y <= H; y += 40) {
    g.moveTo(0, y + 0.5);
    g.lineTo(W, y + 0.5);
  }
  g.stroke();

  // Corner ticks. A full border makes a card; four corners make a
  // readout.
  g.strokeStyle = "#27304a";
  g.lineWidth = 3;
  const t = 26;
  for (const [cx, sx] of [
    [20, 1],
    [W - 20, -1],
  ]) {
    for (const [cy, sy] of [
      [20, 1],
      [H - 20, -1],
    ]) {
      g.beginPath();
      g.moveTo(cx + sx * t, cy);
      g.lineTo(cx, cy);
      g.lineTo(cx, cy + sy * t);
      g.stroke();
    }
  }

  g.textAlign = "left";
  g.textBaseline = "alphabetic";

  g.fillStyle = "#6fe3f5";
  g.font = `500 20px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = "7px";
  g.fillText(note.toUpperCase(), pad, 118);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  // The hairline under the eyebrow: the same mark every section
  // heading on the site carries.
  g.fillStyle = "#6fe3f5";
  g.fillRect(pad, 136, 52, 2);

  // Shrunk to fit rather than wrapped. "You have arrived" is half
  // again as long as "Loading" and a second line would push the bar
  // off the bottom of a screen this size.
  g.fillStyle = "#f4f4f5";
  let size = 58;
  do {
    g.font = `600 ${size}px ${SANS}`;
    size -= 2;
  } while (g.measureText(label).width > W - pad * 2 && size > 28);
  g.fillText(label, pad, 234);

  // The track. The fill that runs along it is a quad in the scene.
  const bx = HEADREST_BAR.x * W;
  const by = HEADREST_BAR.y * H;
  const bw = HEADREST_BAR.w * W;
  const bh = HEADREST_BAR.h * H;
  g.strokeStyle = "#1d2436";
  g.lineWidth = 2;
  g.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
  // Ticks along it, so a part-filled bar reads as a distance.
  g.fillStyle = "#151b29";
  for (let i = 1; i < 8; i++) {
    g.fillRect(bx + (bw * i) / 8, by + 2, 1, bh - 4);
  }

  return finish(c);
}
