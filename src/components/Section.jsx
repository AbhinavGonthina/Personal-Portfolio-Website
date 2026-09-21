import { Box, Container, Typography } from "@mui/material";
import { motion } from "motion/react";
import { palette } from "../theme";

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
  maxWidth = "lg",
  tinted = false,
  disableGutterTop = false,
  bounded = false,
  aside = null,
  containerMaxWidth = null,
  decor = null,
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
        // One screen per section. min-height rather than height, so sections
        // whose content is taller than the viewport still grow to fit.
        minHeight: { md: "100dvh" },
        display: "flex",
        flexDirection: "column",
        // Content starts near the top rather than floating in the middle of
        // the screen; any slack falls to the bottom of the section.
        justifyContent: "flex-start",
        pt: disableGutterTop ? 0 : { xs: 7, md: 8 },
        pb: { xs: 8, md: 10 },
        backgroundColor: tinted ? palette.surface : "transparent",
        // Hairlines bound the section against its neighbours.
        ...(bounded && {
          borderTop: "1px solid rgba(42, 59, 42, 0.10)",
          borderBottom: "1px solid rgba(42, 59, 42, 0.10)",
        }),
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
        maxWidth={containerMaxWidth ? false : maxWidth}
        sx={{
          position: "relative",
          zIndex: 1,
          ...(containerMaxWidth && {
            maxWidth: { lg: containerMaxWidth },
            mx: "auto",
            px: { xs: 3, md: 4 },
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
        >
          {children}
        </Box>
      </Container>
    </Box>
  );
}
