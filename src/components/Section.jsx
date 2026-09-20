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
}) {
  return (
    <Box
      id={id}
      component="section"
      sx={{
        // scroll-margin keeps the sticky navbar from covering the heading
        scrollMarginTop: { xs: 72, md: 84 },
        py: { xs: 8, md: 14 },
        pt: disableGutterTop ? 0 : undefined,
        backgroundColor: tinted ? palette.surface : "transparent",
      }}
    >
      <Container maxWidth={maxWidth}>
        {(eyebrow || title) && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            sx={{ mb: { xs: 4, md: 6 }, maxWidth: 720 }}
          >
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
