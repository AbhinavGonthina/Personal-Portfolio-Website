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
 * It is painted onto the board rather than shown in a panel beside it,
 * because a sign that needs a caption floating next to it is not a
 * sign. WELCOME runs across the top the way a town sign does.
 */
export function paintBoard(profile) {
  const W = 1100;
  const H = 1024;
  const [c, g] = canvas(W, H);

  g.fillStyle = "#0a0c14";
  g.fillRect(0, 0, W, H);

  g.textAlign = "left";
  g.textBaseline = "alphabetic";

  g.fillStyle = "#8d9ccb";
  g.font = "700 40px " + MONO;
  if ("letterSpacing" in g) g.letterSpacing = "16px";
  g.fillText("WELCOME", 56, 104);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#ffffff";
  g.font = "600 86px " + SANS;
  g.fillText(profile.name, 52, 214);

  g.strokeStyle = "#2d3350";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(54, 252);
  g.lineTo(W - 56, 252);
  g.stroke();

  g.fillStyle = "#9fb4ff";
  g.font = "500 34px " + MONO;
  if ("letterSpacing" in g) g.letterSpacing = "5px";
  g.fillText(
    (profile.role + "  ·  " + profile.location).toUpperCase(),
    56,
    320,
  );
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#c6cde4";
  g.font = "400 40px " + SANS;
  let y = 406;
  for (const line of wrap(g, profile.tagline, W - 112)) {
    g.fillText(line, 56, y);
    y += 56;
  }

  y += 36;
  g.fillStyle = "#6f7694";
  g.font = "500 28px " + MONO;
  if ("letterSpacing" in g) g.letterSpacing = "5px";
  g.fillText("CURRENTLY", 56, y);
  if ("letterSpacing" in g) g.letterSpacing = "0px";
  g.fillStyle = "#c6cde4";
  g.font = "400 36px " + SANS;
  y += 50;
  for (const line of wrap(g, profile.currently, W - 112)) {
    g.fillText(line, 56, y);
    y += 48;
  }

  // Four focus technologies along the bottom, as chips.
  g.font = "500 28px " + MONO;
  let x = 56;
  const chipY = H - 96;
  for (const t of profile.focus) {
    const w = g.measureText(t).width + 40;
    g.strokeStyle = "#2d3350";
    g.lineWidth = 3;
    g.beginPath();
    g.roundRect(x, chipY, w, 54, 12);
    g.stroke();
    g.fillStyle = "#9fb4ff";
    g.fillText(t, x + 20, chipY + 36);
    x += w + 16;
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
