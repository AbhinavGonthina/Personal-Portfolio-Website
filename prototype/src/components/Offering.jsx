import { Box } from "@mui/material";
import { motion, useReducedMotion } from "motion/react";
import { palette, MONO } from "../theme";
import { Leaf } from "./Botanical";

/**
 * A hand reaching up out of the ground, offering you something.
 *
 * Four of these make the closing screen — one per way of getting hold of me.
 * They are drawn, not buttoned: same line work as the brick wall in the hero,
 * camel outlines over the page's own cream with no shading, and the only fill
 * is whatever the hand is holding.
 *
 * `children` is drawn in this component's own viewBox, above the grip, so
 * each offering only has to describe the thing being held.
 */

const LINE = palette.accent;
const RIM = palette.accentDark;

// The hand's coordinate space. The bottom edge is the ground, so the arm runs
// off the end of it and gets clipped by the surface rather than stopping.
const VB_W = 160;
const VB_H = 250;

/**
 * A tapered finger: wider at the knuckle, narrower at the tip, with a round
 * cap. Uniform rounded rectangles were what made the first version read as a
 * mitten — real fingers differ in length, width and lean, and the taper is
 * most of what sells it.
 */
const finger = (x, y, len, w0, w1, bend) => {
  const tipY = y - len;
  const cx = x + bend;
  const r = w1 / 2;
  return [
    `M ${x - w0 / 2} ${y}`,
    `C ${x - w0 / 2 + bend * 0.3} ${y - len * 0.5}, ${cx - r} ${tipY + len * 0.3}, ${cx - r} ${tipY + r}`,
    `A ${r} ${r} 0 0 1 ${cx + r} ${tipY + r}`,
    `C ${cx + r} ${tipY + len * 0.3}, ${x + w0 / 2 + bend * 0.3} ${y - len * 0.5}, ${x + w0 / 2} ${y}`,
    "Z",
  ].join(" ");
};

// Index, middle, ring, pinky — left hand, so they run index-left to
// pinky-right. Lengths are the real proportions, which is why the middle one
// stands proud and the little finger falls well short.
const FINGERS = [
  { x: 80, len: 48, w0: 13, w1: 10, bend: -2 },
  { x: 94, len: 56, w0: 13.5, w1: 10.5, bend: 0 },
  { x: 108, len: 51, w0: 13, w1: 10, bend: 2 },
  { x: 121, len: 40, w0: 11.5, w1: 9, bend: 4 },
];

const KNUCKLE_Y = 152;
const FINGER_BASE = 164;

// Height of the strip below the ground that holds the caption.
const CAPTION_BAND = 30;

/**
 * The hand is drawn a shade smaller than the thing it holds. At parity a hand
 * reads as oversized next to a sheet of paper - real hands are about half the
 * height of a page. Scaled about the grip so the fingers stay where they are
 * against whatever is being held.
 */
const HAND_SCALE = 0.86;
const HAND_PIVOT = [100, 178];

/**
 * The rise overshoots and settles — a damped sine sampled densely rather than
 * a short list of peaks. Motion applies its easing to each segment *between*
 * keyframes, so a peak list is fastest at every turning point, which reads
 * mechanical.
 */
const damped = ({ amp, period, decay, duration, steps = 60 }) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    if (i === steps) return 0;
    const t = (i / steps) * duration;
    return Number(
      (
        amp *
        Math.exp(-decay * t) *
        Math.sin((2 * Math.PI * t) / period)
      ).toFixed(3),
    );
  });

const SETTLE_T = 1.5;

/**
 * Declared as a variant so the trigger can live on an ancestor. The element
 * starts translated below the ground *inside* a clipping parent, so an
 * observer attached to it only ever sees the unclipped sliver and never
 * crosses a sensible threshold.
 */
