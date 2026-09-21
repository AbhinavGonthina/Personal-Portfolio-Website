import { useId } from "react";
import { Box } from "@mui/material";
import { motion } from "motion/react";
import { palette } from "../theme";

/**
 * Shared botanical vocabulary. The experience tree and the decorative hero
 * vines draw from the same leaf shape so they read as one illustration style.
 */

// A pointed leaf with a midrib — far less generic than a plain ellipse.
const leafBody = (len, wid) =>
  `M 0 0 C ${len * 0.32} ${-wid}, ${len * 0.74} ${-wid * 0.82}, ${len} 0
   C ${len * 0.74} ${wid * 0.82}, ${len * 0.32} ${wid}, 0 0 Z`;

export function Leaf({ x, y, angle, len = 17, wid = 5.6, fill, opacity = 1, vein = true }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={leafBody(len, wid)} fill={fill} opacity={opacity} />
      {vein && (
        <path
          d={`M ${len * 0.1} 0 L ${len * 0.88} 0`}
          stroke={palette.barkDeep}
          strokeWidth={0.7}
          opacity={opacity * 0.35}
          fill="none"
        />
      )}
    </g>
  );
}

/**
 * A fan of leaves radiating from a single point — used to fill corners and
 * the base of the portrait frame.
 */
export function LeafSpray({
  leaves = 7,
  arc = 150,
  start = -165,
  len = 40,
  tone = palette.accent,
  toneAlt = palette.bark,
  opacity = 0.45,
  delay = 0,
}) {
  return (
    <motion.svg
      viewBox="0 0 200 120"
      aria-hidden="true"
      focusable="false"
      style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      <g opacity={opacity}>
        {Array.from({ length: leaves }, (_, i) => {
          const t = leaves === 1 ? 0.5 : i / (leaves - 1);
          const angle = start + t * arc;
          // Middle leaves reach furthest, so the fan has a rounded silhouette.
          const reach = len * (0.68 + 0.32 * Math.sin(t * Math.PI));
          return (
            <motion.g
              key={i}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "100px 110px" }}
            >
              <Leaf
                x={100}
                y={110}
                angle={angle}
                len={reach}
                wid={reach * 0.3}
                fill={i % 2 ? toneAlt : tone}
                vein={false}
              />
            </motion.g>
          );
        })}
      </g>
    </motion.svg>
  );
}

/**
 * A petal that falls, turning as it goes, then fades out and repeats.
 */
export function DriftingLeaf({
  size = 22,
  tone = palette.accent,
  opacity = 0.3,
  duration = 14,
  delay = 0,
  drift = 26,
  fall = 190,
}) {
  return (
    <motion.svg
      viewBox="0 0 60 30"
      aria-hidden="true"
      focusable="false"
      style={{ width: size * 2, height: size, display: "block", overflow: "visible" }}
      initial={{ y: -10, x: 0, rotate: 0, opacity: 0 }}
      animate={{
        y: [-10, fall * 0.4, fall],
        x: [0, drift, drift * 0.35],
        rotate: [0, 130, 265],
        opacity: [0, opacity, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
        times: [0, 0.45, 1],
      }}
    >
      <Leaf x={4} y={15} angle={0} len={46} wid={13} fill={tone} vein={false} />
    </motion.svg>
  );
}

const cubic = (p0, c1, c2, p1, t) => {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * p1.x,
    y: u ** 3 * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * p1.y,
  };
};

