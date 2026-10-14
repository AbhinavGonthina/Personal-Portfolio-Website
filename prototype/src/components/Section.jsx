import { Box, Container, Typography } from "@mui/material";
import { motion } from "motion/react";
import { palette, PAGE_MAX } from "../theme";

// The divider between sections, and the one the footer closes on.
export const RULE = "rgba(42, 59, 42, 0.10)";

/**
 * Every section on the page goes through here: it owns the scroll anchor,
 * the vertical rhythm, and the reveal-on-scroll. Sections themselves only
 * describe content.
 */
export default function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  tinted = false,
  background = null,
  aside = null,
  containerMaxWidth = null,
  decor = null,
  // Lets a section's children fill the leftover height instead of leaving it
  // as dead space below them, so a child can push itself to the floor with
  // `mt: "auto"`. Off by default: every other section wants its slack below.
  grow = false,
}) {
  return (
    <Box
      id={id}
      component="section"
      sx={{
        position: "relative",
        // Decorations are placed past the edges on purpose; clip them here.
        overflow: "hidden",
        // Exactly the sticky navbar's height (64/76 toolbar + 1px border), so a
        // nav click lands the section flush under it with no sliver of gap.
        scrollMarginTop: { xs: 65, md: 77 },
        // One screen per section, measured against the space *below* the
        // sticky navbar rather than the full viewport — a section anchors at
        // scrollMarginTop, so sizing it to 100dvh would push its last 77px
        // under the fold. min-height, not height, so a section whose content
        // outgrows the screen still grows to fit it.
        minHeight: { md: "calc(100dvh - 77px)" },
        display: "flex",
        flexDirection: "column",
        // Content starts at the top gutter rather than floating in the middle.
        // Centring made the gap above a heading depend on how much content
        // followed it — 73px on a full section, 162px on a short one — so no
        // two headings sat at the same height. A fixed top gutter gives every
        // section the same start; the leftover height falls below the content.
        justifyContent: "flex-start",
        pt: { xs: 5, md: 6 },
        pb: { xs: 5, md: 6 },
        backgroundColor:
          background ?? (tinted ? palette.surface : "transparent"),
        // Every section carries the divider above it, which puts a hairline
        // at each boundary without two sections both drawing one into the
        // same gap. The footer draws the closing line below the last section.
        borderTop: `1px solid ${RULE}`,
      }}
    >
      {decor && (
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          {decor}
        </Box>
      )}

      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: containerMaxWidth ?? PAGE_MAX,
          mx: "auto",
          ...(grow && {
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }),
        }}
      >
        {(eyebrow || title) && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              mb: { xs: 4, md: 6 },
              // With an aside the header splits across the full width;
              // without one it stays a narrow measure on the left.
              maxWidth: aside ? "none" : 720,
              display: aside ? "flex" : "block",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
              gap: { xs: 2, md: 6 },
            }}
          >
            <Box sx={{ maxWidth: 720 }}>
              {eyebrow && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    color: palette.accent,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    mb: 1.5,
                    "&::before": {
                      content: '""',
                      width: 24,
                      height: 1,
                      backgroundColor: palette.accent,
                    },
                  }}
                >
                  {eyebrow}
                </Typography>
              )}
              {title && <Typography variant="h2">{title}</Typography>}
              {intro && (
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  {intro}
                </Typography>
              )}
            </Box>

            {aside && (
              <Box sx={{ flexShrink: 0, maxWidth: { md: 300 } }}>{aside}</Box>
            )}
          </Box>
        )}

        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          sx={
            grow
              ? { flexGrow: 1, display: "flex", flexDirection: "column" }
              : undefined
          }
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}
