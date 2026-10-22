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
/**
 * The monitor, as a profile page of pinned repositories.
 *
 * Two things shape this. The screen is 1024 by 628 and the grid is
 * far taller than that, so the whole grid is drawn once onto a tall
 * canvas and the plane shows a window onto it - scrolling is then a
 * texture offset, not a repaint. A repaint every frame of a scroll
 * is half a megapixel of canvas work and an upload to match, for a
 * picture that has not changed.
 *
 * And the hit boxes come back in canvas pixels rather than UV,
 * because the caller has to add the scroll offset before it can
 * know what is under the pointer.
 */
export const SCREEN_VIEW = { w: 1680, h: 726 };

/**
 * The browser chrome above the page, which does not scroll.
 *
 * The address bar used to be the first thing on the scrolling
 * canvas, so the one piece of furniture that said "this is a web
 * page" slid away the moment you pulled the list. Lifting it onto
 * its own strip is also what a browser actually does.
 */
export const CHROME_VIEW = { w: 1680, h: 173 };

/** GitHub's dot colour for the languages on this board. */
const LANG_DOT = {
  "Next.js": "#3178c6",
  React: "#61dafb",
  "React Native": "#61dafb",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  Python: "#3572a5",
  Racket: "#3c5caa",
  "Spring Boot": "#6db33f",
};

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** The little book the repo lists put in front of every name. */
function repoGlyph(g, x, y, s, colour) {
  g.strokeStyle = colour;
  g.lineWidth = s * 0.09;
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(x + s * 0.18, y + s * 0.12);
  g.lineTo(x + s * 0.18, y + s * 0.88);
  g.lineTo(x + s * 0.82, y + s * 0.88);
  g.stroke();
  g.beginPath();
  g.moveTo(x + s * 0.3, y + s * 0.12);
  g.lineTo(x + s * 0.82, y + s * 0.12);
  g.lineTo(x + s * 0.82, y + s * 0.7);
  g.lineTo(x + s * 0.3, y + s * 0.7);
  g.stroke();
}

function pill(g, x, y, label, font, ink, edge, padX = 10, h = 26) {
  g.font = font;
  const w = g.measureText(label).width + padX * 2;
  g.strokeStyle = edge;
  g.lineWidth = 1.5;
  roundRect(g, x, y, w, h, h / 2);
  g.stroke();
  g.fillStyle = ink;
  g.fillText(label, x + padX, y + h / 2 + 5);
  return w;
}