const cubicAngle = (p0, c1, c2, p1, t) => {
  const u = 1 - t;
  const dx = 3 * u * u * (c1.x - p0.x) + 6 * u * t * (c2.x - c1.x) + 3 * t * t * (p1.x - c2.x);
  const dy = 3 * u * u * (c1.y - p0.y) + 6 * u * t * (c2.y - c1.y) + 3 * t * t * (p1.y - c2.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/**
 * Vines that start ON the arch's curve and drape over it, rather than floating
 * in from the top of the page. `w`/`h` must match the arch box; the top of the
 * arch is a semicircle of radius w/2 centred at (w/2, w/2).
 */
/**
 * `mode="fill"` drapes vines across the whole arch (for an empty frame).
 * `mode="frame"` keeps them at the outer edges so a portrait stays unobscured.
 */
export function ArchDrape({
  w = 400,
  h = 480,
  stem = palette.olive,
  opacity = 0.9,
  mode = "fill",
}) {
  const r = w / 2;
  const cx = w / 2;
  const cy = w / 2;

  // Each vine: angle on the arc (deg, 0 = right, y down), how far it hangs,
  // how far it swings sideways, and how many leaves it carries.
  const drapes =
    // Circular frame: shorter drops, hung from the widest points of the circle.
    mode === "ring"
      ? [
          { a: -179, drop: 215, swing: -24, leaves: 8, delay: 0.1 },
          { a: -156, drop: 128, swing: -26, leaves: 5, delay: 0.32 },
          { a: -1, drop: 230, swing: 26, leaves: 9, delay: 0.18 },
          { a: -24, drop: 138, swing: 28, leaves: 5, delay: 0.44 },
        ]
      : mode === "frame"
      ? [
          { a: -176, drop: 300, swing: -30, leaves: 10, delay: 0.1 },
          { a: -154, drop: 190, swing: -30, leaves: 6, delay: 0.3 },
          { a: -4, drop: 320, swing: 32, leaves: 11, delay: 0.18 },
          { a: -26, drop: 200, swing: 32, leaves: 6, delay: 0.42 },
        ]
      : [
          { a: -158, drop: 250, swing: -26, leaves: 9, delay: 0.25 },
          { a: -128, drop: 320, swing: -14, leaves: 11, delay: 0.1 },
          { a: -96, drop: 270, swing: 10, leaves: 10, delay: 0.35 },
          { a: -62, drop: 340, swing: 20, leaves: 11, delay: 0.18 },
          { a: -28, drop: 230, swing: 30, leaves: 8, delay: 0.45 },
        ];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden="true"
      focusable="false"
      style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
    >
      {drapes.map((d, i) => {
        const rad = (d.a * Math.PI) / 180;
        // Anchor sits exactly on the arch curve.
        const p0 = { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
        // Head slightly outward along the normal first, so it reads as hanging
        // off the rim rather than sprouting from thin air.
        const nx = Math.cos(rad);
        const ny = Math.sin(rad);
        const p1 = { x: p0.x + d.swing, y: p0.y + d.drop };
        const c1 = { x: p0.x + nx * 26, y: p0.y + ny * 14 + d.drop * 0.3 };
        const c2 = { x: p1.x - d.swing * 1.5, y: p0.y + d.drop * 0.72 };
        const path = `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`;

        return (
          <g key={i} opacity={opacity}>
            {/* Stem tapers: a thinner stroke overlays the last stretch so the
                vine thins out instead of stopping at full width. */}
            <motion.path
              d={path}
              fill="none"
              stroke={stem}
              strokeWidth={2.6}
              strokeLinecap="round"
              opacity={0.85}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.3, delay: d.delay, ease: "easeOut" }}
            />
            <motion.path
              d={path}
              fill="none"
              stroke={palette.bg}
              strokeWidth={1.3}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.16 1"
              strokeDashoffset={-0.84}
              opacity={0.55}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ duration: 0.4, delay: d.delay + 1.1 }}
            />
            {/* A small collar where the vine meets the rim */}
            <circle cx={p0.x} cy={p0.y} r={3.2} fill={stem} />

            {Array.from({ length: d.leaves }, (_, k) => {
              const t = 0.14 + (k / (d.leaves - 1)) * 0.8;
              const pt = cubic(p0, c1, c2, p1, t);
              const ang = cubicAngle(p0, c1, c2, p1, t);
              const side = k % 2 === 0 ? 1 : -1;
              const s = 1 - t * 0.34;
              const f = foliageAt(k + i);
              return (
                <motion.g
                  key={k}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: d.delay + 0.3 + t * 1.1 }}
                  style={{
                    transformOrigin: `${pt.x}px ${pt.y}px`,
                    transformBox: "view-box",
                    pointerEvents: "auto",
                    cursor: "default",
                  }}
                  whileHover={{ scale: 1.22 }}
                >
                  <Leaf
                    x={pt.x}
                    y={pt.y}
                    angle={ang + side * 66}
                    len={26 * s}
                    wid={8.6 * s}
                    fill={f.fill}
                    opacity={f.o}
                    vein={false}
                  />
                </motion.g>
              );
            })}

            {/* Terminal leaf: the vine ends in one small leaf, not a cut-off */}
            <motion.g
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: d.delay + 1.35 }}
              style={{ transformOrigin: `${p1.x}px ${p1.y}px`, transformBox: "view-box" }}
            >
              <Leaf
                x={p1.x}
                y={p1.y}
                angle={cubicAngle(p0, c1, c2, p1, 1) - 6}
                len={15}
                wid={5}
                fill={foliageAt(i + 2).fill}
                opacity={foliageAt(i + 2).o}
                vein={false}
              />
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Positions a plant absolutely within a section's decoration layer.
 * Placements deliberately run past the section edges; Section clips them.
 */
