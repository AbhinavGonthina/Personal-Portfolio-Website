import { useState } from "react";
import { Box, Typography, Stack, useMediaQuery } from "@mui/material";
import { motion, AnimatePresence } from "motion/react";
import Section from "../components/Section";
import MossBackdrop from "../components/MossBackdrop";
import { Canopy, DriftingLeaf, Leaf, Plant } from "../components/Botanical";
import { palette, MONO, PINE, CREAM } from "../theme";
import { experience, EXPERIENCE_GROUPS } from "../data/experience";

/**
 * Built on the same vocabulary as Skills: one pine accent for every edge and
 * hover fill, the shared moss backdrop, an olive canopy dripping in from the
 * container's top-right, and pills that fill with pine. The two sections
 * should read as the same room.
 */

const EASE = [0.22, 1, 0.36, 1];

/**
 * Scattered leaf stickers behind the section — texture rather than a motif, so
 * they sit in the margins around the timeline card and keep clear of the
 * heading in the top-left. Positions are percentages of the section box.
 */
const LEAVES = [
  // Left gutter
  { x: "2%", y: "38%", size: 30, rot: -28, tone: palette.olive, o: 0.16 },
  { x: "5%", y: "58%", size: 22, rot: 34, tone: palette.sage, o: 0.2 },
  { x: "1%", y: "79%", size: 34, rot: -12, tone: palette.forest, o: 0.12 },
  // Above the card, right of the heading
  { x: "58%", y: "9%", size: 26, rot: 52, tone: palette.sage, o: 0.18 },
  { x: "72%", y: "19%", size: 20, rot: -40, tone: palette.accent, o: 0.16 },
  { x: "86%", y: "7%", size: 32, rot: 18, tone: palette.olive, o: 0.14 },
  // Right gutter
  { x: "94%", y: "30%", size: 24, rot: -62, tone: palette.forest, o: 0.13 },
  { x: "90%", y: "52%", size: 31, rot: 22, tone: palette.sage, o: 0.18 },
  { x: "95%", y: "74%", size: 20, rot: -18, tone: palette.olive, o: 0.16 },
  // Bottom band
  { x: "16%", y: "90%", size: 28, rot: 44, tone: palette.sage, o: 0.17 },
  { x: "40%", y: "95%", size: 22, rot: -30, tone: palette.accent, o: 0.14 },
  { x: "66%", y: "91%", size: 33, rot: 8, tone: palette.olive, o: 0.13 },
  // A couple behind the card itself; the panel softens them further.
  { x: "27%", y: "46%", size: 26, rot: -50, tone: palette.sage, o: 0.1 },
  { x: "70%", y: "66%", size: 30, rot: 26, tone: palette.olive, o: 0.09 },
];

// One leaf, drawn with the same primitive as every other plant on the page.
function LeafSticker({ x, y, size, rot, tone, o }) {
  return (
    <Plant
      w={size * 2}
      h={size}
      left={x}
      top={y}
      sx={{ transform: `translate(-50%, -50%) rotate(${rot}deg)` }}
    >
      <svg
        viewBox="0 0 60 30"
        aria-hidden="true"
        focusable="false"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Leaf
          x={4}
          y={15}
          angle={0}
          len={46}
          wid={14}
          fill={tone}
          opacity={o}
          vein={false}
        />
      </svg>
    </Plant>
  );
}

/**
 * Leaves drifting down behind the timeline, looping forever.
 *
 * Generated rather than hand-listed so the column is evenly covered and the
 * count is easy to tune. The jitter comes from a hash of the index, so it is
 * deterministic — the same leaves land in the same places on every render.
 *
 * `delay` is negative on purpose: it seeks each leaf partway into its own loop
 * so the section already has leaves mid-fall the first time it scrolls into
 * view, instead of starting empty and filling up.
 */
const TONES = [palette.olive, palette.sage, palette.forest, palette.accent];
const COUNT = 20;

const hash = (n) => {
  const v = Math.sin(n) * 43758.5453;
  return v - Math.floor(v);
};

const FALLING = Array.from({ length: COUNT }, (_, i) => {
  const a = hash(i * 12.9898 + 1);
  const b = hash(i * 78.233 + 2);
  const c = hash(i * 39.425 + 3);
  const dur = 11 + a * 7;
  return {
    id: i,
    x: `${((i + 0.5) / COUNT) * 100 + (b - 0.5) * 3}%`,
    size: 13 + b * 12,
    tone: TONES[i % TONES.length],
    o: 0.18 + c * 0.14,
    dur,
    delay: -hash(a + b) * dur,
    drift: (i % 2 ? 1 : -1) * (18 + c * 26),
    // Just past the section height, so a leaf finishes fading out as it
    // reaches the bottom edge rather than vanishing in mid-air above it.
    fall: 780 + a * 60,
  };
});

