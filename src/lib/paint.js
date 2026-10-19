import * as THREE from "three";
import { ACCENT } from "./townMaterials";
import githubMark from "bootstrap-icons/icons/github.svg?raw";
import linkedinMark from "bootstrap-icons/icons/linkedin.svg?raw";
import envelopeMark from "bootstrap-icons/icons/envelope.svg?raw";
import resumeMark from "bootstrap-icons/icons/file-earmark-text.svg?raw";
import { siApachejmeter } from "simple-icons";

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
 * The marks on the mailboxes, taken from Bootstrap Icons rather than
 * drawn here.
 *
 * They were drawn here, as paths approximating each logo from memory,
 * on the argument that at this size a recognisable glyph beats an
 * accurate one. That argument holds for a mail envelope and does not
 * hold for somebody else's trademark: the GitHub and LinkedIn marks
 * are things people recognise exactly or not at all, and the drawn
 * ones were not them.
 *
 * One set, not two, so the four read as a family. Bootstrap Icons is
 * the set that still carries LinkedIn - it has been pulled from most
 * of the others - and it carries an envelope and a document in the
 * same hand, which is what the other two needed.
 *
 * Parsed once at module scope. A `Path2D` is a compiled path and
 * rebuilding one per repaint would be work for no change.
 */
const SVG = {
  github: githubMark,
  linkedin: linkedinMark,
  email: envelopeMark,
  resume: resumeMark,
};

const ICONS = Object.fromEntries(
  Object.entries(SVG).map(([name, svg]) => {
    const box = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
    return [
      name,
      {
        w: box ? +box[1] : 16,
        h: box ? +box[2] : 16,
        paths: [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => new Path2D(m[1])),
      },
    ];
  }),
);

/**
 * One mark, centred in a square box at its own aspect ratio.
 *
 * `Math.min` of the two scales rather than a scale per axis: these
 * are square to begin with, but a mark squeezed to fit a box is the
 * thing this was changed to stop doing, and a formula that cannot
 * squeeze cannot start doing it again if a set with oblong icons
 * ever replaces this one.
 */
function drawIcon(g, name, size) {
  const icon = ICONS[name] ?? ICONS.resume;
  const s = Math.min(size / icon.w, size / icon.h);
  g.save();
  g.translate((size - icon.w * s) / 2, (size - icon.h * s) / 2);
  g.scale(s, s);
  for (const p of icon.paths) g.fill(p);
  g.restore();
}

/**
 * One mailbox face: the mark in a square, the name under it.
 *
 * The canvas is 256 across and 342 down and the plane it goes on is
 * built from that ratio, not from a square. It used to be a square,
 * and everything on it arrived at the box squashed to 78% of its
 * height - which is what made the marks look wrong as much as the
 * marks being wrong did.
 */
const MARK_W = 256;
const MARK_H = 342;

