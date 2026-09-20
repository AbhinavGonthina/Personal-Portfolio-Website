import { motion } from "motion/react";
import { palette } from "../theme";
import { experience } from "../data/experience";

// Canvas is a fixed viewBox; the SVG scales to whatever width it's given.
const TRUNK = { x: 550, baseY: 660, topY: 132 };

// Pill-shaped nodes, sized so a wide wordmark logo stays legible.
const NODE = { w: 136, h: 46 };

// How far out and how much lift each branch gets. Lower branches reach
// further, the way a real tree spreads.
const LAYOUT = [
  { reach: 185, lift: 58 },
  { reach: 225, lift: 56 },
  { reach: 262, lift: 54 },
  { reach: 292, lift: 52 },
  { reach: 320, lift: 50 },
  { reach: 345, lift: 48 },
];

function geometry({ side, t }, { reach, lift }) {
  const y = TRUNK.baseY - t * (TRUNK.baseY - TRUNK.topY);
  const dir = side === "right" ? 1 : -1;
  const tipX = TRUNK.x + dir * reach;
  const tipY = y - lift;
  const d = [
    `M ${TRUNK.x} ${y}`,
    `C ${TRUNK.x + dir * reach * 0.3} ${y - lift * 0.05},`,
    `${TRUNK.x + dir * reach * 0.63} ${tipY + lift * 0.8},`,
    `${tipX} ${tipY}`,
  ].join(" ");
  return { d, tipX, tipY };
}

export default function ExperienceTree({ selected, onSelect }) {
  return (
    <svg
      viewBox="0 0 1100 720"
      role="group"
      aria-label="Interactive tree of work experience"
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
    >
      {/* Ground shadow */}
      <ellipse cx={TRUNK.x} cy={TRUNK.baseY + 6} rx={140} ry={12} fill={palette.surfaceAlt} />

      {/* Tapered trunk */}
      <motion.path
        d={`M ${TRUNK.x - 18} ${TRUNK.baseY}
            C ${TRUNK.x - 20} ${TRUNK.baseY - 130}, ${TRUNK.x - 8} ${TRUNK.baseY - 280}, ${TRUNK.x - 8} ${TRUNK.topY}
            L ${TRUNK.x + 8} ${TRUNK.topY}
            C ${TRUNK.x + 8} ${TRUNK.baseY - 280}, ${TRUNK.x + 20} ${TRUNK.baseY - 130}, ${TRUNK.x + 18} ${TRUNK.baseY} Z`}
        fill={palette.accentDark}
        initial={{ opacity: 0, scaleY: 0.4 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: `${TRUNK.x}px ${TRUNK.baseY}px` }}
      />

      {/* A couple of small buds at the crown so the trunk doesn't end abruptly */}
      <motion.g
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <circle cx={TRUNK.x} cy={TRUNK.topY - 10} r={7} fill={palette.accent} />
        <circle cx={TRUNK.x - 16} cy={TRUNK.topY + 6} r={4.5} fill={palette.accent} opacity={0.7} />
        <circle cx={TRUNK.x + 16} cy={TRUNK.topY + 6} r={4.5} fill={palette.accent} opacity={0.7} />
      </motion.g>

      {experience.map((exp, i) => {
        const { d, tipX, tipY } = geometry(exp.branch, LAYOUT[i]);
        const isActive = selected === exp.id;

        return (
          <g key={exp.id}>
            <motion.path
              d={d}
              fill="none"
              stroke={isActive ? palette.accent : palette.accentDark}
              strokeWidth={isActive ? 7 : 5}
              strokeLinecap="round"
              opacity={isActive ? 1 : 0.75}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.35 + i * 0.12, ease: "easeOut" }}
              style={{ transition: "stroke .2s ease, stroke-width .2s ease" }}
            />

            <motion.g
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: 0.85 + i * 0.12, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ transformOrigin: `${tipX}px ${tipY}px`, cursor: "pointer" }}
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
              aria-label={`${exp.company}, ${exp.role}`}
            >
              {isActive && (
                <rect
                  x={tipX - NODE.w / 2 - 8}
                  y={tipY - NODE.h / 2 - 8}
                  width={NODE.w + 16}
                  height={NODE.h + 16}
                  rx={(NODE.h + 16) / 2}
                  fill={palette.accent}
                  opacity={0.16}
                />
              )}
              {/* Wordmark logos are ~5.5:1, so the node is a pill, not a circle. */}
              <rect
                x={tipX - NODE.w / 2}
                y={tipY - NODE.h / 2}
                width={NODE.w}
                height={NODE.h}
                rx={NODE.h / 2}
                fill={palette.bg}
                stroke={isActive ? palette.accent : palette.border}
                strokeWidth={isActive ? 3 : 2}
                style={{ transition: "stroke .2s ease" }}
              />
              <image
                href={exp.logo}
                x={tipX - 58}
                y={tipY - 13}
                width={116}
                height={26}
                preserveAspectRatio="xMidYMid meet"
                style={{ pointerEvents: "none" }}
              />
              <text
                x={tipX}
                y={tipY + NODE.h / 2 + 22}
                textAnchor="middle"
                style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 17,
                  fontWeight: 600,
                  fill: isActive ? palette.accentDark : palette.text,
                  pointerEvents: "none",
                }}
              >
                {exp.short}
              </text>
              <text
                x={tipX}
                y={tipY + NODE.h / 2 + 41}
                textAnchor="middle"
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: 13.5,
                  fill: palette.muted,
                  pointerEvents: "none",
                }}
              >
                {exp.start} – {exp.end}
              </text>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}