/**
 * Rendered into Section's decor layer, which already sits behind the content
 * at zIndex 0 with pointer-events off, so the leaves pass behind the heading
 * and the timeline card rather than over them.
 */
function FallingLeaves() {
  // Anyone who has asked the OS to calm animations gets the static scatter.
  const still = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (still) {
    return LEAVES.map((l) => <LeafSticker key={`${l.x}-${l.y}`} {...l} />);
  }

  return FALLING.map((l) => (
    <Plant key={l.id} w={l.size * 2} h={l.size} left={l.x} top={-48}>
      <DriftingLeaf
        size={l.size}
        tone={l.tone}
        opacity={l.o}
        duration={l.dur}
        delay={l.delay}
        drift={l.drift}
        fall={l.fall}
      />
    </Plant>
  ));
}

const DECOR = (
  <>
    <MossBackdrop />
    <FallingLeaves />
  </>
);

/* --------------------------------------------------------------- the card */

// Bullets bloom one after another rather than the block appearing whole.
const bulletVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.26, ease: EASE } },
};

function Detail({ exp }) {
  return (
    <Box
      sx={{
        borderRadius: "14px",
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        // The same crisp dark edge the Skills cards carry, not a soft shadow.
        border: `1px solid ${PINE}38`,
        overflow: "hidden",
      }}
    >
      {/* The logos are wide wordmarks, so they run as a banner across the top
          of the card rather than being squeezed into a small plate. */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // Fixed height so the logo can be sized to fill it exactly.
          height: { xs: 82, md: 100 },
          overflow: "hidden",
          // Each logo's art has a solid background baked in; painting the
          // whole banner that colour makes the strip read as one edge-to-edge
          // header.
          backgroundColor: exp.brand ?? "#FFFFFF",
          borderBottom: `1px solid ${PINE}2E`,
        }}
      >
        <Box
          component="img"
          src={exp.logo}
          alt={`${exp.company} logo`}
          loading="lazy"
          sx={{
            // Full banner height; the art's own margins keep the wordmark from
            // touching the edges, and the brand colour fills either side.
            height: "100%",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      </Box>

      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        {/* A pine hairline under the role block, so the title has something to
            sit against instead of floating over the body copy. */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          justifyContent="space-between"
          sx={{ pb: 2, mb: 2.5, borderBottom: `1px solid ${PINE}1F` }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h3"
              sx={{
                lineHeight: 1.15,
                color: "#1B2E1E",
                letterSpacing: "-0.01em",
              }}
            >
              {exp.company}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                fontSize: "0.9375rem",
                fontWeight: 700,
                color: PINE,
              }}
            >
              {exp.role}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: "left", sm: "right" }, flexShrink: 0 }}>
            <Typography
              sx={{
                fontFamily: MONO,
                fontSize: "0.8125rem",
                fontWeight: 700,
                color: PINE,
              }}
            >
              {exp.start} – {exp.end}
            </Typography>
            <Typography variant="body2" sx={{ color: palette.muted }}>
              {exp.location}
            </Typography>
          </Box>
        </Stack>

        <Box
          component={motion.ul}
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          sx={{ m: 0, pl: 0, listStyle: "none" }}
        >
          {exp.bullets.map((b) => (
            <Box
              component={motion.li}
              key={b.slice(0, 40)}
              variants={bulletVariants}
              sx={{
                display: "flex",
                gap: 1.5,
                mb: 1.5,
                alignItems: "flex-start",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  mt: "0.55em",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: PINE,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: "#292524" }}>
                {b}
              </Typography>
            </Box>
          ))}
        </Box>

        {exp.tech.length > 0 && (
          <Box
            component={motion.div}
            initial="hidden"
            animate="show"
            variants={{
              show: {
                transition: { staggerChildren: 0.025, delayChildren: 0.1 },
              },
            }}
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 3 }}
          >
            {/* Identical to the Skills pills, down to the hover fill. */}
            {exp.tech.map((t) => (
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
                  cursor: "default",
                  transformOrigin: "bottom center",
                  // Named properties, not `all`: `all` puts every property the
                  // pill has on the transition's watch list.
                  transition:
                    "transform .18s cubic-bezier(.22,1,.36,1), background-color .18s ease, border-color .18s ease, color .18s ease, box-shadow .18s ease",
                  "&:hover": {
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
        )}
      </Box>
    </Box>
  );
}

/* ------------------------------------------------------------ the section */

