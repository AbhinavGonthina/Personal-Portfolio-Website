import { Box } from "@mui/material";
import { keyframes } from "@mui/system";
import { motion } from "motion/react";
import Section from "../components/Section";
import { Canopy, Plant } from "../components/Botanical";
import MossBackdrop from "../components/MossBackdrop";
import { CREAM, MONO, PINE, palette } from "../theme";
import { skillGroups, totalSkills } from "../data/skills";

/**
 * Domain sub-cards inside the section's paper container, pitched to the same
 * contrast as the hero: deep pine borders and badges, the hero's own Canopy
 * hanging in from the top corners, and a background that moves.
 *
 * Every skill is on screen — nothing is behind a toggle — so the grid is
 * sized by the real content. Five cards over three tracks would leave the
 * bottom row short, so the longest list spans two and both rows fill.
 *
 * Everything that moves here animates `transform` and `opacity` only, so the
 * compositor owns it and the main thread stays free during scroll. Nothing in
 * this section listens on scroll or mousemove: the entrance runs off motion's
 * IntersectionObserver and every ambient loop is a CSS animation.
 */

// Track span per card, matched to list length: the 16-entry group takes two.
const SPANS = [1, 1, 1, 1, 2];

// The top-right card sits directly under the container's hanging canopy, so
// its own corner sprig just reads as a second, fainter vine tangled in the
// first. It gets none.
const NO_SPRIG = "backend";

/* ---------------------------------------------------------------- backdrop */

const breeze = keyframes`
  0%   { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.14; }
  50%  { transform: translate3d(16px, -20px, 0) rotate(7deg); opacity: 0.24; }
  100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0.14; }
`;

/**
 * Each leaf is one element, not two. The placement used to need its own
 * wrapper because the keyframes own `transform` and would overwrite it — but
 * `translate` and `rotate` are independent longhands that compose *before*
 * `transform`, so the static placement and the drift can share an element.
 */
const DRIFT = [
  { x: "5%", y: "22%", size: 56, rot: -26, dur: 15, delay: 0 },
  { x: "94%", y: "16%", size: 44, rot: 34, dur: 19, delay: -4 },
  { x: "88%", y: "84%", size: 62, rot: -14, dur: 17, delay: -8 },
  { x: "11%", y: "88%", size: 40, rot: 20, dur: 21, delay: -2 },
  { x: "48%", y: "9%", size: 36, rot: 48, dur: 23, delay: -11 },
];

const DECOR = (
  <>
    <MossBackdrop />

    {DRIFT.map((d) => (
      <Box
        key={`${d.x}-${d.y}`}
        aria-hidden
        component="svg"
        viewBox="0 0 44 44"
        sx={{
          position: "absolute",
          left: d.x,
          top: d.y,
          width: d.size,
          height: d.size,
          // Composed before the animated `transform`, so placement survives.
          // In px, not -50%: percentages on an SVG element resolve against
          // whatever `transform-box` resolves to, and the size is known here.
          translate: `${-d.size / 2}px ${-d.size / 2}px`,
          rotate: `${d.rot}deg`,
          fill: "none",
          stroke: PINE,
          strokeWidth: 1.1,
          strokeLinejoin: "round",
          willChange: "transform, opacity",
          animation: `${breeze} ${d.dur}s ease-in-out ${d.delay}s infinite`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            willChange: "auto",
            opacity: 0.18,
          },
        }}
      >
        <path d="M2 11 C 11 2, 29 2, 42 11 C 29 20, 11 20, 2 11 Z" />
        <path d="M2 11 L 42 11" />
      </Box>
    ))}
  </>
);

/* -------------------------------------------------------------------- card */

/** The leaf that marks each category badge, in the badge's own text colour. */
function LeafMark() {
  return (
    <Box
      aria-hidden
      component="svg"
      viewBox="-8 -8 16 16"
      sx={{ width: 11, height: 11, flexShrink: 0 }}
    >
      <path
        d="M0 -6.4 C 5 -3.8, 5.8 1.2, 0 6.4 C -5.8 1.2, -5 -3.8, 0 -6.4 Z"
        fill={CREAM}
        transform="rotate(32)"
      />
    </Box>
  );
}

// Idle sway, and the wider arc the card's hover swaps in. Both are plain CSS
// so the compositor runs them; the previous version drove five infinite
// `motion` loops off React state, which re-rendered a whole card on hover.
const sway = keyframes`
  0%, 100% { transform: rotate(-1.6deg); }
  50%      { transform: rotate(1.6deg); }
`;

const swayWide = keyframes`
  0%, 100% { transform: rotate(-4.5deg); }
  50%      { transform: rotate(4.5deg); }
`;

/** A sprig in the card's corner, idling on a long sway. */
function CornerSprig({ delay }) {
  return (
    <Box
      aria-hidden
      component="svg"
      className="sk-sprig"
      viewBox="0 0 80 60"
      sx={{
        position: "absolute",
        top: -10,
        right: -8,
        width: 94,
        height: 70,
        opacity: 0.22,
        transformOrigin: "88% 12%",
        transition: "opacity .3s ease",
        pointerEvents: "none",
        willChange: "transform",
        animation: `${sway} 7s ease-in-out ${delay}s infinite`,
      }}
    >
      <path
        d="M78 4 C 58 8, 40 20, 26 40"
        fill="none"
        stroke={PINE}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      {[
        [62, 11, -30],
        [49, 19, 24],
        [38, 28, -34],
        [29, 37, 18],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 -6 C 4.6 -3.4, 5.4 1.2, 0 6 C -5.4 1.2, -4.6 -3.4, 0 -6 Z"
          fill={PINE}
          transform={`translate(${x} ${y}) rotate(${r})`}
        />
      ))}
    </Box>
  );
}

