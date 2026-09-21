import { useState } from "react";
import { Box, Typography, Stack, Chip, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "motion/react";
import Section from "../components/Section";
import ExperienceTree from "./ExperienceTree";
import { palette, MONO } from "../theme";
import { experience } from "../data/experience";

const EASE = [0.22, 1, 0.36, 1];
// Relative luminance, so the close button stays visible on dark brand banners.
function isDark(hex) {
  const v = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.55;
}

function Detail({ exp, onClose }) {
  const onDarkBanner = isDark(exp.brand ?? "#FFFFFF");

  return (
    <Box
      sx={{
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
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
          px: 0,
          py: 0,
          overflow: "hidden",
          // Each logo's art has a solid background baked in; painting the whole
          // banner that colour makes the strip read as one edge-to-edge header.
          backgroundColor: exp.brand ?? "#FFFFFF",
          borderBottom: `1px solid ${palette.border}`,
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
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Close details"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: onDarkBanner ? "rgba(255,255,255,0.85)" : palette.muted,
              "&:hover": {
                backgroundColor: onDarkBanner
                  ? "rgba(255,255,255,0.14)"
                  : palette.surfaceAlt,
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          justifyContent="space-between"
          sx={{ mb: 2.5 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
              {exp.company}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: palette.accent, fontWeight: 600 }}
            >
              {exp.role}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: "left", sm: "right" }, flexShrink: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontFamily: MONO, fontSize: "0.8125rem", fontWeight: 600 }}
            >
              {exp.start} – {exp.end}
            </Typography>
            <Typography variant="body2" sx={{ color: palette.muted }}>
              {exp.location}
            </Typography>
          </Box>
        </Stack>

        <Box component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }}>
          {exp.bullets.map((b) => (
            <Box
              component="li"
              key={b.slice(0, 40)}
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
                  mt: "0.6em",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: palette.accent,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2">{b}</Typography>
            </Box>
          ))}
        </Box>

        {exp.tech.length > 0 && (
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={0.75}
            sx={{ mt: 2.5 }}
          >
            {exp.tech.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                sx={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default function Experience() {
  // Nothing is selected until the visitor picks a branch; the tree starts
  // centred and full width, then shrinks to a side column on selection.
  const [selected, setSelected] = useState(null);

  const current = experience.find((e) => e.id === selected) ?? null;
  const toggle = (id) => setSelected((prev) => (prev === id ? null : id));

  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Where I've worked"
      tinted
      bounded
      containerMaxWidth={1280}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2.5, md: 3 },
        }}
      >
        <AnimatePresence mode="wait">
          {current ? (
            /* Selected: the tree steps aside for a compact tab row, so the
               roles stay one click apart and the detail sits right under them. */
            <Box
              component={motion.div}
              key="picked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2, md: 2.5 },
              }}
            >
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                {experience.map((exp) => {
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
                        // Explicit px: sx borderRadius multiplies the theme's
                        // 12px base, so `2` would render as a 24px pill.
                        borderRadius: "10px",
                        textAlign: "left",
                        fontFamily: "inherit",
                        border: `1px solid ${active ? palette.accent : palette.border}`,
                        backgroundColor: active ? palette.accent : palette.bg,
                        color: active ? "#fff" : palette.text,
                        transition: "all .2s ease",
                        "&:hover": {
                          borderColor: palette.accent,
                          backgroundColor: active
                            ? palette.accent
                            : palette.surfaceAlt,
                        },
                      }}
                    >
                      {/* Full company name here — the tree uses `short`
                          because its cards are too narrow for these. */}
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
                            ? "rgba(255,255,255,0.8)"
                            : palette.muted,
                        }}
                      >
                        {exp.start} – {exp.end}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>

              <AnimatePresence mode="wait">
                <Box
                  component={motion.div}
                  key={current.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: EASE }}
                >
                  <Detail exp={current} onClose={() => setSelected(null)} />
                </Box>
              </AnimatePresence>
            </Box>
          ) : (
            /* Idle: the full tree. Width is capped against viewport height so
               the whole branch fits on one screen on shorter displays. */
            <Box
              component={motion.div}
              key="tree"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              <Box
                sx={{
                  width: "100%",
                  // Tree aspect is 1120:400 (2.8), so capping width caps height.
                  maxWidth: { lg: "min(100%, calc((100dvh - 340px) * 2.8))" },
                  mx: "auto",
                  overflowX: { xs: "auto", lg: "visible" },
                  overflowY: "hidden",
                  pb: { xs: 1, lg: 0 },
                  "&::-webkit-scrollbar": { height: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: palette.border,
                    borderRadius: 3,
                  },
                }}
              >
                <Box sx={{ minWidth: { xs: 860, lg: 0 } }}>
                  <ExperienceTree selected={selected} onSelect={toggle} />
                </Box>
              </Box>

              {/* Editorial pill rather than a plain caption */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: { xs: 3, md: 4 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 999,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(42,59,42,0.7)",
                    backgroundColor: "rgba(232,229,220,0.5)",
                    border: "1px solid rgba(42,59,42,0.1)",
                  }}
                >
                  Select a branch to see the details
                </Box>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
    </Section>
  );
}