export function paintProjectsGrid(list) {
  const W = SCREEN_VIEW.w;
  const PAD = 30;
  const GAP = 20;
  const COLS = 3;
  const CARD_W = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
  const CARD_H = 212;
  // No search field or handle up here any more: that row is browser
  // chrome now and sits on its own strip above the page, where it
  // stays put instead of sliding away on the first drag.
  const HEAD = 76;

  // Every cell the same size. The first repository used to take two
  // columns and carry a star, which read well at ten projects and
  // stopped doing so at twelve: three rows of three behind one
  // double-wide leaves a hole in the grid, and the thing it was
  // pointing at is the first card you look at anyway.
  const rows = Math.ceil(list.length / COLS);
  const H = HEAD + rows * (CARD_H + GAP) + PAD;

  const [c, g] = canvas(W, H);
  const hits = [];

  g.fillStyle = "#0d1117";
  g.fillRect(0, 0, W, H);
  g.textBaseline = "alphabetic";
  g.textAlign = "left";

  g.fillStyle = "#7d8590";
  g.font = `600 20px ${SANS}`;
  g.fillText("Pinned", PAD, 48);
  g.strokeStyle = "#21262d";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(PAD + 82, 42);
  g.lineTo(W - PAD, 42);
  g.stroke();

  const card = (p, x, y, w) => {
    g.fillStyle = "#0d1117";
    g.strokeStyle = "#30363d";
    g.lineWidth = 2;
    roundRect(g, x, y, w, CARD_H, 10);
    g.fill();
    g.stroke();

    repoGlyph(g, x + 18, y + 20, 24, "#7d8590");

    g.fillStyle = "#4493f8";
    g.font = `600 22px ${SANS}`;
    const name = p.title.replace(/\s+/g, "-");
    g.fillText(name, x + 52, y + 40);
    const nameW = g.measureText(name).width;

    g.textBaseline = "alphabetic";
    pill(
      g,
      x + 64 + nameW,
      y + 20,
      p.private ? "Private" : "Public",
      `400 14px ${SANS}`,
      "#7d8590",
      "#30363d",
      11,
      25,
    );

    g.fillStyle = "#8b949e";
    g.font = `400 17px ${SANS}`;
    let ty = y + 78;
    for (const line of wrap(g, p.blurb ?? "", w - 40).slice(0, 3)) {
      g.fillText(line, x + 18, ty);
      ty += 24;
    }

    // Language dot and the rest of the stack, the way a repo card
    // puts its one language first and nothing else.
    const lang = (p.tech ?? [])[0];
    const dot = LANG_DOT[lang] ?? "#8b949e";
    const by = y + CARD_H - 26;
    g.fillStyle = dot;
    g.beginPath();
    g.arc(x + 25, by - 5, 6.5, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#8b949e";
    g.font = `400 16px ${SANS}`;
    g.fillText(lang ?? "", x + 40, by);

    let tx = x + 50 + g.measureText(lang ?? "").width;
    for (const t of (p.tech ?? []).slice(1, 4)) {
      g.font = `400 13px ${MONO}`;
      const tw = g.measureText(t).width + 16;
      if (tx + tw > x + w - 16) break;
      tx +=
        pill(
          g,
          tx,
          by - 17,
          t,
          `400 13px ${MONO}`,
          "#6e94c9",
          "#21304a",
          8,
          23,
        ) + 7;
    }

    hits.push({ id: p.id, r: 10, x0: x, y0: y, x1: x + w, y1: y + CARD_H });
  };

  list.forEach((p, i) => {
    const col = i % COLS;
    const row = (i - col) / COLS;
    card(p, PAD + col * (CARD_W + GAP), HEAD + row * (CARD_H + GAP), CARD_W);
  });

  return { tex: finish(c), hits, height: H };
}

/**
 * The browser window's own furniture: traffic lights, one tab and an
 * address bar. None of it does anything; all of it is why the thing
 * on the desk reads as a browser showing a page rather than as a
 * picture of a page.
 */
export function paintBrowserChrome() {
  const W = CHROME_VIEW.w;
  const H = CHROME_VIEW.h;
  const [c, g] = canvas(W, H);
  g.textBaseline = "middle";
  g.textAlign = "left";

  g.fillStyle = "#161b22";
  g.fillRect(0, 0, W, H);

  // Tab strip.
  const TAB_H = 86;
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
    g.fillStyle = col;
    g.beginPath();
    g.arc(42 + i * 32, TAB_H / 2, 10, 0, Math.PI * 2);
    g.fill();
  });

  const tabX = 150;
  const tabW = 560;
  g.fillStyle = "#0d1117";
  g.beginPath();
  g.moveTo(tabX, TAB_H);
  g.lineTo(tabX + 14, 16);
  g.quadraticCurveTo(tabX + 18, 10, tabX + 30, 10);
  g.lineTo(tabX + tabW - 30, 10);
  g.quadraticCurveTo(tabX + tabW - 18, 10, tabX + tabW - 14, 16);
  g.lineTo(tabX + tabW, TAB_H);
  g.closePath();
  g.fill();

  repoGlyph(g, tabX + 42, TAB_H / 2 - 13, 26, "#8b949e");
  g.fillStyle = "#c9d1d9";
  g.font = `400 25px ${SANS}`;
  g.fillText("abhinavgonthina · GitHub", tabX + 84, TAB_H / 2 + 1);
  g.strokeStyle = "#8b949e";
  g.lineWidth = 3;
  g.lineCap = "round";
  const cx = tabX + tabW - 44;
  g.beginPath();
  g.moveTo(cx - 8, TAB_H / 2 - 8);
  g.lineTo(cx + 8, TAB_H / 2 + 8);
  g.moveTo(cx + 8, TAB_H / 2 - 8);
  g.lineTo(cx - 8, TAB_H / 2 + 8);
  g.stroke();

  // Toolbar.
  g.fillStyle = "#0d1117";
  g.fillRect(0, TAB_H, W, H - TAB_H);
  const my = TAB_H + (H - TAB_H) / 2;

  g.lineWidth = 3;
  g.lineJoin = "round";
  g.lineCap = "round";

  /** A shaft with a head on it, the way a browser draws back and forward. */
  const navArrow = (ax, dir, ink) => {
    const L = 10;
    const tip = ax + dir * L;
    const tail = ax - dir * L;
    g.strokeStyle = ink;
    g.beginPath();
    g.moveTo(tail, my);
    g.lineTo(tip, my);
    g.moveTo(tip - dir * 8, my - 8);
    g.lineTo(tip, my);
    g.lineTo(tip - dir * 8, my + 8);
    g.stroke();
  };
  // Back is live, forward is greyed, because there is nowhere
  // forward to go - which is what a browser shows too.
  navArrow(46, -1, "#c9d1d9");
  navArrow(100, 1, "#484f58");

  // Reload.
  //
  // The head has to be in proportion to the ring and sat on the end
  // of it. Oversized, it stops reading as the point of an arrow and
  // starts reading as a separate blob stuck to a circle - which is
  // what the last two versions of this did. A head about two stroke
  // widths long, its base square across the end of the arc, and a
  // gap just wide enough to have obviously been left.
  const rx0 = 154;
  const rr = 10;
  // The head finishes at twelve o'clock, where the tangent is dead
  // horizontal, so it points cleanly along the way the ring turns.
  // Ending at ten o'clock put the arrow out on the shoulder of the
  // circle, aiming off into nothing.
  // The head sits at the end of the arc and then reaches a further
  // thirty-odd degrees past it along the tangent, so the tail has
  // to start well clear of where the head finishes or the two touch
  // and the gap disappears. Head at twelve, tail starting at five
  // past, which leaves daylight between them.
  const END = Math.PI * 1.5;
  g.lineWidth = 2.6;
  g.strokeStyle = "#c9d1d9";
  g.beginPath();
  g.arc(rx0, my, rr, -Math.PI * 0.14, END);
  g.stroke();

  const ex = rx0 + Math.cos(END) * rr;
  const ey = my + Math.sin(END) * rr;
  // Travelling direction at the end of the arc, and the radius out
  // through that point: the head is one along and two across.
  const tx = -Math.sin(END);
  const ty = Math.cos(END);
  const nx2 = Math.cos(END);
  const ny2 = Math.sin(END);
  const LEN = 6.5;
  const HALF = 4.1;
  g.fillStyle = "#c9d1d9";
  g.beginPath();
  g.moveTo(ex + tx * LEN, ey + ty * LEN);
  g.lineTo(ex - nx2 * HALF, ey - ny2 * HALF);
  g.lineTo(ex + nx2 * HALF, ey + ny2 * HALF);
  g.closePath();
  g.fill();

  // The address bar.
  const ax = 196;
  const aw = W - ax - 70;
  g.fillStyle = "#161b22";
  g.strokeStyle = "#30363d";
  g.lineWidth = 2;
  roundRect(g, ax, my - 26, aw, 52, 26);
  g.fill();
  g.stroke();

  // A padlock, because that is the glyph everyone reads as "browser".
  g.strokeStyle = "#3fb950";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(ax + 34, my - 4, 7, Math.PI, 0);
  g.stroke();
  g.fillStyle = "#3fb950";
  roundRect(g, ax + 25, my - 4, 18, 14, 3);
  g.fill();

  g.font = `400 24px ${MONO}`;
  g.fillStyle = "#6e7681";
  g.fillText("https://", ax + 60, my + 1);
  const pre = g.measureText("https://").width;
  g.fillStyle = "#c9d1d9";
  g.fillText("github.com/abhinavgonthina", ax + 60 + pre, my + 1);

  return finish(c);
}

