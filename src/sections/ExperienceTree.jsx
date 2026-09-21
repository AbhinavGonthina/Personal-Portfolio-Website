import { useState } from "react";
import { motion } from "motion/react";
import { palette, MONO } from "../theme";
import { Leaf } from "../components/Botanical";
import { experience } from "../data/experience";

// Horizontal tree: roots at the left, trunk growing right, branches alternating
// above and below. Wide and short, so it reads across the page.
const VB = { w: 1120, h: 400 };
const TRUNK = { y: 200, baseX: 68, tipX: 1058 };

const COLS = [182, 322, 462, 602, 742, 882];
const SIDES = [-1, 1, -1, 1, -1, 1]; // -1 = up, 1 = down
const RUN = 58;
const RISE = 96;

const CARD = { w: 178, h: 58, gap: 30, r: 10 };

// Long company names wrap onto two lines rather than overflowing the card.
function splitLabel(label, max = 15) {
  if (label.length <= max) return [label];
  const words = label.split(" ");
  let best = null;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const diff = Math.abs(a.length - b.length);
    if (diff < bestDiff) {
      best = [a, b];
      bestDiff = diff;
    }
  }
  return best ?? [label];
}

const TRUNK_DUR = 1.05;
const EASE = [0.22, 1, 0.36, 1];
const LEAF_ALT = "#6E5E50";

const sproutDelay = (x) =>
  0.12 + TRUNK_DUR * ((x - TRUNK.baseX) / (TRUNK.tipX - TRUNK.baseX)) * 0.92;

const trunkY = (x) => {
  const t = (x - TRUNK.baseX) / (TRUNK.tipX - TRUNK.baseX);
  return TRUNK.y + Math.sin(t * Math.PI * 1.15) * 7 - t * 4;
};

const trunkHalf = (t) => 15 - 12 * Math.pow(t, 0.72);

const bez = (p0, c1, c2, p1, t) => {
  const u = 1 - t;
  return {
    x:
      u ** 3 * p0.x +
      3 * u * u * t * c1.x +
      3 * u * t * t * c2.x +
      t ** 3 * p1.x,
    y:
      u ** 3 * p0.y +
      3 * u * u * t * c1.y +
      3 * u * t * t * c2.y +
      t ** 3 * p1.y,
  };
};