export function Plant({ w, h, children, sx, ...pos }) {
  // `sx` has to be destructured out of the rest props — spreading it into the
  // style object as a key makes MUI ignore it entirely.
  return (
    <Box sx={{ position: "absolute", width: w, height: h, ...pos, ...sx }}>
      {children}
    </Box>
  );
}

const grow = (delay, duration = 0.7) => ({
  initial: { opacity: 0, scale: 0.72 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.1 },
  transition: { duration, delay, ease: [0.22, 1, 0.36, 1] },
});

const svgStyle = { width: "100%", height: "100%", display: "block", overflow: "visible" };

// Rotating through three greens at varied opacity gives foliage depth — a
// single flat tone is what made the early vines look like stickers.
const FOLIAGE = [
  { fill: palette.forest, o: 1 },
  { fill: palette.olive, o: 0.85 },
  { fill: palette.sage, o: 0.75 },
  { fill: palette.olive, o: 1 },
  { fill: palette.forest, o: 0.7 },
  { fill: palette.sage, o: 0.9 },
];

const foliageAt = (i) => FOLIAGE[i % FOLIAGE.length];

/**
 * Pinnate frond — a curved rachis with many small leaflets. Reads completely
 * differently from the vine because the leaflets are tiny and densely packed.
 */
export function Fern({
  pairs = 15,
  tone = palette.bark,
  opacity = 0.34,
  delay = 0,
  sway = 2.2,
}) {
  const H = 400;
  const spine = (t) => ({ x: 80 + Math.sin(t * 1.5) * 30, y: H - t * (H - 24) });

  return (
    <motion.svg
      viewBox="0 0 160 400"
      aria-hidden="true"
      focusable="false"
      style={{ ...svgStyle, transformOrigin: "50% 100%" }}
      animate={{ rotate: [-sway, sway, -sway] }}
      transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.g {...grow(delay)} style={{ transformOrigin: "80px 400px" }} opacity={opacity}>
        <path
          d={`M ${spine(0).x} ${spine(0).y} ${Array.from({ length: 24 }, (_, i) => {
            const p = spine((i + 1) / 24);
            return `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }).join(" ")}`}
          fill="none"
          stroke={tone}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        {Array.from({ length: pairs }, (_, i) => {
          const t = 0.06 + (i / (pairs - 1)) * 0.92;
          const p = spine(t);
          // Leaflets shrink towards the tip, giving the frond its taper.
          const len = 46 * (1 - t * 0.82);
          const tilt = -46 - t * 16;
          return (
            <g key={i}>
              <Leaf x={p.x} y={p.y} angle={180 + tilt} len={len} wid={len * 0.24} fill={tone} vein={false} />
              <Leaf x={p.x} y={p.y} angle={-tilt} len={len} wid={len * 0.24} fill={tone} vein={false} />
            </g>
          );
        })}
      </motion.g>
    </motion.svg>
  );
}

/**
 * Eucalyptus sprig — paired round leaves along a straight-ish stem.
 */
export function Eucalyptus({
  pairs = 8,
  tone = palette.accent,
  toneAlt = palette.bark,
  opacity = 0.34,
  delay = 0,
}) {
  const H = 340;
  const stem = (t) => ({ x: 70 + Math.sin(t * 2.1 + 0.4) * 16, y: H - t * (H - 20) });

  return (
    <motion.svg
      viewBox="0 0 140 340"
      aria-hidden="true"
      focusable="false"
      style={{ ...svgStyle, transformOrigin: "50% 100%" }}
      animate={{ rotate: [-1.6, 1.6, -1.6] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <motion.g {...grow(delay)} style={{ transformOrigin: "70px 340px" }} opacity={opacity}>
        <path
          d={`M ${stem(0).x} ${stem(0).y} ${Array.from({ length: 20 }, (_, i) => {
            const p = stem((i + 1) / 20);
            return `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }).join(" ")}`}
          fill="none"
          stroke={toneAlt}
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        {Array.from({ length: pairs }, (_, i) => {
          const t = 0.1 + (i / (pairs - 1)) * 0.86;
          const p = stem(t);
          const r = 15 * (1 - t * 0.42);
          // Tilted ovals rather than circles, so it reads as foliage not dots.
          return (
            <g key={i}>
              <ellipse
                cx={p.x - r - 2}
                cy={p.y}
                rx={r * 1.12}
                ry={r * 0.82}
                fill={i % 2 ? tone : toneAlt}
                transform={`rotate(-24 ${p.x - r - 2} ${p.y})`}
              />
              <ellipse
                cx={p.x + r + 2}
                cy={p.y}
                rx={r * 1.12}
                ry={r * 0.82}
                fill={i % 2 ? toneAlt : tone}
                transform={`rotate(24 ${p.x + r + 2} ${p.y})`}
              />
            </g>
          );
        })}
      </motion.g>
    </motion.svg>
  );
}

