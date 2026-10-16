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
 * Word for word and weight for weight what used to sit in the corner
 * of the landing page - the mono eyebrow, the name in Geist Sans, the
 * tagline, the currently line, the graduation line. It reads as a sign
 * because of where it is, not because it was rewritten as one.
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

  g.fillStyle = "#000000";
  g.fillRect(0, 0, W, H);
  g.textAlign = "left";
  g.textBaseline = "alphabetic";

  // Eyebrow: mono caps, wide tracking, the subtle grey.
  g.fillStyle = "#71717a";
  g.font = `400 ${26 * S}px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = `${5 * S}px`;
  g.fillText(
    `${profile.role.toUpperCase()}  ·  ${profile.location.toUpperCase()}`,
    pad,
    pad + 26 * S,
  );
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#ffffff";
  g.font = `600 ${104 * S}px ${SANS}`;
  g.fillText(profile.name, pad - 5 * S, pad + 150 * S);

  g.fillStyle = "#a1a1aa";
  g.font = `400 ${40 * S}px ${SANS}`;
  let y = pad + 250 * S;
  for (const line of wrap(g, profile.tagline, W - pad * 2)) {
    g.fillText(line, pad, y);
    y += 58 * S;
  }

  y += 44 * S;
  g.font = `400 ${26 * S}px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = `${4 * S}px`;
  g.fillStyle = "#71717a";
  g.fillText("CURRENTLY", pad, y);
  const w = g.measureText("CURRENTLY").width;
  if ("letterSpacing" in g) g.letterSpacing = "0px";
  g.fillStyle = "#a1a1aa";
  g.font = `400 ${34 * S}px ${SANS}`;
  // The first line has the label beside it and the rest of the board
  // to itself, so it wraps against two different widths. Run at one
  // width and the sentence walks off the right-hand edge.
  const head = pad + w + 14 * S;
  const rest = wrap(g, `— ${profile.currently}`, W - head - pad);
  g.fillText(rest[0] ?? "", head, y);
  for (let i = 1; i < rest.length; i++) {
    y += 46 * S;
    g.fillText(rest[i], pad, y);
  }

  y += 66 * S;
  g.fillStyle = "#71717a";
  g.font = `400 ${26 * S}px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = `${2 * S}px`;
  g.fillText(
    `Graduating ${education.graduation}  ·  GPA ${education.gpa}`,
    pad,
    y,
  );

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
 * The screen on the back of the headrest in front of you, which is
 * the only thing to look at for the first few seconds of a visit.
 *
 * Styled as the seat-back display it is pretending to be: a status
 * line, a big label, and a progress bar that fills while you wait.
 */
export function paintHeadrest(label, note, progress) {
  const W = 640;
  const H = 420;
  const [c, g] = canvas(W, H);

  g.fillStyle = "#06080f";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#1b2133";
  g.lineWidth = 6;
  g.strokeRect(3, 3, W - 6, H - 6);

  g.textAlign = "center";
  g.textBaseline = "middle";

  g.fillStyle = "#6fe3f5";
  g.font = `500 22px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  g.fillText(note.toUpperCase(), W / 2, 86);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#ffffff";
  g.font = `600 56px ${SANS}`;
  g.fillText(label, W / 2, 180);

  // The bar. Rounded, inset, and it only ever moves forward.
  const bw = W - 160;
  g.strokeStyle = "#242b40";
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(80, 248, bw, 14, 7);
  g.stroke();
  g.fillStyle = "#6fe3f5";
  g.beginPath();
  g.roundRect(80, 248, Math.max(14, bw * progress), 14, 7);
  g.fill();

  g.fillStyle = "#5a6480";
  g.font = `400 20px ${MONO}`;
  g.fillText("ABHINAV GONTHINA · BOSTON", W / 2, 338);

  return finish(c);
}