// Five cards sprout on a spring; their pills then sprout within them on a
// tween. Springs are integrated on the main thread, so 44 of them firing at
// once was the hitch as the section came into view — a duration-based tween
// of transform and opacity hands off to the compositor instead.
const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.975 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 24, mass: 0.8 },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.72, y: 6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
  },
};

function DomainCard({ group, span, index }) {
  return (
    <Box
      component={motion.div}
      variants={cardVariants}
      sx={{
        gridColumn: { lg: `span ${span}` },
        position: "relative",
        overflow: "hidden",
        p: 2,
        borderRadius: "14px",
        backgroundColor: "rgba(255,255,255,0.58)",
        // A crisp dark edge instead of a blurred drop shadow.
        border: `1px solid ${PINE}38`,
        // Only five of these, so the layer is worth keeping warm.
        willChange: "transform",
        transition:
          "transform .25s ease, border-color .25s ease, box-shadow .25s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: PINE,
          boxShadow: `0 0 0 1px ${PINE}33, 0 8px 18px -12px ${PINE}`,
        },
        // Stirring the sprig from the card's own hover keeps it in CSS.
        "&:hover .sk-sprig": {
          opacity: 0.34,
          animation: `${swayWide} 2.4s ease-in-out infinite`,
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .sk-sprig, &:hover .sk-sprig": {
            animation: "none",
            willChange: "auto",
          },
        },
      }}
    >
      {group.id !== NO_SPRIG && <CornerSprig delay={index * 0.4} />}

      {/* Solid badge, cream on pine — the same contrast as the navbar CTA. */}
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          mb: 1.5,
          px: 1.5,
          py: 0.6,
          borderRadius: 999,
          backgroundColor: PINE,
        }}
      >
        <LeafMark />
        <Box
          component="h3"
          sx={{
            m: 0,
            fontFamily: MONO,
            fontSize: "0.625rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: CREAM,
          }}
        >
          {group.label}
        </Box>
      </Box>

      <Box
        component={motion.div}
        variants={{ show: { transition: { staggerChildren: 0.025 } } }}
        sx={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 1 }}
      >
        {group.items.map((t) => (
          <Box
            key={t}
            component={motion.div}
            variants={pillVariants}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: "9px",
              backgroundColor: "rgba(255,255,255,0.8)",
              border: `1px solid ${PINE}2E`,
              fontSize: "0.8125rem",
              fontWeight: 600,
              lineHeight: 1.35,
              color: "#1B2E1E",
              // A long entry wraps inside its own pill rather than forcing
              // the card wider than its track.
              maxWidth: "100%",
              cursor: "default",
              // Sprouts up from its own base, the way a leaf unfurls.
              transformOrigin: "bottom center",
              // Named properties, not `all`: `all` puts every property the
              // pill has — width, padding, font-size — on the transition's
              // watch list, which is 44 elements' worth of needless work.
              transition:
                "transform .18s cubic-bezier(.22,1,.36,1), background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease",
              "&:hover": {
                // Scoped to hover: 44 permanent composite layers would cost
                // more memory than the promotion saves.
                willChange: "transform",
                transform: "translateY(-3px) scale(1.04)",
                backgroundColor: PINE,
                borderColor: PINE,
                color: CREAM,
                boxShadow: `0 6px 16px -6px ${PINE}, 0 0 0 4px ${PINE}1A`,
              },
            }}
          >
            {t}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="What I work with"
      decor={DECOR}
      aside={
        <Box
          sx={{
            fontFamily: MONO,
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            color: PINE,
            opacity: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          [ {skillGroups.length} DOMAINS · {totalSkills} TOOLS ]
        </Box>
      }
    >
      <Box
        sx={{
          position: "relative",
          // Clips the canopy to the container's rounded edge.
          overflow: "hidden",
          // Opaque enough to read as paper without a backdrop-filter. The
          // blur that used to sit here had to re-sample everything behind the
          // container on every frame the page scrolled, which is the single
          // most expensive thing a static panel can do.
          backgroundColor: "rgba(242, 239, 233, 0.78)",
          border: `1px solid ${PINE}3D`,
          borderRadius: "24px",
          p: 2,
          // Isolates the panel from the page's layout and paint lifecycle, so
          // hovering a pill repaints this box and nothing above it.
          contain: "layout style paint",
        }}
      >
        {/* The hero's own Canopy, hanging in from the top-right corner only,
            toned to one flat olive at full strength — the palette's actual
            green, not the near-black pine the badges use. It sits *above* the
            cards — it is `pointerEvents: none` and lands on empty card
            gutter, so nothing it covers is content. */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: { xs: "none", md: "block" },
            zIndex: 2,
          }}
        >
          <Plant w={300} h={218} top={-66} right={-54}>
            <Canopy
              stems={7}
              opacity={1}
              animate={false}
              flip
              tone={palette.olive}
            />
          </Plant>
        </Box>

        <Box
          component={motion.div}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            show: {
              transition: { staggerChildren: 0.09, delayChildren: 0.05 },
            },
          }}
          sx={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {skillGroups.map((group, gi) => (
            <DomainCard
              key={group.id}
              group={group}
              span={SPANS[gi] ?? 1}
              index={gi}
            />
          ))}
        </Box>
      </Box>
    </Section>
  );
}