export function paintMark(icon, name) {
  const [c, g] = canvas(MARK_W, MARK_H);
  g.fillStyle = "#e8ecff";
  g.strokeStyle = "#e8ecff";

  // Inset, so the mark has air around it rather than running to the
  // edge of its square.
  const inset = 26;
  g.save();
  g.translate(inset, inset);
  drawIcon(g, icon, MARK_W - inset * 2);
  g.restore();

  g.font = `700 46px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = "5px";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(name.toUpperCase(), MARK_W / 2, MARK_W + 48);
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

/** Greedy line breaking against a width, in whatever font is set. */
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
  // Big enough to carry the grid and the scanlines for the whole
  // board. They used to live on the panel, which is a smaller plane
  // sitting on this one - so the texture stopped dead at the panel's
  // edge and the words looked like a screenshot pasted onto a sign.
  // Everything that covers the board is painted here now, at board
  // scale, and the panel over it carries nothing but ink.
  const W = 2048;
  const H = 999;
  const [c, g] = canvas(W, H);

  g.fillStyle = "#05050a";
  g.fillRect(0, 0, W, H);

  // The ground grid, carried up onto the board.
  g.strokeStyle = "#11131c";
  g.lineWidth = 2;
  g.beginPath();
  for (let x = 0; x <= W; x += 50) {
    g.moveTo(x, 0);
    g.lineTo(x, H);
  }
  for (let y = 0; y <= H; y += 50) {
    g.moveTo(0, y);
    g.lineTo(W, y);
  }
  g.stroke();

  // Scanlines, at the opacity where you stop seeing them and start
  // seeing a screen. Any heavier and the type sits behind a comb.
  g.fillStyle = "rgba(143,168,255,0.035)";
  for (let y = 0; y < H; y += 7) g.fillRect(0, y, W, 2);

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

export function paintBoard(profile, education) {
  const W = 1100 * S;
  const H = 990 * S;
  const [c, g] = canvas(W, H);
  const pad = 66 * S;
  const right = W - pad;
  const ACC = ACCENT.blue;
  const RULE = "#23232b";

  // Nothing is painted behind the words. The grid, the scanlines and
  // the light from the gantry are on the board face underneath, which
  // runs the full width of the sign - so there is one surface and one
  // grid rather than a smaller rectangle of them sitting in the
  // middle of a larger one.
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

  // Eyebrow, in the accent. The board is a lit sign, so the small
  // type on it is lit too rather than being another shade of grey.
  g.fillStyle = ACC;
  mono(32, 5);
  g.fillText(
    `${profile.role.toUpperCase()}  ·  ${profile.location.toUpperCase()}`,
    pad,
    pad + 44 * S,
  );

  // The name, on one line. 110 is the largest size it fits the panel
  // at - 932 of the 968 there are - and the size is chosen by that
  // rather than by eye, because one line is the brief and the only
  // question left was how much of it to use.
  g.fillStyle = "#ffffff";
  sans(110, 600);
  g.fillText(profile.name, pad - 5 * S, pad + 190 * S);

  g.fillStyle = RULE;
  g.fillRect(pad, pad + 234 * S, right - pad, 2 * S);

  g.fillStyle = "#b6bcc8";
  sans(40);
  // A gap between the sentences, not between the lines inside one:
  // the break is what makes them two statements rather than one
  // paragraph that happens to contain a full stop.
  let y = pad + 310 * S;
  for (const para of profile.pitch) {
    for (const line of wrap(g, para, right - pad)) {
      g.fillText(line, pad, y);
      y += 54 * S;
    }
    y += 18 * S;
  }

  // Three standing facts across the foot of the board, a label over
  // a value each. The columns are set rather than measured: the
  // widths are known and fixed, and a layout that cannot reflow
  // cannot reflow into something nobody looked at.
  const stats = [
    ["GPA", education.gpa, "#ffffff"],
    ["GRADUATING", education.graduation, "#ffffff"],
    ["SEEKING", profile.seeking, ACC],
  ];
  const COL = [0, 290, 580];
  g.fillStyle = RULE;
  g.fillRect(pad, pad + 672 * S, right - pad, 2 * S);
  stats.forEach(([label, value, ink], i) => {
    const cx = pad + COL[i] * S;
    g.fillStyle = "#6f7788";
    mono(26, 5);
    g.fillText(label, cx, pad + 724 * S);
    g.fillStyle = ink;
    sans(40);
    g.fillText(value, cx, pad + 786 * S);
  });

  return finish(c);
}

import dvamazonwebservices from "devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg?raw";
import dvazuresqldatabase from "devicon/icons/azuresqldatabase/azuresqldatabase-plain.svg?raw";
import dvc from "devicon/icons/c/c-original.svg?raw";
import dvcplusplus from "devicon/icons/cplusplus/cplusplus-original.svg?raw";
import dvcsharp from "devicon/icons/csharp/csharp-original.svg?raw";
import dvcss3 from "devicon/icons/css3/css3-original.svg?raw";
import dvdocker from "devicon/icons/docker/docker-original.svg?raw";
import dvdotnetcore from "devicon/icons/dotnetcore/dotnetcore-original.svg?raw";
import dvexpress from "devicon/icons/express/express-original.svg?raw";
import dvflask from "devicon/icons/flask/flask-original.svg?raw";
import dvgit from "devicon/icons/git/git-original.svg?raw";
import dvgrafana from "devicon/icons/grafana/grafana-plain.svg?raw";
import dvhtml5 from "devicon/icons/html5/html5-original.svg?raw";
import dvjava from "devicon/icons/java/java-original.svg?raw";
import dvjavascript from "devicon/icons/javascript/javascript-original.svg?raw";
import dvjenkins from "devicon/icons/jenkins/jenkins-original.svg?raw";
import dvjest from "devicon/icons/jest/jest-plain.svg?raw";
import dvjunit from "devicon/icons/junit/junit-original.svg?raw";
import dvkubernetes from "devicon/icons/kubernetes/kubernetes-original.svg?raw";
import dvnextjs from "devicon/icons/nextjs/nextjs-plain.svg?raw";
import dvpostman from "devicon/icons/postman/postman-original.svg?raw";
import dvprisma from "devicon/icons/prisma/prisma-original.svg?raw";
import dvprometheus from "devicon/icons/prometheus/prometheus-original.svg?raw";
import dvpython from "devicon/icons/python/python-plain.svg?raw";
import dvreact from "devicon/icons/react/react-original.svg?raw";
import dvredis from "devicon/icons/redis/redis-original.svg?raw";
import dvredux from "devicon/icons/redux/redux-original.svg?raw";
import dvspring from "devicon/icons/spring/spring-original.svg?raw";
import dvterraform from "devicon/icons/terraform/terraform-original.svg?raw";
import dvtypescript from "devicon/icons/typescript/typescript-original.svg?raw";
import dvvitest from "devicon/icons/vitest/vitest-original.svg?raw";

/**
 * Devicon's marks, one import per file so the bundler leaves the
 * other five hundred behind.
 *
 * Devicon rather than Simple Icons because Simple Icons no longer
 * has Java, C#, AWS, Oracle or DynamoDB - all pulled over trademark
 * complaints, the same way LinkedIn was. Devicon has every skill on
 * the board but one: JMeter, which keeps a Simple Icons path.
 *
 * The file chosen per mark is whichever variant this reader can
 * actually draw. It cannot resolve gradients, and a mark made
 * entirely of them collapses into one flat silhouette - Next.js
 * came out as a filled disc with no N in it. Where the original is
 * gradients, the plain variant is taken instead.
 */
const DEVICON = {
  amazonwebservices: dvamazonwebservices,
  azuresqldatabase: dvazuresqldatabase,
  c: dvc,
  cplusplus: dvcplusplus,
  csharp: dvcsharp,
  css3: dvcss3,
  docker: dvdocker,
  dotnetcore: dvdotnetcore,
  express: dvexpress,
  flask: dvflask,
  git: dvgit,
  grafana: dvgrafana,
  html5: dvhtml5,
  java: dvjava,
  javascript: dvjavascript,
  jenkins: dvjenkins,
  jest: dvjest,
  junit: dvjunit,
  kubernetes: dvkubernetes,
  nextjs: dvnextjs,
  postman: dvpostman,
  prisma: dvprisma,
  prometheus: dvprometheus,
  python: dvpython,
  react: dvreact,
  redis: dvredis,
  redux: dvredux,
  spring: dvspring,
  terraform: dvterraform,
  typescript: dvtypescript,
  vitest: dvvitest,
};

const JMETER = `<svg viewBox="0 0 24 24"><path d="${siApachejmeter.path}"/></svg>`;

/**
 * An SVG file, reduced to what a canvas can draw.
 *
 * Paths, circles and ellipses, each with whatever fill it declared.
 * That is every shape the forty-three marks on this board use - and
 * it has to be all three, because React and Next.js draw their
 * orbits as circles and Redis draws its drum as ellipses. Dropping
 * those would have left two logos as fragments and one as a pile of
 * loose paths.
 *
 * Parsed on first use and kept: a Path2D is a compiled path, and
 * these are redrawn every time the pointer moves to a new tag.
 */
const parsed = {};

/** How bright a declared fill is, or null if it is not a plain hex. */
function luma(fill) {
  if (!fill) return null;
  let h = fill.trim().replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const n = parseInt(h, 16);
  return (
    (0.2126 * ((n >> 16) & 255) +
      0.7152 * ((n >> 8) & 255) +
      0.0722 * (n & 255)) /
    255
  );
}

function svgShapes(src) {
  const box = /viewBox="([\d.\-\s]+)"/.exec(src);
  const [, , vw, vh] = box
    ? box[1].trim().split(/\s+/).map(Number)
    : [0, 0, 24, 24];
  const shapes = [];
  const fillOf = (tag) => {
    const m = /fill="([^"]+)"/.exec(tag);
    return !m || m[1] === "none" || m[1] === "currentColor" ? null : m[1];
  };

  for (const m of src.matchAll(/<path\b([^>]*)\/?>/g)) {
    const d = /\sd="([^"]+)"/.exec(m[1]);
    if (d) shapes.push({ p: new Path2D(d[1]), fill: fillOf(m[1]) });
  }
  for (const m of src.matchAll(/<circle\b([^>]*)\/?>/g)) {
    const n = (k) =>
      Number(new RegExp(`\\s${k}="([^"]+)"`).exec(m[1])?.[1] ?? 0);
    const p = new Path2D();
    p.arc(n("cx"), n("cy"), n("r"), 0, Math.PI * 2);
    shapes.push({ p, fill: fillOf(m[1]) });
  }
  for (const m of src.matchAll(/<ellipse\b([^>]*)\/?>/g)) {
    const n = (k) =>
      Number(new RegExp(`\\s${k}="([^"]+)"`).exec(m[1])?.[1] ?? 0);
    const p = new Path2D();
    p.ellipse(n("cx"), n("cy"), n("rx"), n("ry"), 0, 0, Math.PI * 2);
    shapes.push({ p, fill: fillOf(m[1]) });
  }
  // Whether this mark can be seen at all on a near-black panel.
  //
  // Three things make a logo invisible here and all three are
  // common. Some declare their colour as `url(#gradient)`, which
  // this cannot resolve and canvas will not accept. Some declare no
  // fill on the shapes at all and put it on a wrapping group. And
  // some are simply black - GitHub is #181616 and Flask is #010101,
  // which on this background is a hole.
  //
  // So: if nothing in the file is bright enough to see, the whole
  // mark is drawn in one light tone. If something is, the declared
  // colours are kept and only the unreadable ones are lifted - that
  // way Kubernetes stays blue and Python stops being a void.
  const bright = shapes
    .map((s) => luma(s.fill))
    .reduce((a, b) => (b === null ? a : Math.max(a ?? 0, b)), null);
  const mono = bright === null || bright < 0.18;
  for (const s of shapes) {
    const l = luma(s.fill);
    if (mono || l === null || l < 0.18) s.fill = null;
  }

  return { vw: vw || 24, vh: vh || 24, shapes };
}