/**
 * Split-leaf monstera. The splits are cut with a mask so the shape works on
 * any background colour.
 */
export function Monstera({ tone = palette.bark, opacity = 0.22, delay = 0, flip = false }) {
  const id = useId().replace(/:/g, "");
  const CX = 110;

  // [y along the midrib, angle in degrees, length]. Each cut starts just off
  // the midrib and runs outward, so the leaf keeps a solid spine.
  const cuts = [
    [56, 166, 84],
    [100, 179, 92],
    [146, 193, 80],
    [184, 208, 56],
    [56, 14, 84],
    [100, 1, 92],
    [146, -13, 80],
    [184, -28, 56],
  ];

  const blade =
    "M 110 6 C 168 22, 197 68, 195 112 C 193 163, 157 199, 110 210 " +
    "C 63 199, 27 163, 25 112 C 23 68, 52 22, 110 6 Z";

  return (
    <motion.svg
      viewBox="0 0 220 252"
      aria-hidden="true"
      focusable="false"
      style={{ ...svgStyle, transform: flip ? "scaleX(-1)" : undefined }}
      {...grow(delay, 0.8)}
    >
      <defs>
        <mask id={`monstera-${id}`} maskUnits="userSpaceOnUse">
          <rect width="220" height="252" fill="black" />
          <path d={blade} fill="white" />
          {cuts.map(([cy, angle, len], i) => (
            <rect
              key={i}
              x={CX + 9}
              y={cy - 6}
              width={len}
              height={12}
              rx={6}
              fill="black"
              transform={`rotate(${angle} ${CX} ${cy})`}
            />
          ))}
        </mask>
      </defs>

      <g opacity={opacity}>
        <path d={blade} fill={tone} mask={`url(#monstera-${id})`} />
        <path
          d="M 110 200 C 110 220, 104 238, 92 250"
          fill="none"
          stroke={tone}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </g>
    </motion.svg>
  );
}

/**
 * Reeds — tall tapered blades from a single clump.
 */