const rise = (i) => ({
  hidden: { y: VB_H * 0.78, opacity: 0, rotate: 0, z: 0 },
  show: {
    y: 0,
    opacity: 1,
    rotate: damped({
      amp: -3.4,
      period: 0.6,
      decay: 2.2,
      duration: SETTLE_T,
    }),
    z: 0,
    transition: {
      // Staggered along the row, so they come up one after another.
      y: { duration: 0.8, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.35, delay: i * 0.13 },
      rotate: { delay: i * 0.13 + 0.45, duration: SETTLE_T, ease: "linear" },
    },
  },
});

export default function Offering({
  href,
  caption,
  label,
  index = 0,
  children,
}) {
  const still = useReducedMotion();
  const external = !href.startsWith("mailto:");

  return (
    <Box
      component={motion.div}
      initial={still ? false : "hidden"}
      whileInView={still ? undefined : "show"}
      viewport={{ once: true, amount: 0.25 }}
      sx={{
        position: "relative",
        textAlign: "center",
        // The drawing ends at the ground; this is the strip below it that
        // the caption lives in. Without it the ground line lands inside the
        // SVG and the arm and soil render underneath the surface.
        pb: `${CAPTION_BAND}px`,
      }}
    >
      <Box
        component="a"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={label}
        sx={{
          display: "block",
          textDecoration: "none",
          position: "relative",
          // The arm is clipped at the ground, so it rises *through* the
          // surface rather than sliding in front of it.
          overflow: "hidden",
          "&:focus-visible": { outline: "none" },
          "&:focus-visible .off-lift": {
            outline: `2px solid ${RIM}`,
            outlineOffset: 2,
            borderRadius: "6px",
          },
          "& .off-lift": {
            transition: "transform .3s cubic-bezier(.22,1,.36,1)",
          },
          // Offered a little further forward when you reach for it.
          "&:hover .off-lift, &:focus-visible .off-lift": {
            transform: "translate3d(0, -10px, 0)",
          },
          "& .off-held": { transition: "fill .3s ease" },
          "&:hover .off-held, &:focus-visible .off-held": { fill: "#FFFFFF" },
        }}
      >
        {/* Two nested elements on purpose: motion writes `transform` as an
            inline style on the element it animates, which beats any CSS rule,
            so the hover lift cannot share a node with the rise. */}
        <Box
          component={motion.div}
          variants={still ? undefined : rise(index)}
          style={{ transformOrigin: "50% 100%" }}
        >
          <Box className="off-lift">
            <Box
              aria-hidden
              component="svg"
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              sx={{ display: "block", width: "100%", height: "auto" }}
            >
              {/* Whatever is being held, drawn behind the fingers. */}
              {children}

              {/* The whole hand scales as one group about the grip, so the
                  fingers keep their position against what is being held. */}
              <g
                transform={`translate(${HAND_PIVOT[0]} ${HAND_PIVOT[1]}) scale(${HAND_SCALE}) translate(${-HAND_PIVOT[0]} ${-HAND_PIVOT[1]})`}
              >
                {/* Fingers first, then the palm over their bases — so the
                    knuckle line cuts across them instead of each finger
                    ending in a visible seam on top of the hand. */}
                {FINGERS.map((f) => (
                  <path
                    key={f.x}
                    d={finger(f.x, FINGER_BASE, f.len, f.w0, f.w1, f.bend)}
                    fill={palette.bg}
                    stroke={RIM}
                    strokeWidth="1.8"
                  />
                ))}

                {/* Back of the hand: wide at the knuckles, narrowing to the
                    wrist, with the thumb-base bulge on the left. */}
                <path
                  d={`M 70 206
                      C 66 192, 66 172, 71 ${KNUCKLE_Y + 8}
                      C 76 ${KNUCKLE_Y - 2}, 86 ${KNUCKLE_Y - 4}, 100 ${KNUCKLE_Y - 4}
                      C 114 ${KNUCKLE_Y - 4}, 125 ${KNUCKLE_Y}, 130 ${KNUCKLE_Y + 10}
                      C 134 174, 134 192, 130 206 Z`}
                  fill={palette.bg}
                  stroke={RIM}
                  strokeWidth="1.9"
                  strokeLinejoin="round"
                />

                {/* Thumb, nearest the viewer, so it goes on last. Shorter and
                    tucked closer to the palm than a finger - held out at a
                    finger's length it read as a fifth finger. */}
                <path
                  d={finger(76, 196, 36, 15, 11.5, 0)}
                  transform="rotate(-30 76 196)"
                  fill={palette.bg}
                  stroke={RIM}
                  strokeWidth="1.8"
                />
                {/* Crease where the thumb meets the palm */}
                <path
                  d="M 80 192 C 87 186, 92 178, 94 169"
                  fill="none"
                  stroke={LINE}
                  strokeWidth="1.3"
                  strokeOpacity="0.5"
                  strokeLinecap="round"
                />
              </g>

              {/* Forearm. Tapered - wider toward the ground than at the
                  wrist - because two parallel lines read as a length of pipe
                  rather than an arm. */}
              <path
                d="M 75 200 C 72 218, 70 236, 69 250"
                fill="none"
                stroke={RIM}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M 127 200 C 130 218, 132 236, 133 250"
                fill="none"
                stroke={RIM}
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Soil pushed up where the arm comes through. Two ridges,
                  one either side, each running from the ground up to the
                  arm it is banked against. A single arc spanning both sides
                  read as a dome with a post stuck through it, because it
                  passed behind the arm instead of meeting it. */}
              <path
                d="M 44 250 C 52 243, 60 238, 70 236"
                fill="none"
                stroke={LINE}
                strokeWidth="1.5"
                strokeOpacity="0.6"
                strokeLinecap="round"
              />
              <path
                d="M 132 236 C 142 238, 150 243, 158 250"
                fill="none"
                stroke={LINE}
                strokeWidth="1.5"
                strokeOpacity="0.6"
                strokeLinecap="round"
              />
              {/* Cracks running out from the break */}
              <path
                d="M 62 248 L 56 243 M 140 247 L 147 243"
                fill="none"
                stroke={LINE}
                strokeWidth="1.1"
                strokeOpacity="0.4"
                strokeLinecap="round"
              />
              {[
                [52, 246],
                [64, 241],
                [146, 246],
                [136, 241],
              ].map(([cx, cy]) => (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="1.7"
                  fill={LINE}
                  opacity="0.42"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* The ground this one stands on. Each offering draws its own segment
          across its full width, so a row of them tiles into one continuous
          surface and a wrapped row gets its own. */}
      <Box
        aria-hidden
        component="svg"
        viewBox="0 0 300 10"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: CAPTION_BAND,
          width: "100%",
          height: 10,
          overflow: "visible",
        }}
      >
        <path
          d="M0 6 C 60 3, 120 8, 180 5 C 230 3, 270 7, 300 5"
          fill="none"
          stroke={LINE}
          strokeWidth={1.4}
          strokeOpacity={0.5}
          vectorEffect="non-scaling-stroke"
        />
      </Box>

      {/* Tufts either side, so the surface reads as earth and not a rule. */}
      {[
        { x: "12%", n: 4, s: 0.95 },
        { x: "84%", n: 3, s: 0.8 },
      ].map((g) => (
        <Box
          key={g.x}
          aria-hidden
          component="svg"
          viewBox="0 0 60 40"
          sx={{
            position: "absolute",
            left: g.x,
            bottom: CAPTION_BAND + 2,
            width: 58 * g.s,
            height: 38 * g.s,
            transform: "translateX(-50%)",
            overflow: "visible",
          }}
        >
          {Array.from({ length: g.n }, (_, i) => {
            const t = g.n === 1 ? 0.5 : i / (g.n - 1);
            // Longest blade in the middle, so a tuft has a rounded outline.
            const len = 15 + Math.sin(t * Math.PI) * 14;
            return (
              <Leaf
                key={i}
                x={30}
                y={38}
                angle={-150 + t * 120}
                len={len}
                wid={len * 0.2}
                fill={palette.olive}
                opacity={0.3}
                vein={false}
              />
            );
          })}
        </Box>
      ))}

      {/* Caption below the surface. The drawing is the charm; this is what
          makes each one identifiable without hovering. */}
      <Box
        component="a"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        tabIndex={-1}
        aria-hidden
        sx={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          fontFamily: MONO,
          fontSize: "0.625rem",
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.muted,
          textDecoration: "none",
          whiteSpace: "nowrap",
          transition: "color .25s ease",
          "&:hover": { color: RIM },
        }}
      >
        {caption}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------- what each hand holds -- */