/**
 * What the screen says before it has ever been dragged.
 *
 * Words on the glass and nothing else - no plate, no pill. A box
 * floating over the middle of a web page reads as part of the page,
 * and this is not part of the page; it is the screen talking. The
 * shadow is the only thing holding it up, and it is there because
 * white text over a list of white text is unreadable without one.
 */
export function paintDragHint() {
  const W = 1200;
  const H = 340;
  const [c, g] = canvas(W, H);
  g.textBaseline = "middle";
  g.textAlign = "center";

  const mx = W / 2;
  // Laid out so the middle of the block sits on the middle of the
  // canvas, not so the words happen to land near it. The plane this
  // goes on is centred on the page, so anything off-centre in here
  // is off-centre on the screen.
  //
  // Set above the geometric middle on purpose. The weight of this
  // block is the big line, and the big line is the lower of the
  // three, so a block centred by its bounding box reads low.
  const ARROW = 92;
  const TITLE = 194;
  const UNDER = 258;

  // A soft darkening under the words, gone before the edges of the
  // canvas.
  //
  // Not a plate: a plate over the middle of a web page reads as
  // part of the page. But the small line is grey mono at the size
  // and weight of the card text beneath it, so without something
  // the two interleave into a thing neither of them can be read
  // through. A drop shadow is enough to hold a heavy white line
  // over anything; it is not enough for a light grey one. This has
  // no edge to see, so it still reads as the screen dimming rather
  // than as a box on the list.
  const haze = g.createRadialGradient(mx, 176, 0, mx, 176, 170);
  haze.addColorStop(0, "rgba(1,3,8,0.97)");
  haze.addColorStop(0.45, "rgba(1,3,8,0.9)");
  haze.addColorStop(0.75, "rgba(1,3,8,0.55)");
  haze.addColorStop(1, "rgba(1,3,8,0)");
  g.save();
  g.translate(mx, 176);
  g.scale(2.9, 1);
  g.translate(-mx, -176);
  g.fillStyle = haze;
  g.fillRect(-W, 0, W * 3, H);
  g.restore();

  g.save();
  g.shadowColor = "rgba(0,0,0,0.95)";
  g.shadowBlur = 26;
  g.strokeStyle = "#e6edf3";
  g.lineWidth = 7;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(mx, ARROW - 42);
  g.lineTo(mx, ARROW + 42);
  g.moveTo(mx - 18, ARROW - 24);
  g.lineTo(mx, ARROW - 44);
  g.lineTo(mx + 18, ARROW - 24);
  g.moveTo(mx - 18, ARROW + 24);
  g.lineTo(mx, ARROW + 44);
  g.lineTo(mx + 18, ARROW + 24);
  g.stroke();
  g.restore();

  // Mono, upper case, widely tracked - the voice the rest of the
  // site tells you things in. It was set in the body sans, which
  // made it read as part of the page behind it rather than as the
  // screen talking over the top.
  g.save();
  g.shadowColor = "rgba(0,0,0,0.95)";
  g.shadowBlur = 30;
  g.fillStyle = "#ffffff";
  g.font = `600 62px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = "10px";
  g.fillText("DRAG TO SCROLL", mx, TITLE);
  if ("letterSpacing" in g) g.letterSpacing = "0px";
  g.restore();

  g.save();
  g.shadowColor = "rgba(0,0,0,0.9)";
  g.shadowBlur = 20;
  g.fillStyle = "#b9c3d2";
  g.font = `400 25px ${MONO}`;
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  g.fillText("CLICK A REPOSITORY TO OPEN IT", mx, UNDER);
  if ("letterSpacing" in g) g.letterSpacing = "0px";
  g.restore();

  return finish(c);
}

export function paintProjectDetail(p, shot) {
  const W = SCREEN_VIEW.w;
  const H = SCREEN_VIEW.h;
  const PAD = 30;
  /** The gap under the language bar, and under the topics. */
  const ROW_GAP = 30;
  const BAR_H = 12;
  const PILL_H = 34;
  const [c, g] = canvas(W, H);
  const hits = [];

  g.fillStyle = "#0d1117";
  g.fillRect(0, 0, W, H);
  g.textBaseline = "alphabetic";
  g.textAlign = "left";

  // Back bar.
  g.fillStyle = "#161b22";
  g.fillRect(0, 0, W, 64);
  g.strokeStyle = "#30363d";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 64);
  g.lineTo(W, 64);
  g.stroke();
  // A button, not a line of blue text. It is the only way out of
  // this view and it was a word in a bar that reads as a title.
  g.font = `600 21px ${SANS}`;
  const backLabel = "←  Back to pinned";
  const backW = g.measureText(backLabel).width + 48;
  g.fillStyle = "#21262d";
  g.strokeStyle = "#4493f8";
  g.lineWidth = 2;
  roundRect(g, PAD, 11, backW, 42, 21);
  g.fill();
  g.stroke();
  g.fillStyle = "#79c0ff";
  g.fillText(backLabel, PAD + 24, 38);
  hits.push({
    id: "__back",
    // A pill, so the highlight has to be one too.
    r: 21,
    x0: PAD,
    y0: 11,
    x1: PAD + backW,
    y1: 53,
  });

  // The breadcrumb: owner in regular, repository in bold, the way
  // GitHub weights the half of the path that matters.
  repoGlyph(g, PAD, 78, 26, "#8b949e");
  g.fillStyle = "#4493f8";
  g.font = `400 27px ${SANS}`;
  const owner = "abhinavgonthina / ";
  g.fillText(owner, PAD + 40, 102);
  const ownerW = g.measureText(owner).width;
  g.font = `700 27px ${SANS}`;
  const name = p.title.replace(/\s+/g, "-");
  g.fillText(name, PAD + 40 + ownerW, 102);
  const nameW = g.measureText(name).width;
  pill(
    g,
    PAD + 54 + ownerW + nameW,
    81,
    p.private ? "Private" : "Public",
    `400 15px ${SANS}`,
    "#8b949e",
    "#30363d",
    12,
    27,
  );

  // Watch / Fork / Star, right aligned and purely furniture.
  let rx = W - PAD;
  for (const label of ["Star", "Fork", "Watch"]) {
    g.font = `500 15px ${SANS}`;
    const w = g.measureText(label).width + 32;
    rx -= w;
    g.fillStyle = "#21262d";
    g.strokeStyle = "#30363d";
    g.lineWidth = 1.5;
    roundRect(g, rx, 80, w, 30, 6);
    g.fill();
    g.stroke();
    g.fillStyle = "#c9d1d9";
    g.fillText(label, rx + 16, 100);
    rx -= 10;
  }

  // The tab strip, with the orange rule under the open one.
  const TABS = [
    "Code",
    "Issues",
    "Pull requests",
    "Actions",
    "Projects",
    "Security",
    "Insights",
  ];
  let tx = PAD;
  const tabY = 152;
  TABS.forEach((t, i) => {
    g.font = `${i === 0 ? 600 : 400} 17px ${SANS}`;
    const w = g.measureText(t).width;
    g.fillStyle = i === 0 ? "#e6edf3" : "#8b949e";
    g.fillText(t, tx, tabY);
    if (i === 0) {
      g.fillStyle = "#fd8c73";
      g.fillRect(tx - 6, tabY + 18, w + 12, 3);
    }
    tx += w + 34;
  });
  g.strokeStyle = "#30363d";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, tabY + 20);
  g.lineTo(W, tabY + 20);
  g.stroke();

  // Two columns under the chrome: what it is on the left, what it
  // looks like on the right.
  const TOP = tabY + 52;
  const RX = 790;
  const LW = RX - PAD - 34;

  g.fillStyle = "#8b949e";
  g.font = `600 18px ${SANS}`;
  if ("letterSpacing" in g) g.letterSpacing = "1.5px";
  g.fillText("ABOUT", PAD, TOP);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  g.fillStyle = "#7d8590";
  g.font = `400 17px ${MONO}`;
  g.fillText(p.period ?? "", PAD + 108, TOP);

  g.fillStyle = "#c9d1d9";
  g.font = `400 23px ${SANS}`;
  let y = TOP + 40;
  // Six lines, not seven. Seven plus two rows of pills reaches far
  // enough down the screen that the buttons have nowhere left to
  // go - see the clamp this replaced, below.
  for (const line of wrap(g, p.description ?? p.blurb ?? "", LW).slice(0, 6)) {
    g.fillText(line, PAD, y);
    y += 33;
  }

  // The language bar: the one piece of GitHub furniture that is
  // actually about this project rather than about the frame.
  const tech = p.tech ?? [];
  if (tech.length) {
    y += 22;
    const bw = LW;
    const seg = bw / tech.length;
    tech.forEach((t, i) => {
      g.fillStyle = LANG_DOT[t] ?? ["#8b949e", "#6e7681", "#484f58"][i % 3];
      const sx = PAD + i * seg;
      g.fillRect(
        sx,
        y,
        Math.ceil(seg) + (i === tech.length - 1 ? 0 : 1),
        BAR_H,
      );
    });
    y += BAR_H + ROW_GAP;

    let px = PAD;
    for (const t of tech) {
      g.font = `400 17px ${MONO}`;
      const tw = g.measureText(t).width + 26;
      if (px + tw > PAD + LW) {
        px = PAD;
        y += PILL_H + 10;
      }
      px +=
        pill(
          g,
          px,
          y,
          t,
          `400 17px ${MONO}`,
          "#6e94c9",
          "#21304a",
          13,
          PILL_H,
        ) + 10;
    }
    // `y` is the top of the last row of pills, so the bottom of the
    // block is one pill further down. Both gaps are measured the
    // same way off the same constant, which is the only way they
    // stay equal when any of these heights change.
    y += PILL_H;
  }

  // The links sit under the content rather than on the floor of the
  // screen. Pinned to the bottom they read as a toolbar belonging to
  // the window instead of to the repository, and on a short
  // description there was a hand's width of nothing above them.
  //
  // One gap, the same one that sits under the language bar, and no
  // ceiling on it. There used to be a `Math.min` here holding the
  // buttons off the floor, and on the longest description it did
  // not hold them off anything - it pulled them up to 594 when the
  // pills ended at 617, so the one gap on this screen that is
  // supposed to match the one above it was negative.
  const by = y + ROW_GAP;
  const button = (label, bx, wide, primary, id, href) => {
    g.fillStyle = primary ? "#238636" : "#21262d";
    g.strokeStyle = primary ? "#2ea043" : "#30363d";
    g.lineWidth = 2;
    roundRect(g, bx, by, wide, 56, 10);
    g.fill();
    g.stroke();
    g.fillStyle = primary ? "#ffffff" : "#c9d1d9";
    g.font = `600 22px ${SANS}`;
    g.textAlign = "center";
    g.fillText(label, bx + wide / 2, by + 36);
    g.textAlign = "left";
    hits.push({ id, href, r: 10, x0: bx, y0: by, x1: bx + wide, y1: by + 56 });
  };

  // Centred under the column rather than hard against its left
  // edge. Two buttons of different widths lined up on the left read
  // as the start of a row that never arrived.
  // Sized off the column rather than off two numbers that happened
  // to look right: two links split it, one takes the middle half.
  // Fixed widths left a short label swimming in its own button and
  // a gap down the side of the column that belonged to nothing.
  const GAP = 20;
  const both = Boolean(p.live && p.github);
  const wide = both ? (LW - GAP) / 2 : LW * 0.52;
  let bx = both ? PAD : PAD + (LW - wide) / 2;
  if (p.live) {
    button("Live site", bx, wide, true, "__live", p.live);
    bx += wide + GAP;
  }
  if (p.github) button("GitHub repo", bx, wide, false, "__github", p.github);

  // The preview, down the right and nearly the full height of what
  // is left under the tabs.
  const px = RX;
  const pw = W - px - PAD;
  // Clear of the rule under the tabs rather than hung off it, and
  // the same gap underneath, so the panel sits in the space rather
  // than at the top of it.
  const py = tabY + 44;
  const ph = H - py - 40;
  g.fillStyle = "#010409";
  g.strokeStyle = "#30363d";
  g.lineWidth = 2;
  roundRect(g, px, py, pw, ph, 10);
  g.fill();
  g.stroke();

  if (shot) {
    // Scaled by height, not to cover, and never stretched.
    //
    // Covering crops whatever will not fit underneath, which on a
    // phone screenshot is most of the screenshot - a status bar
    // and the top of a header. By height the whole screen is in
    // the frame: a tall one sits as a narrow panel in the middle
    // of it, a wide one runs off the sides and loses only its
    // edges.
    //
    // Inset, so the frame is still there. Fitted to the panel's full
    // height a tall screenshot - a phone, which is what half of
    // these are - covers the top and bottom of the outline it is
    // supposed to be sitting inside, and the panel stops reading as
    // a frame at all.
    const INSET = 12;
    const iw = pw - INSET * 2;
    const ih = ph - INSET * 2;
    const s = ih / shot.height;
    const sw = shot.width * s;
    const sh = shot.height * s;
    g.save();
    roundRect(g, px + INSET, py + INSET, iw, ih, 6);
    g.clip();
    g.drawImage(
      shot,
      px + INSET + (iw - sw) / 2,
      py + INSET + (ih - sh) / 2,
      sw,
      sh,
    );
    g.restore();
  } else {
    g.fillStyle = "#30363d";
    g.font = `400 16px ${MONO}`;
    g.textAlign = "center";
    g.fillText("no preview — see the live site", px + pw / 2, py + ph / 2);
    g.textAlign = "left";
  }

  return { tex: finish(c), hits };
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
function drawSkillPreview(g, W, H, hit, detail) {
  const mid = W / 2;
  const pad = 56;

  // Drawn over the top of the last one, so anything a previous pass
  // left set on the context has to be put back. The fill covers the
  // canvas, but letter spacing and alpha do not reset themselves.
  g.globalAlpha = 1;
  if ("letterSpacing" in g) g.letterSpacing = "0px";
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

    // The same rhythm the pointed-at screen has: the rule sits well
    // clear of the heading it closes, and the copy clear of the
    // rule. Set tighter here, the waiting state read as a different
    // screen rather than the same one with nothing in it yet.
    y += 56;
    g.fillStyle = "#2b3350";
    g.fillRect(mid - 110, y, 220, 2);

    y += 72;
    g.fillStyle = "#6f7694";
    g.font = "400 29px " + SANS;
    for (const line of ["Point at any tag to see", "where it was used."]) {
      g.fillText(line, mid, y);
      y += 44;
    }
    return;
  }

  // A pool of light under the mark. The brief asked for a glowing
  // icon and a glow is light on the surface behind a thing, not an
  // outline around it.
  const BOX = 220;
  const bx = mid - BOX / 2;
  const by = 84;
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

  let y = by + BOX + 64;

  g.fillStyle = ACCENT.blue;
  g.font = "500 24px " + MONO;
  if ("letterSpacing" in g) g.letterSpacing = "6px";
  g.fillText(hit.group.toUpperCase(), mid, y);
  if ("letterSpacing" in g) g.letterSpacing = "0px";

  y += 60;
  g.fillStyle = "#ffffff";
  g.font = "600 52px " + SANS;
  for (const line of wrap(g, hit.item, W - pad * 2)) {
    g.fillText(line, mid, y);
    y += 56;
  }

  // A short rule rather than a full-width one: it is closing the
  // name, not dividing the screen.
  y += 12;
  g.fillStyle = "#2b3350";
  g.fillRect(mid - 90, y, 180, 2);
  // The rule closes the name. It has to sit nearer to the name than
  // to the sentence under it, or it reads as the sentence's own
  // underline and the two run together as one block.
  y += 72;

  // What the thing is for, in his hands. Every skill has one, and
  // it answers the question the tag raises before any list of
  // places does.
  if (detail?.use) {
    g.fillStyle = "#d7dcea";
    g.font = "400 30px " + SANS;
    for (const line of wrap(g, detail.use, W - pad * 2)) {
      g.fillText(line, mid, y);
      y += 44;
    }
    y += 16;
  }

  // Then where, as bullets down the left. Centred, a list is one
  // nobody can scan: the left edge of every line lands somewhere
  // different.
  const proof = detail?.proof ? [].concat(detail.proof) : [];
  if (proof.length) {
    y += 30;
    g.textAlign = "left";
    g.font = "400 28px " + SANS;
    const tx = pad + 28;
    for (const item of proof) {
      const lines = wrap(g, item, W - pad - tx);
      g.fillStyle = ACCENT.blue;
      g.fillText("•", pad + 4, y);
      g.fillStyle = "#aab3c9";
      for (const line of lines) {
        g.fillText(line, tx, y);
        y += 38;
      }
      y += 12;
    }
    g.textAlign = "center";
  }
}

/**
 * The preview screen: one canvas, one texture, repainted in place.
 *
 * It used to build a fresh canvas and a fresh `CanvasTexture` on
 * every hover and throw the last one away. That is an 820 by 1000
 * GPU allocation, a full upload and a mipmap chain per tag crossed,
 * plus the matching free - and with the board swaying under the
 * pointer, the tag under the cursor changes whenever the camera
 * moves and not only when the hand does. The allocation was costing
 * more than the drawing.
 *
 * So the canvas and the texture are made once and the picture is
 * drawn over the top of itself. Mipmaps are off because the panel is
 * seen close to head-on at a near-constant size, and rebuilding the
 * chain was the most expensive part of every update.
 */
export function makeSkillScreen() {
  const W = 820;
  const H = 1000;
  const [c, g] = canvas(W, H);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  return {
    tex,
    draw(hit, detail) {
      drawSkillPreview(g, W, H, hit, detail);
      tex.needsUpdate = true;
    },
  };
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
