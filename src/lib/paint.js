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

/** A rounded rectangle path, built by hand so nothing depends on
 *  `roundRect` being present. */
function rrect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/**
 * The board face, with the two lamps on the gantry actually falling
 * on it.
 *
 * Painted rather than lit. Two spotlights with shadow maps would cost
 * more every frame than everything else on this hoarding put together
 * and would be aimed at a flat plane that never moves, which is the
 * one case where a light can be resolved once and baked. So the pools
 * are two radial gradients added under where the lamps hang, and the
 * lamps themselves are still the geometry they always were.
 */
export function paintBoardFace(lamps) {
  const W = 1024;
  const H = 500;
  const [c, g] = canvas(W, H);

  g.fillStyle = "#05050a";
  g.fillRect(0, 0, W, H);

  // Added, not drawn over: where two pools overlap they should get
  // brighter, the way two lamps on one board do.
  g.globalCompositeOperation = "lighter";
  for (const at of lamps) {
    const cx = W * at;
    const cy = -H * 0.1;
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, H * 1.15);
    grd.addColorStop(0, "rgba(150,172,255,0.30)");
    grd.addColorStop(0.35, "rgba(132,154,235,0.11)");
    grd.addColorStop(0.72, "rgba(110,130,200,0.03)");
    grd.addColorStop(1, "rgba(110,130,200,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
  }
  g.globalCompositeOperation = "source-over";

  return finish(c);
}

/**
 * The right-hand half of the hoarding: who the face belongs to.
 *
 * A hoarding is read from a moving car and the first version of this
 * was written to be read at a desk - a paragraph of prose on black,
 * which is a profile readme that happens to be outdoors. Nothing else
 * in this town is made of sentences: the towers carry mono caps and
 * the headings carry a number and a rule.
 *
 * So it is a board of labels now. The order is the order someone
 * reads a stranger in: the name, then what they are after, then who
 * has already employed them, then where they study, then what they
 * work on. Everything below the name is a pill, because a pill holds
 * one fact and a line of text holds as many as you push into it - and
 * this board has had too many pushed into it before.
 *
 * One accent, and it is the blue the frame around this board is lit
 * in, so the paint and the geometry agree. The whole panel is drawn
 * with `toneMapped` off, so anything near white here is past the
 * bloom threshold and lights up on its own.
 *
 * Drawn at 2x, because at 1024 across a board that fills half the
 * screen the type was visibly soft.
 */
const S = 2;

export function paintBoard(profile, education, lampAt) {
  const W = 1100 * S;
  const H = 990 * S;
  const [c, g] = canvas(W, H);
  const pad = 66 * S;
  const right = W - pad;
  const ACC = ACCENT.blue;
  const RULE = "#23232b";

  // The same black the board face is painted, not pure black: this
  // sits on that face, and a shade between them is a rectangle.
  g.fillStyle = "#05050a";
  g.fillRect(0, 0, W, H);

  // The ground grid, carried up onto the board.
  g.strokeStyle = "#11131c";
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

  // The half of the gantry lamp's pool that falls on this panel.
  // Painted before the type so the type stays at full strength
  // inside it, which is what a lit sign looks like - the light is on
  // the board, not over the words.
  g.globalCompositeOperation = "lighter";
  const pool = g.createRadialGradient(
    W * lampAt,
    -H * 0.08,
    0,
    W * lampAt,
    -H * 0.08,
    H * 1.1,
  );
  pool.addColorStop(0, "rgba(152,174,255,0.26)");
  pool.addColorStop(0.4, "rgba(132,154,235,0.10)");
  pool.addColorStop(1, "rgba(110,130,200,0)");
  g.fillStyle = pool;
  g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = "source-over";

  // Scanlines, at the opacity where you stop seeing them and start
  // seeing a screen. Any heavier and the type sits behind a comb.
  g.fillStyle = "rgba(143,168,255,0.035)";
  for (let y = 0; y < H; y += 4 * S) g.fillRect(0, y, W, 1 * S);

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

  /** One pill. Returns its width, so a row can lay itself out. */
  const pill = (x, y, text, { size, space, ink, line, fill, h }) => {
    mono(size, space);
    const w = g.measureText(text).width + 36 * S;
    rrect(g, x, y, w, h * S, (h * S) / 2);
    if (fill) {
      g.fillStyle = fill;
      g.fill();
    }
    g.strokeStyle = line;
    g.lineWidth = 1.5 * S;
    g.stroke();
    g.fillStyle = ink;
    g.fillText(text, x + 18 * S, y + h * S * 0.5 + size * S * 0.36);
    return w;
  };

  // Eyebrow, in the accent. The board is a lit sign, so the small
  // type on it is lit too rather than being another shade of grey.
  g.fillStyle = ACC;
  mono(32, 5);
  g.fillText(
    `${profile.role.toUpperCase()}  ·  ${profile.location.toUpperCase()}`,
    pad,
    pad + 34 * S,
  );

  // The name, stacked. It does not need to be the biggest thing that
  // fits: it is the only white on a board of grey, which carries it
  // further than another twenty points would, and the points are
  // worth more to the labels under it.
  const [first, ...rest] = profile.name.split(" ");
  g.fillStyle = "#ffffff";
  sans(124, 600);
  g.fillText(first, pad - 5 * S, pad + 174 * S);
  g.fillText(rest.join(" "), pad - 5 * S, pad + 306 * S);

  // What he is after, which is the one thing on this board a stranger
  // is looking for. Filled rather than outlined, because it is the
  // only pill here that is an ask rather than a fact.
  pill(
    pad,
    pad + 352 * S,
    `${profile.seeking} · ${education.graduation}`.toUpperCase(),
    {
      size: 30,
      space: 4,
      ink: "#05050a",
      line: ACC,
      fill: ACC,
      h: 56,
    },
  );

  // Who has already employed him, one to a line. Side by side they
  // had to drop to a size that made two names out of four words, and
  // the board is tall enough now to spend a row on each.
  profile.highlights.forEach(([where, what], i) => {
    pill(pad, pad + (430 + i * 64) * S, `${where} · ${what}`.toUpperCase(), {
      size: 27,
      space: 3,
      ink: "#cfd6e6",
      line: "#2f3647",
      h: 52,
    });
  });

  // Where he studies, set as two lines so neither runs small.
  g.fillStyle = "#9aa0ab";
  sans(36);
  g.fillText(`${education.school}  ·  ${education.degree}`, pad, pad + 606 * S);
  g.fillText(
    `GPA ${education.gpa}  ·  ${education.honors}`,
    pad,
    pad + 654 * S,
  );

  g.fillStyle = RULE;
  g.fillRect(pad, pad + 686 * S, right - pad, 2 * S);

  // What the work is, in four areas rather than in a tech stack. The
  // stack is on the Skills racks, where there is room to mean it.
  //
  // Two to a row on purpose. All four will not cross this panel at a
  // size worth reading, and wrapping them wherever they happened to
  // run out of room left the fourth one orphaned on a line of its
  // own; two by two is the same four facts arranged as though
  // somebody had chosen it.
  const PER_ROW = 2;
  let cx = pad;
  let cy = pad + 718 * S;
  profile.categories.forEach((name, i) => {
    if (i && i % PER_ROW === 0) {
      cx = pad;
      cy += 64 * S;
    }
    cx +=
      pill(cx, cy, name.toUpperCase(), {
        size: 27,
        space: 3,
        ink: "#9aa0ab",
        line: "#272d3b",
        h: 52,
      }) +
      14 * S;
  });

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