/** The mark for a Devicon directory name, or null if there is none. */
function techIcon(dir) {
  if (!dir) return null;
  const src = dir === "jmeter" ? JMETER : DEVICON[dir];
  if (!src) return null;
  if (!(dir in parsed)) parsed[dir] = svgShapes(src);
  return parsed[dir];
}

/**
 * Centred in a box at its own aspect, never stretched to fill one.
 * Half of these are square and the AWS mark is a wordmark three
 * times as wide as it is tall.
 */
function drawTech(g, icon, x, y, box) {
  const s = Math.min(box / icon.vw, box / icon.vh);
  g.save();
  g.translate(x + (box - icon.vw * s) / 2, y + (box - icon.vh * s) / 2);
  g.scale(s, s);
  for (const sh of icon.shapes) {
    g.fillStyle = sh.fill ?? "#dfe6ff";
    g.fill(sh.p);
  }
  g.restore();
}

/**
 * The board above the racks, as a terminal window.
 *
 * Returns the hit boxes along with the texture. The board is one
 * plane, so a pointer over it arrives as a UV coordinate and
 * nothing else - the only way to know which tag is under it is for
 * whatever drew the tags to say where it put them. They come back
 * in UV, origin top left, which is what the raycaster hands over.
 */
export const SKILL_PANE = { x0: 0.638, x1: 0.974, y0: 0.115, y1: 0.93 };