export default function Experience() {
  // A role is always open — the most recent one by default. There is no
  // unselected state any more, which is why `current` can never be null.
  const [selected, setSelected] = useState(experience[0].id);

  const current = experience.find((e) => e.id === selected) ?? experience[0];

  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Where I've worked"
      background={CREAM}
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
          [ {experience.length} ROLES ]
        </Box>
      }
    >
      <Box
        sx={{
          position: "relative",
          // Clips the canopy to the container's rounded edge.
          overflow: "hidden",
          // Opaque enough to read as paper without a backdrop-filter. The blur
          // that used to sit here had to re-sample everything behind the
          // container on every frame the page scrolled.
          backgroundColor: "rgba(242, 239, 233, 0.78)",
          border: `1px solid ${PINE}3D`,
          borderRadius: "24px",
          p: { xs: 2, md: 2.5 },
          // Isolates the panel from the page's layout and paint lifecycle.
          contain: "layout style paint",
        }}
      >
        {/* The hero's own Canopy, hanging in from the top-right corner, toned
            to one flat olive. Shorter than the Skills one on purpose: it drips
            through the empty right end of the tab row and stops above the logo
            banner rather than hanging across a company's branding. */}
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
          <Plant w={280} h={165} top={-64} right={-48}>
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
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 2.5 },
          }}
        >
          {/* Three clusters rather than one row of six. A co-op at a
              healthcare company, a tech-lead role at a startup and a teaching
              assistantship are not comparable entries in a flat list, and
              grouping them says more than the dates do. */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, auto)" },
              justifyContent: { md: "start" },
              gap: { xs: 2.5, md: 0 },
            }}
          >
            {EXPERIENCE_GROUPS.map((group, gi) => (
              <Box
                key={group.id}
                sx={{
                  // A hairline between clusters, never before the first.
                  pl: { md: gi === 0 ? 0 : 3 },
                  ml: { md: gi === 0 ? 0 : 3 },
                  borderLeft: {
                    md: gi === 0 ? "none" : `1px solid ${PINE}24`,
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 1,
                    fontFamily: MONO,
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: PINE,
                    opacity: 0.7,
                  }}
                >
                  {group.label}
                </Box>

                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                  {experience
                    .filter((e) => e.category === group.id)
                    .map((exp) => {
                      const active = exp.id === current.id;
                      return (
                        <Box
                          component="button"
                          key={exp.id}
                          onClick={() => setSelected(exp.id)}
                          aria-pressed={active}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 0.25,
                            px: 1.75,
                            py: 1,
                            cursor: "pointer",
                            // Explicit px: sx borderRadius multiplies the
                            // theme's 12px base, so `2` would be a 24px pill.
                            borderRadius: "10px",
                            textAlign: "left",
                            fontFamily: "inherit",
                            // Active is a solid pine plate with cream on it —
                            // the same contrast as the navbar CTA. Inactive is
                            // a sage hairline on near-white.
                            border: `1px solid ${active ? PINE : palette.sage}`,
                            backgroundColor: active
                              ? PINE
                              : "rgba(255,255,255,0.8)",
                            color: active ? CREAM : "#1B2E1E",
                            transition:
                              "transform .2s cubic-bezier(.22,1,.36,1), background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease",
                            "&:hover": {
                              willChange: "transform",
                              transform: "translateY(-2px)",
                              borderColor: PINE,
                              boxShadow: active
                                ? `0 8px 18px -10px ${PINE}`
                                : `0 6px 16px -8px ${PINE}, 0 0 0 4px ${PINE}1A`,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              fontSize: "0.875rem",
                              fontWeight: 600,
                              lineHeight: 1.2,
                            }}
                          >
                            {exp.company}
                          </Box>
                          <Box
                            sx={{
                              fontFamily: MONO,
                              fontSize: "0.6875rem",
                              color: active
                                ? "rgba(248,246,240,0.78)"
                                : palette.muted,
                            }}
                          >
                            {exp.start} – {exp.end}
                          </Box>
                        </Box>
                      );
                    })}
                </Stack>
              </Box>
            ))}
          </Box>

          {/* The outgoing card goes `position: absolute` the instant it starts
              leaving, so it is out of flow and the incoming one lays out at
              its own height immediately. With both in flow the panel would
              collapse to nothing between the two and snap back open. */}
          <Box sx={{ position: "relative" }}>
            <AnimatePresence initial={false}>
              <Box
                component={motion.div}
                key={current.id}
                initial={{ opacity: 0, x: 28, z: 0 }}
                animate={{ opacity: 1, x: 0, z: 0 }}
                exit={{
                  opacity: 0,
                  x: -22,
                  z: 0,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                }}
                transition={{ duration: 0.34, ease: EASE }}
              >
                <Detail exp={current} />
              </Box>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Section>
  );
}
