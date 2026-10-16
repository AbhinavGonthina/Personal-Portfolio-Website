import * as THREE from "three";

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

const wrap = (g, text, maxW) => {
  const out = [];
  let line = "";
  for (const w of String(text).split(" ")) {
    const next = line ? line + " " + w : w;
    if (g.measureText(next).width > maxW && line) {
      out.push(line);
      line = w;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
};

/**
 * The right-hand half of the hoarding: who the face belongs to.
 *
 * Same words as the landing page used to carry, laid out as a sign
 * rather than as a page. Left-aligned prose on black read as a
 * profile readme - a column of text that happens to be outdoors - so
 * it is built now out of the marks the rest of the town is built
 * from: the ground grid faint underneath, ticks at the corners, the
 * hairline rule under the name that every section heading carries,
 * and the two standing facts set as a labelled footer across the
 * bottom instead of trailing off the end of a paragraph.
 *
 * Drawn at 2x, because at 1024 across a board that fills half the
 * screen the type was visibly soft.
 */
const S = 2;

export function paintBoard(profile, education) {
  const W = 1100 * S;
  const H = 880 * S;
  const [c, g] = canvas(W, H);
  const pad = 74 * S;

  g.fillStyle = "#000000";
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

  // Ticks at the corners rather than a border, like the readout in
  // the car and the frames around everything else here.
  g.strokeStyle = "#2e2e38";
  g.lineWidth = 3 * S;
  const m = 26 * S;
  const t = 44 * S;
  for (const [cx, sx] of [
    [m, 1],
    [W - m, -1],
  ]) {
    for (const [cy, sy] of [
      [m, 1],
      [H - m, -1],
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

  // Eyebrow: mono caps, wide tracking, the subtle grey.
  g.fillStyle = "#71717a";
  g.font = `400 ${25 * S}px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = `${5 * S}px`;
  g.fillText(
    `${profile.role.toUpperCase()}  ·  ${profile.location.toUpperCase()}`,
    pad,
    pad + 24 * S,
  );
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#ffffff";
  g.font = `600 ${104 * S}px ${SANS}`;
  g.fillText(profile.name, pad - 5 * S, pad + 142 * S);
  g.fillRect(pad, pad + 176 * S, 104 * S, 3 * S);

  g.fillStyle = "#a1a1aa";
  g.font = `400 ${38 * S}px ${SANS}`;
  let y = pad + 256 * S;
  for (const line of wrap(g, profile.tagline, W - pad * 2)) {
    g.fillText(line, pad, y);
    y += 54 * S;
  }

  // Two standing facts, set as a footer. A rule across the board and
  // a labelled column each - a plaque, not the last paragraph.
  const base = H - pad + 28 * S;
  g.fillStyle = "#2b2b34";
  g.fillRect(pad, base - 186 * S, W - pad * 2, 2 * S);

  const col = [pad, pad + (W - pad * 2) * 0.52];
  const label = ["CURRENTLY", "GRADUATING"];
  const body = [
    profile.currently,
    `${education.graduation}  ·  GPA ${education.gpa}`,
  ];
  for (let i = 0; i < 2; i++) {
    g.fillStyle = "#6fe3f5";
    g.font = `400 ${23 * S}px ${MONO}`;
    if ("letterSpacing" in g) g.letterSpacing = `${4 * S}px`;
    g.fillText(label[i], col[i], base - 132 * S);
    if ("letterSpacing" in g) g.letterSpacing = "0px";

    g.fillStyle = "#d4d4d8";
    g.font = `400 ${30 * S}px ${SANS}`;
    const width = (i === 0 ? (W - pad * 2) * 0.46 : W - col[1] - pad) | 0;
    let ly = base - 86 * S;
    for (const line of wrap(g, body[i], width)) {
      g.fillText(line, col[i], ly);
      ly += 40 * S;
    }
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
export const HEADREST_BAR = { x: 0.11, y: 0.685, w: 0.78, h: 0.03 };

/**
 * The screen on the back of the headrest in front of you.
 *
 * Dressed like the rest of the town rather than like a web page: a
 * faint grid for a floor, ticks at the corners instead of a border,
 * a tracked mono eyebrow over a hairline rule, and one accent. The
 * same shapes the section headings and the signage use, drawn small.
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
  g.fillText(note.toUpperCase(), pad, 96);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  // The hairline under the eyebrow: the same mark every section
  // heading on the site carries.
  g.fillStyle = "#6fe3f5";
  g.fillRect(pad, 114, 52, 2);

  // Shrunk to fit rather than wrapped. "You have arrived" is half
  // again as long as "Loading" and a second line would push the bar
  // off the bottom of a screen this size.
  g.fillStyle = "#f4f4f5";
  let size = 58;
  do {
    g.font = `600 ${size}px ${SANS}`;
    size -= 2;
  } while (g.measureText(label).width > W - pad * 2 && size > 28);
  g.fillText(label, pad, 212);

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