export function paintSkills(groups) {
  const W = 1600;
  const H = 805;
  const [c, g] = canvas(W, H);
  const hits = [];

  g.fillStyle = "#080a12";
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "#232942";
  g.lineWidth = 6;
  g.strokeRect(3, 3, W - 6, H - 6);

  // Title bar. Three dots and a filename, which is the one piece of
  // furniture that says "terminal" before a single word is read.
  const BAR = 62;
  g.fillStyle = "#0d101b";
  g.fillRect(3, 3, W - 6, BAR);
  g.strokeStyle = "#232942";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(3, BAR + 3);
  g.lineTo(W - 3, BAR + 3);
  g.stroke();

  const DOTS = ["#ff5f57", "#febc2e", "#28c840"];
  DOTS.forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(42 + i * 30, 3 + BAR / 2, 9, 0, Math.PI * 2);
    g.fill();
  });

  g.textAlign = "left";
  g.textBaseline = "alphabetic";
  g.fillStyle = "#6f7694";
  g.font = "500 24px " + MONO;
  if ("letterSpacing" in g) g.letterSpacing = "2px";
  g.fillText("skills_manifest.sh", 150, 3 + BAR / 2 + 9);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  // The bezel the preview screen sits in. Drawn here so the hole is
  // part of the window; the screen itself is its own plane over it,
  // because it repaints whenever the pointer moves and the rest of
  // this does not.
  const px0 = SKILL_PANE.x0 * W;
  const py0 = SKILL_PANE.y0 * H;
  const pw = (SKILL_PANE.x1 - SKILL_PANE.x0) * W;
  const ph = (SKILL_PANE.y1 - SKILL_PANE.y0) * H;
  g.fillStyle = "#05070e";
  g.fillRect(px0, py0, pw, ph);
  g.strokeStyle = "#262c45";
  g.lineWidth = 2;
  g.strokeRect(px0, py0, pw, ph);

  // The tags, in the space left of the screen.
  const LEFT = 52;
  const RIGHT = px0 - 52;
  // 150 / 40 / 48 / 48 is the largest this grid goes before the last
  // group runs off the bottom of an 805 tall board. Nine rows of tags
  // and five headings is what has to fit.
  let y = 150;

  for (const group of groups) {
    g.fillStyle = "#6f7694";
    g.font = "500 25px " + MONO;
    if ("letterSpacing" in g) g.letterSpacing = "5px";
    g.fillText(group.label.toUpperCase(), LEFT, y);
    if ("letterSpacing" in g) g.letterSpacing = "0px";

    g.font = "500 28px " + MONO;
    let x = LEFT;
    y += 40;
    for (const item of group.items) {
      const w = g.measureText(item).width + 36;
      if (x + w > RIGHT) {
        x = LEFT;
        y += 48;
      }
      g.strokeStyle = "#262c45";
      g.lineWidth = 2;
      g.beginPath();
      g.roundRect(x, y - 30, w, 42, 10);
      g.stroke();
      g.fillStyle = "#c6cde4";
      g.fillText(item, x + 18, y);
      hits.push({
        item,
        group: group.label,
        x0: x / W,
        y0: (y - 30) / H,
        x1: (x + w) / W,
        y1: (y + 12) / H,
      });
      x += w + 12;
    }
    y += 48;
  }

  return { tex: finish(c), hits };
}