/* All drawn in the hand's viewBox, gripped around y=150. */

export function ResumeSheet() {
  return (
    <g transform="rotate(-6 80 90)">
      <rect
        className="off-held"
        x="38"
        y="22"
        width="84"
        height="128"
        rx="2"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="1.6"
      />
      <rect
        x="48"
        y="34"
        width="34"
        height="5"
        rx="2.5"
        fill={RIM}
        opacity="0.55"
      />
      {[50, 61, 72, 83, 94, 105, 116].map((y, i) => (
        <line
          key={y}
          x1="48"
          y1={y}
          x2={i % 3 === 2 ? 94 : 112}
          y2={y}
          stroke={LINE}
          strokeWidth="1.4"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

export function EnvelopeHeld() {
  return (
    <g transform="rotate(-5 80 100)">
      <rect
        className="off-held"
        x="30"
        y="56"
        width="100"
        height="72"
        rx="3"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="1.6"
      />
      {/* Flap */}
      <path
        d="M30 60 L80 98 L130 60"
        fill="none"
        stroke={RIM}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* The folds either side, so it reads as paper and not a box */}
      <path
        d="M30 124 L66 92 M130 124 L94 92"
        fill="none"
        stroke={LINE}
        strokeWidth="1.3"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    </g>
  );
}

export function BranchCard() {
  return (
    <g transform="rotate(-4 80 96)">
      <rect
        className="off-held"
        x="32"
        y="40"
        width="96"
        height="96"
        rx="8"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="1.6"
      />
      {/* A git branch: a trunk, a fork, and a merge back in. Reads to the
          people this link is for without drawing anyone's logo. */}
      <path
        d="M62 122 L62 62"
        fill="none"
        stroke={RIM}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M62 96 C 62 82, 72 78, 84 78 C 94 78, 98 74, 98 66"
        fill="none"
        stroke={RIM}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="62"
        cy="56"
        r="7"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="2"
      />
      <circle
        cx="98"
        cy="60"
        r="7"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="2"
      />
      <circle
        cx="62"
        cy="128"
        r="7"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="2"
      />
    </g>
  );
}

export function ProfileCard() {
  return (
    <g transform="rotate(-7 80 104)">
      <rect
        className="off-held"
        x="26"
        y="66"
        width="108"
        height="68"
        rx="4"
        fill={palette.bg}
        stroke={RIM}
        strokeWidth="1.6"
      />
      {/* A head-and-shoulders mark plus two lines of detail: a business card */}
      <circle
        cx="52"
        cy="90"
        r="9"
        fill="none"
        stroke={RIM}
        strokeWidth="1.6"
      />
      <path
        d="M38 116 C 40 104, 46 100, 52 100 C 58 100, 64 104, 66 116"
        fill="none"
        stroke={RIM}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {[88, 100, 112].map((y, i) => (
        <line
          key={y}
          x1="78"
          y1={y}
          x2={i === 2 ? 104 : 122}
          y2={y}
          stroke={LINE}
          strokeWidth="1.4"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