export function Reeds({
  blades = 7,
  tone = palette.bark,
  toneAlt = palette.accent,
  opacity = 0.3,
  delay = 0,
}) {
  const specs = Array.from({ length: blades }, (_, i) => {
    const t = blades === 1 ? 0.5 : i / (blades - 1);
    const lean = (t - 0.5) * 2; // -1 .. 1
    return {
      h: 180 + Math.sin(t * Math.PI) * 78,
      lean,
      w: 5.5 - Math.abs(lean) * 1.6,
      tone: i % 3 === 0 ? toneAlt : tone,
      delay: delay + i * 0.06,
    };
  });

  return (
    <motion.svg
      viewBox="0 0 200 280"
      aria-hidden="true"
      focusable="false"
      style={{ ...svgStyle, transformOrigin: "50% 100%" }}
      animate={{ rotate: [-1.4, 1.4, -1.4] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <g opacity={opacity}>
        {specs.map((s, i) => {
          const tipX = 100 + s.lean * 74;
          const tipY = 276 - s.h;
          return (
            <motion.path
              key={i}
              d={`M ${100 - s.w} 278
                  Q ${100 + s.lean * 24} ${278 - s.h * 0.55}, ${tipX} ${tipY}
                  Q ${100 + s.lean * 30} ${278 - s.h * 0.52}, ${100 + s.w} 278 Z`}
              fill={s.tone}
              initial={{ scaleY: 0, opacity: 0 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.65, delay: s.delay, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "100px 278px" }}
            />
          );
        })}
      </g>
    </motion.svg>
  );
}

/**
 * Tiny inline leaf, for use as an icon beside text.
 */
export function LeafMark({ size = 14, tone = palette.olive }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M20 4c0 8-5 13-12 13H5c0-8 5-13 12-13h3z"
        fill={tone}
        opacity={0.9}
      />
      <path
        d="M5 21c0-5 4-9 9-11"
        fill="none"
        stroke={palette.forest}
        strokeWidth={1.7}
        strokeLinecap="round"
        opacity={0.75}
      />
    </svg>
  );
}

/**
 * A delicate horizontal branch, used as a section divider.
 */
export function VineDivider({
  leaves = 14,
  opacity = 0.5,
  stroke = palette.olive,
  strokeWidth = 1.6,
}) {
  const W = 900;
  const H = 60;
  const stem = (t) => ({ x: t * W, y: H / 2 + Math.sin(t * Math.PI * 2.2) * 5 });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
      style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}
      preserveAspectRatio="none"
    >
      <g opacity={opacity}>
        <motion.path
          d={`M ${stem(0).x} ${stem(0).y} ${Array.from({ length: 40 }, (_, i) => {
            const p = stem((i + 1) / 40);
            return `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }).join(" ")}`}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
        {Array.from({ length: leaves }, (_, i) => {
          const t = 0.06 + (i / (leaves - 1)) * 0.88;
          const p = stem(t);
          const side = i % 2 === 0 ? 1 : -1;
          // Taper towards both ends so the branch doesn't stop abruptly.
          const s = 0.5 + Math.sin(t * Math.PI) * 0.6;
          const f = foliageAt(i);
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0.3 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: 0.25 + t * 0.9 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "view-box" }}
            >
              <Leaf
                x={p.x}
                y={p.y}
                angle={side * 52}
                len={17 * s}
                wid={5.6 * s}
                fill={f.fill}
                opacity={f.o}
                vein={false}
              />
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * A slim vertical vine used as a column divider. `slice` lets it fill any
 * height without squashing the leaves.
 */
export function VerticalVine({ leaves = 16, opacity = 0.9, stroke = 1.5 }) {
  const W = 60;
  const H = 640;
  const stem = (t) => ({ x: W / 2 + Math.sin(t * Math.PI * 3.1) * 11, y: t * H });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMin slice"
      // "slice" scales to cover, so the overflow has to be clipped or the vine
      // spills out past the container and collides with whatever is below.
      style={{ width: W, height: "100%", display: "block", overflow: "hidden" }}
    >
      <g opacity={opacity}>
        <motion.path
          d={`M ${stem(0).x} ${stem(0).y} ${Array.from({ length: 48 }, (_, i) => {
            const p = stem((i + 1) / 48);
            return `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
          }).join(" ")}`}
          fill="none"
          stroke="rgba(42, 59, 42, 0.25)"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        {Array.from({ length: leaves }, (_, i) => {
          const t = 0.03 + (i / (leaves - 1)) * 0.94;
          const p = stem(t);
          const side = i % 2 === 0 ? 1 : -1;
          const f = foliageAt(i);
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0.3 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.4, delay: 0.25 + t * 1.2 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px`, transformBox: "view-box" }}
            >
              <Leaf
                x={p.x}
                y={p.y}
                angle={side > 0 ? 34 : 146}
                len={19}
                wid={6.2}
                fill={f.fill}
                opacity={f.o * 0.6}
                vein={false}
              />
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}

/**
 * A leafy bush — stems fanning up from a base into a rounded mound. Built from
 * the same Leaf primitive as everything else, so it isn't icon clip-art.
 */
/**
 * Stems hanging from a top edge — a corner canopy rather than a single vine.
 */
/**
 * `length` stretches the stems in viewBox units, so the canopy can hang lower
 * without enlarging the container — which would scale the leaves up too.
 * `animate={false}` drops the stagger and fades the whole thing in at once.
 */
export function Canopy({
  stems = 9,
  opacity = 0.75,
  flip = false,
  length = 1,
  animate = true,
}) {
  const W = 440;
  const H = 320;

  const specs = Array.from({ length: stems }, (_, i) => {
    const t = i / (stems - 1);
    // Longest at the corner, tapering inward, so it reads as growth spilling in.
    const len = (90 + Math.pow(1 - t, 1.5) * 200 + (i % 2 ? 26 : 0)) * length;
    return {
      x: 18 + t * (W - 36),
      len,
      drift: (i % 3 === 0 ? -1 : 1) * (8 + (i % 4) * 6),
      leaves: 4 + Math.round(len / (46 * length)),
      delay: animate ? 0.1 + t * 0.5 : 0,
    };
  });

  const stemAnim = animate
    ? {
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: { once: true, amount: 0.15 },
      }
    : {};
  const leafAnim = animate
    ? {
        initial: { opacity: 0, scale: 0.3 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, amount: 0.15 },
      }
    : {};

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <motion.g
        opacity={opacity}
        {...(animate
          ? {}
          : {
              initial: { opacity: 0 },
              whileInView: { opacity },
              viewport: { once: true, amount: 0.15 },
              transition: { duration: 0.5, ease: "easeOut" },
            })}
      >
        {specs.map((s, i) => {
          const p0 = { x: s.x, y: -16 };
          const p1 = { x: s.x + s.drift, y: s.len };
          const c1 = { x: s.x + s.drift * 0.2, y: s.len * 0.38 };
          const c2 = { x: s.x + s.drift * 1.4, y: s.len * 0.76 };
          const d = `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`;
          return (
            <g key={i}>
              <motion.path
                d={d}
                fill="none"
                stroke={palette.olive}
                strokeWidth={1.9}
                strokeLinecap="round"
                opacity={0.8}
                {...stemAnim}
                transition={{ duration: animate ? 1 : 0, delay: s.delay, ease: "easeOut" }}
              />
              {Array.from({ length: s.leaves }, (_, k) => {
                const t = 0.2 + (k / Math.max(1, s.leaves - 1)) * 0.78;
                const pt = cubic(p0, c1, c2, p1, t);
                const ang = cubicAngle(p0, c1, c2, p1, t);
                const side = k % 2 === 0 ? 1 : -1;
                const sc = 1 - t * 0.3;
                const f = foliageAt(k + i);
                return (
                  <motion.g
                    key={k}
                    {...leafAnim}
                    // Timed to the stem's 1s draw, so each leaf unfurls exactly
                    // as the vine reaches it rather than filling in afterwards.
                    transition={{
                      duration: animate ? 0.3 : 0,
                      delay: animate ? s.delay + t * 0.95 : 0,
                    }}
                    style={{ transformOrigin: `${pt.x}px ${pt.y}px`, transformBox: "view-box" }}
                  >
                    <Leaf
                      x={pt.x}
                      y={pt.y}
                      angle={ang + side * 68}
                      len={24 * sc}
                      wid={8 * sc}
                      fill={f.fill}
                      opacity={f.o}
                      vein={false}
                    />
                  </motion.g>
                );
              })}
              {/* Terminal leaf so each stem ends on a point */}
              <motion.g
                {...(animate
                  ? {
                      initial: { opacity: 0 },
                      whileInView: { opacity: 1 },
                      viewport: { once: true, amount: 0.15 },
                    }
                  : {})}
                transition={{ duration: animate ? 0.4 : 0, delay: animate ? s.delay + 1 : 0 }}
                style={{ transformOrigin: `${p1.x}px ${p1.y}px`, transformBox: "view-box" }}
              >
                <Leaf
                  x={p1.x}
                  y={p1.y}
                  angle={cubicAngle(p0, c1, c2, p1, 1) - 8}
                  len={14}
                  wid={4.6}
                  fill={foliageAt(i + 1).fill}
                  opacity={foliageAt(i + 1).o}
                  vein={false}
                />
              </motion.g>
            </g>
          );
        })}
      </motion.g>
    </svg>
  );
}

const VB = { w: 200, h: 640 };

// Stem is a sine wave sampled into a polyline — easy to place leaves along,
// since we can evaluate position and tangent at any point.
const stemPoint = (t, amp, freq, phase) => ({
  x: VB.w / 2 + amp * Math.sin(t * Math.PI * freq + phase),
  y: t * VB.h,
});

const stemAngle = (t, amp, freq, phase) => {
  const dx = amp * freq * Math.PI * Math.cos(t * Math.PI * freq + phase);
  const dy = VB.h;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/**
 * A trailing vine. Purely decorative, so it's hidden from assistive tech.
 */
export default function Vine({
  amp = 34,
  freq = 1.9,
  phase = 0,
  leaves = 13,
  tone = palette.accent,
  toneAlt = palette.bark,
  opacity = 0.5,
  flip = false,
  sway = 9,
  delay = 0,
}) {
  const samples = 64;
  const pts = [];
  for (let i = 0; i <= samples; i++) {
    const p = stemPoint(i / samples, amp, freq, phase);
    pts.push(`${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }
  const stem = `M ${pts.join(" L ")}`;

  // Two leaves per node, offset slightly, so the vine reads as foliage
  // rather than a line with specks on it.
  const leafNodes = [];
  for (let i = 0; i < leaves; i++) {
    const t = 0.04 + (i / (leaves - 1)) * 0.93;
    const p = stemPoint(t, amp, freq, phase);
    const a = stemAngle(t, amp, freq, phase);
    const side = i % 2 === 0 ? 1 : -1;
    // Taper the foliage towards the tip so it reads as growth.
    const scale = 1 - t * 0.3;
    leafNodes.push({
      key: `${i}a`,
      x: p.x,
      y: p.y,
      angle: a + side * 72,
      len: 34 * scale,
      wid: 11 * scale,
      fill: i % 3 === 0 ? tone : toneAlt,
      t,
    });
    leafNodes.push({
      key: `${i}b`,
      x: p.x,
      y: p.y,
      angle: a + side * 40,
      len: 23 * scale,
      wid: 7.5 * scale,
      fill: i % 3 === 1 ? tone : toneAlt,
      t,
    });
  }

  return (
    <motion.svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      aria-hidden="true"
      focusable="false"
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        overflow: "visible",
        // Sways from where it attaches, like something actually hanging.
        transformOrigin: "50% 0%",
        scaleX: flip ? -1 : 1,
      }}
      animate={{ rotate: [-sway * 0.14, sway * 0.14, -sway * 0.14] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <g opacity={opacity}>
        <motion.path
          d={stem}
          fill="none"
          stroke={toneAlt}
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: delay + 0.2, ease: "easeOut" }}
        />
        {leafNodes.map((l) => (
          <motion.g
            key={l.key}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.45,
              delay: delay + 0.35 + l.t * 1.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: `${l.x}px ${l.y}px` }}
          >
            <Leaf
              x={l.x}
              y={l.y}
              angle={l.angle}
              len={l.len}
              wid={l.wid}
              fill={l.fill}
              vein={false}
            />
          </motion.g>
        ))}
      </g>
    </motion.svg>
  );
}