/**
 * The preview screen: one skill, blown up, centred.
 *
 * Repainted every time the pointer crosses onto a different tag, so
 * it is its own small canvas rather than part of the board - a
 * board-sized repaint and re-upload on every hover is a stutter
 * nobody asked for.
 *
 * 820 by 1000 because the plane it goes on is 1.142 by 1.394, an
 * aspect of 0.82. At 540 it was stretched half as wide again across
 * and every logo on it with it.
 */
export function paintSkillPreview(hit, detail) {
  const W = 820;
  const H = 1000;
  const [c, g] = canvas(W, H);
  const mid = W / 2;
  const pad = 56;

  g.fillStyle = "#05070e";
  g.fillRect(0, 0, W, H);
  g.textAlign = "center";
  g.textBaseline = "alphabetic";

  if (!hit) {
    // A prompt waiting on input, not a comment explaining itself.
    // Three grey slashes in the middle of a terminal read as
    // chrome; a caret and a block cursor read as a thing that is
    // about to do something.
    let y = H / 2 - 110;

    g.fillStyle = ACCENT.blue;
    g.font = "600 86px " + MONO;
    g.fillText(">", mid - 44, y);
    // The cursor, sitting on the baseline beside it.
    g.fillRect(mid + 8, y - 54, 34, 58);

    y += 120;
    g.fillStyle = "#ffffff";
    g.font = "500 40px " + MONO;
    if ("letterSpacing" in g) g.letterSpacing = "8px";
    g.fillText("SELECT A SKILL", mid + 4, y);
    if ("letterSpacing" in g) g.letterSpacing = "0px";

    y += 34;
    g.fillStyle = "#2b3350";
    g.fillRect(mid - 110, y, 220, 2);

    y += 66;
    g.fillStyle = "#6f7694";
    g.font = "400 29px " + SANS;
    for (const line of ["Point at any tag to see", "where it was used."]) {
      g.fillText(line, mid, y);
      y += 42;
    }
    return finish(c);
  }

  // A pool of light under the mark. The brief asked for a glowing
  // icon and a glow is light on the surface behind a thing, not an
  // outline around it.
  const BOX = 300;
  const bx = mid - BOX / 2;
  const by = 120;
  const halo = g.createRadialGradient(
    mid,
    by + BOX / 2,
    0,
    mid,
    by + BOX / 2,
    BOX,
  );
  halo.addColorStop(0, "rgba(143,168,255,0.16)");
  halo.addColorStop(0.5, "rgba(143,168,255,0.05)");
  halo.addColorStop(1, "rgba(143,168,255,0)");
  g.fillStyle = halo;
  g.fillRect(bx - BOX / 2, by - BOX / 2, BOX * 2, BOX * 2);

  const icon = techIcon(detail?.icon);
  if (icon) {
    drawTech(g, icon, bx, by, BOX);
  } else {
    const label = hit.item.replace(/[^A-Za-z#+]/g, "").slice(0, 2) || "?";
    g.fillStyle = "#8fa8ff";
    g.font = "600 110px " + SANS;
    g.fillText(label, mid, by + BOX / 2 + 38);
  }

  let y = by + BOX + 96;

  g.fillStyle = ACCENT.blue;
  g.font = "500 24px " + MONO;
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  g.fillText(hit.group.toUpperCase(), mid, y);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  y += 72;
  g.fillStyle = "#ffffff";
  g.font = "600 58px " + SANS;
  for (const line of wrap(g, hit.item, W - pad * 2)) {
    g.fillText(line, mid, y);
    y += 66;
  }

  // A short rule rather than a full-width one: it is closing the
  // name, not dividing the screen.
  y += 14;
  g.fillStyle = "#2b3350";
  g.fillRect(mid - 90, y, 180, 2);
  y += 62;

  if (detail?.proof) {
    g.fillStyle = "#6f7694";
    g.font = "500 22px " + MONO;
    if ("letterSpacing" in g) g.letterSpacing = "5px";
    g.fillText("USED IN", mid, y);
    if ("letterSpacing" in g) g.letterSpacing = "0px";

    y += 52;
    g.fillStyle = "#c6cde4";
    g.font = "400 31px " + SANS;
    for (const line of wrap(g, detail.proof, W - pad * 2)) {
      g.fillText(line, mid, y);
      y += 44;
    }
  } else {
    g.fillStyle = "#4d5570";
    g.font = "400 29px " + SANS;
    for (const line of wrap(
      g,
      "On the list, with no one project worth pointing at.",
      W - pad * 2,
    )) {
      g.fillText(line, mid, y);
      y += 42;
    }
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