const bezAngle = (p0, c1, c2, p1, t) => {
  const u = 1 - t;
  const dx =
    3 * u * u * (c1.x - p0.x) +
    6 * u * t * (c2.x - c1.x) +
    3 * t * t * (p1.x - c2.x);
  const dy =
    3 * u * u * (c1.y - p0.y) +
    6 * u * t * (c2.y - c1.y) +
    3 * t * t * (p1.y - c2.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

function branchCurve(i) {
  const x = COLS[i];
  const dir = SIDES[i];
  const run = RUN + (i % 3) * 7;
  const rise = RISE - (i % 2) * 6;
  const p0 = { x, y: trunkY(x) + dir * 3 };
  const p1 = { x: x + run, y: p0.y + dir * rise };
  const c1 = { x: x + run * 0.12, y: p0.y + dir * rise * 0.46 };
  const c2 = { x: x + run * 0.58, y: p0.y + dir * rise * 0.9 };
  return {
    p0,
    c1,
    c2,
    p1,
    dir,
    d: `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`,
  };
}

function trunkPath() {
  const steps = 26;
  const top = [];
  const bottom = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const x = TRUNK.baseX + (TRUNK.tipX - TRUNK.baseX) * t;
    const half = trunkHalf(t);
    top.push(`${x} ${trunkY(x) - half}`);
    bottom.unshift(`${x} ${trunkY(x) + half}`);
  }
  return `M ${top.join(" L ")} L ${bottom.join(" L ")} Z`;
}

// Thin darker lines following the trunk, so the bark isn't a flat slab.
function barkLine(offset) {
  const steps = 18;
  const pts = [];
  for (let k = 0; k <= steps; k++) {
    const t = k / steps;
    const x = TRUNK.baseX + (TRUNK.tipX - TRUNK.baseX) * t;
    pts.push(`${x} ${trunkY(x) + trunkHalf(t) * offset}`);
  }
  return `M ${pts.join(" L ")}`;
}

const LEAF_STOPS = [
  { t: 0.24, side: -1, s: 0.72, tilt: -44 },
  { t: 0.36, side: 1, s: 0.86, tilt: 40 },
  { t: 0.47, side: -1, s: 0.96, tilt: -36 },
  { t: 0.58, side: 1, s: 1, tilt: 38 },
  { t: 0.69, side: -1, s: 0.9, tilt: -32 },
  { t: 0.79, side: 1, s: 0.8, tilt: 34 },
];

const TWIG_STOPS = [
  { t: 0.42, len: 20, spread: -38 },
  { t: 0.66, len: 16, spread: 34 },
];

// Unlabelled filler branches behind the trunk, for depth.
const GHOSTS = [
  { x: 250, dir: -1, run: 40, rise: 58 },
  { x: 392, dir: 1, run: 36, rise: 52 },
  { x: 532, dir: -1, run: 34, rise: 48 },
  { x: 672, dir: 1, run: 38, rise: 54 },
  { x: 812, dir: -1, run: 32, rise: 44 },
  { x: 952, dir: 1, run: 30, rise: 40 },
];

function rootStroke(len, tipDy) {
  const bx = TRUNK.baseX + 10;
  const by = TRUNK.y;
  return `M ${bx} ${by} Q ${bx - len * 0.55} ${by + tipDy * 0.25}, ${bx - len} ${by + tipDy}`;
}

const ROOTS = [
  { d: rootStroke(58, -28), w: 11, o: 0.9 },
  { d: rootStroke(55, 26), w: 11, o: 0.9 },
  { d: rootStroke(42, -6), w: 9, o: 0.75 },
  { d: rootStroke(46, 9), w: 9, o: 0.75 },
  { d: rootStroke(32, -44), w: 6.5, o: 0.5 },
  { d: rootStroke(30, 40), w: 6.5, o: 0.5 },
];

function shortRange(start, end) {
  const sy = start.match(/\d{4}/)?.[0];
  const ey = end.match(/\d{4}/)?.[0];
  const sm = start.replace(/\s*\d{4}/, "").trim();
  const em = end.replace(/\s*\d{4}/, "").trim();
  if (!sm && !em) return sy === ey ? sy : `${sy}–${ey}`;
  if (!sm) return sy === ey ? sy : `${sy}–${em} ${ey.slice(2)}`;
  if (sy === ey) return `${sm}–${em} ${sy}`;
  const s = sm ? `${sm} ${sy.slice(2)}` : sy;
  const e = em ? `${em} ${ey.slice(2)}` : ey;
  return `${s}–${e}`;
}

export default function ExperienceTree({ selected, onSelect }) {
  const [hovered, setHovered] = useState(null);
  const focus = hovered ?? selected;

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      role="group"
      aria-label="Work experience tree"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <filter id="cardShadow" x="-25%" y="-40%" width="150%" height="190%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="#2A3B2A"
            floodOpacity="0.08"
          />
        </filter>
        {/* Fades the left end so the roots don't read as a chopped-off log */}
        <linearGradient id="baseFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id="baseFadeMask" maskUnits="userSpaceOnUse">
          <rect x={0} y={0} width={160} height={VB.h} fill="url(#baseFade)" />
          <rect x={160} y={0} width={VB.w - 160} height={VB.h} fill="#fff" />
        </mask>
      </defs>

      {/* Depth layer: unlabelled branches behind the trunk */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        opacity={0.26}
      >
        {GHOSTS.map((g, k) => {
          const p0 = { x: g.x, y: trunkY(g.x) };
          const p1 = { x: g.x + g.run, y: p0.y + g.dir * g.rise };
          const c1 = { x: g.x + g.run * 0.1, y: p0.y + g.dir * g.rise * 0.5 };
          const c2 = { x: g.x + g.run * 0.6, y: p0.y + g.dir * g.rise * 0.9 };
          const ang = bezAngle(p0, c1, c2, p1, 0.9);
          return (
            <g key={k}>
              <path
                d={`M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`}
                fill="none"
                stroke={palette.bark}
                strokeWidth={2.6}
                strokeLinecap="round"
              />
              {[0.55, 0.78].map((t, j) => {
                const pt = bez(p0, c1, c2, p1, t);
                return (
                  <Leaf
                    key={j}
                    x={pt.x}
                    y={pt.y}
                    angle={bezAngle(p0, c1, c2, p1, t) + (j ? 34 : -34)}
                    len={12}
                    wid={4}
                    fill={palette.bark}
                  />
                );
              })}
              <Leaf
                x={p1.x}
                y={p1.y}
                angle={ang}
                len={13}
                wid={4.2}
                fill={palette.bark}
              />
            </g>
          );
        })}
      </motion.g>

      {/* Roots and trunk share a mask that fades their left end out */}
      <g mask="url(#baseFadeMask)">
        {/* Ground shadow */}
        <motion.ellipse
          cx={TRUNK.baseX - 6}
          cy={TRUNK.y + 44}
          rx={64}
          ry={9}
          fill={palette.bark}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.08 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        />

        {/* Roots */}
        <motion.g
          initial={{ opacity: 0, scale: 0.72 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{ transformOrigin: `${TRUNK.baseX}px ${TRUNK.y}px` }}
        >
          {ROOTS.map((r, k) => (
            <path
              key={k}
              d={r.d}
              fill="none"
              stroke={palette.bark}
              strokeWidth={r.w}
              strokeLinecap="round"
              opacity={r.o}
            />
          ))}
        </motion.g>

        {/* Trunk + bark texture. Grows left-to-right by scaling the group itself.
          A clipPath can't be used here: its rect lives inside <defs>, which has
          no layout box, so whileInView never fires and the trunk stays hidden. */}
        <motion.g
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: TRUNK_DUR, ease: "easeOut" }}
          style={{ transformOrigin: `${TRUNK.baseX}px ${TRUNK.y}px` }}
        >
          <path d={trunkPath()} fill={palette.bark} />
          {[-0.55, -0.16, 0.3, 0.66].map((o, k) => (
            <path
              key={k}
              d={barkLine(o)}
              fill="none"
              stroke={palette.barkDeep}
              strokeWidth={k % 2 ? 0.9 : 1.3}
              opacity={0.3}
              strokeLinecap="round"
            />
          ))}
        </motion.g>
      </g>

      {/* Chronology markers at each end of the trunk */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: TRUNK_DUR, duration: 0.4 }}
      >
        {[
          { x: 92, label: "MOST RECENT" },
          { x: 1032, label: "EARLIEST" },
        ].map((m) => (
          <text
            key={m.label}
            x={m.x}
            y={trunkY(m.x) - 54}
            textAnchor="middle"
            style={{
              fontFamily: MONO,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              fill: palette.muted,
            }}
          >
            {m.label}
          </text>
        ))}
      </motion.g>

      {/* Growing tip */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ delay: TRUNK_DUR + 0.05, duration: 0.35, ease: EASE }}
        style={{ transformOrigin: `${TRUNK.tipX}px ${trunkY(TRUNK.tipX)}px` }}
      >
        {[
          [6, -4, -36],
          [6, 4, 36],
          [16, -10, -16],
          [18, 6, 20],
          [26, -2, 0],
        ].map(([dx, dy, rot], k) => (
          <Leaf
            key={k}
            x={TRUNK.tipX + dx}
            y={trunkY(TRUNK.tipX) + dy}
            angle={rot}
            len={15}
            wid={4.8}
            fill={k % 2 ? LEAF_ALT : palette.bark}
            opacity={0.75}
          />
        ))}
      </motion.g>

      {experience.map((exp, i) => {
        const { p0, c1, c2, p1, dir, d } = branchCurve(i);
        const isActive = selected === exp.id;
        const isHovered = hovered === exp.id;
        const isFocus = focus === exp.id;
        const dimmed = focus && !isFocus;
        const delay = sproutDelay(COLS[i]);

        const tone = isFocus ? palette.accent : palette.bark;
        const toneAlt = isFocus ? palette.accentDark : LEAF_ALT;
        const cardCy = p1.y + dir * CARD.gap;
        const nameLines = splitLabel(exp.short);

        return (
          <g
            key={exp.id}
            onMouseEnter={() => setHovered(exp.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              opacity: dimmed ? 0.4 : 1,
              transition: "opacity .22s ease",
            }}
          >
            <motion.g
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.2, delay }}
              style={{
                transformOrigin: `${p0.x}px ${p0.y}px`,
                transform: isHovered ? "scale(1.03)" : "scale(1)",
                transition: "transform .25s cubic-bezier(.22,1,.36,1)",
              }}
            >
              <motion.path
                d={d}
                fill="none"
                stroke={tone}
                strokeWidth={isFocus ? 6 : 4.6}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.42, delay, ease: "easeOut" }}
                style={{ transition: "stroke .2s ease, stroke-width .2s ease" }}
              />

              <motion.g
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: delay + 0.28 }}
              >
                {/* Secondary shoots, each with its own pair of leaves */}
                {TWIG_STOPS.map((tw, k) => {
                  const a = bez(p0, c1, c2, p1, tw.t);
                  const ang = bezAngle(p0, c1, c2, p1, tw.t) + tw.spread;
                  const rad = (ang * Math.PI) / 180;
                  const end = {
                    x: a.x + Math.cos(rad) * tw.len,
                    y: a.y + Math.sin(rad) * tw.len,
                  };
                  return (
                    <g key={k}>
                      <path
                        d={`M ${a.x} ${a.y} L ${end.x} ${end.y}`}
                        stroke={tone}
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        opacity={0.8}
                        style={{ transition: "stroke .2s ease" }}
                      />
                      <Leaf
                        x={end.x}
                        y={end.y}
                        angle={ang}
                        len={13}
                        wid={4.2}
                        fill={toneAlt}
                        opacity={isFocus ? 0.85 : 0.6}
                      />
                      <Leaf
                        x={a.x + Math.cos(rad) * tw.len * 0.55}
                        y={a.y + Math.sin(rad) * tw.len * 0.55}
                        angle={ang - 40}
                        len={11}
                        wid={3.6}
                        fill={tone}
                        opacity={isFocus ? 0.75 : 0.5}
                      />
                    </g>
                  );
                })}

                {LEAF_STOPS.map((lf, k) => {
                  const pt = bez(p0, c1, c2, p1, lf.t);
                  const ang = bezAngle(p0, c1, c2, p1, lf.t);
                  return (
                    <Leaf
                      key={k}
                      x={pt.x + lf.side * 3}
                      y={pt.y}
                      angle={ang + lf.tilt}
                      len={18 * lf.s}
                      wid={5.8 * lf.s}
                      fill={k % 2 ? toneAlt : tone}
                      opacity={isFocus ? 0.9 : 0.58}
                    />
                  );
                })}

                {/* Cluster around the endpoint */}
                {[-58, 6, 62].map((rot, k) => (
                  <Leaf
                    key={k}
                    x={p1.x}
                    y={p1.y}
                    angle={bezAngle(p0, c1, c2, p1, 1) + rot}
                    len={15}
                    wid={4.8}
                    fill={k === 1 ? toneAlt : tone}
                    opacity={isFocus ? 0.9 : 0.55}
                  />
                ))}
              </motion.g>
            </motion.g>

            <motion.g
              initial={{ opacity: 0, y: dir * 5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.3, delay: delay + 0.26 }}
            >
              <g
                onClick={() => onSelect(exp.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(exp.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`${exp.company}, ${exp.role}, ${exp.start} to ${exp.end}`}
                style={{
                  cursor: "pointer",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  transition: "transform .3s cubic-bezier(.22,1,.36,1)",
                }}
              >
                {isHovered && (
                  <motion.circle
                    cx={p1.x}
                    cy={p1.y}
                    r={9}
                    fill={palette.accent}
                    initial={{ scale: 1, opacity: 0.35 }}
                    animate={{ scale: [1, 1.9, 1], opacity: [0.35, 0, 0.35] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    style={{ transformOrigin: `${p1.x}px ${p1.y}px` }}
                  />
                )}
                <circle
                  className="focus-ring"
                  cx={p1.x}
                  cy={p1.y}
                  r={15}
                  fill="none"
                  stroke={palette.accent}
                  strokeWidth={2}
                  opacity={0}
                  style={{ transition: "opacity .15s ease" }}
                />
                {/* Ring anchor: inverts and grows where the card meets the branch */}
                <circle
                  cx={p1.x}
                  cy={p1.y}
                  r={7}
                  fill={isFocus ? "#2A3B2A" : "#F8F6F0"}
                  stroke="#2A3B2A"
                  strokeWidth={2}
                  style={{
                    transformOrigin: `${p1.x}px ${p1.y}px`,
                    transform: isFocus ? "scale(1.25)" : "scale(1)",
                    transition: "transform .25s ease, fill .2s ease",
                  }}
                />

                <rect
                  x={p1.x - CARD.w / 2}
                  y={cardCy - CARD.h / 2}
                  width={CARD.w}
                  height={CARD.h}
                  rx={CARD.r}
                  fill="#F8F6F0"
                  stroke={
                    isFocus ? "rgba(42,59,42,0.6)" : "rgba(42,59,42,0.25)"
                  }
                  strokeWidth={1}
                  filter="url(#cardShadow)"
                  style={{ transition: "stroke .25s ease" }}
                />
                {nameLines.map((line, li) => (
                  <text
                    key={li}
                    x={p1.x}
                    y={
                      nameLines.length === 1
                        ? cardCy - 5
                        : cardCy - 14 + li * 16
                    }
                    textAnchor="middle"
                    style={{
                      fontFamily: '"Inter", system-ui, sans-serif',
                      fontSize: nameLines.length === 1 ? 16 : 14,
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
                      fill: "#1B2E1E",
                      pointerEvents: "none",
                    }}
                  >
                    {line}
                  </text>
                ))}
                <text
                  x={p1.x}
                  y={nameLines.length === 1 ? cardCy + 15 : cardCy + 21}
                  textAnchor="middle"
                  style={{
                    fontFamily: MONO,
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    fill: "#2A3B2A",
                    pointerEvents: "none",
                  }}
                >
                  {shortRange(exp.start, exp.end)}
                </text>
              </g>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}
