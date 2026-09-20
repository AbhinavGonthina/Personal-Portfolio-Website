import { Box, Container, Typography, Button, Stack, Chip } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import { motion } from "motion/react";
import { palette } from "../theme";
import { profile } from "../data/profile";

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        pt: { xs: 6, md: 10 },
        pb: { xs: 8, md: 12 },
      }}
    >
      {/* Soft camel wash behind the portrait, keeps the cream from feeling flat */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "-18%",
          right: "-12%",
          width: { xs: 420, md: 720 },
          height: { xs: 420, md: 720 },
          borderRadius: "50%",
          background: `radial-gradient(circle, ${palette.accent}22 0%, ${palette.accent}00 68%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: profile.photo
              ? { xs: "1fr", md: "1.15fr 0.85fr" }
              : "1fr",
            gap: { xs: 5, md: 6 },
            alignItems: "center",
          }}
        >
          {/* Text column */}
          <Box sx={{ maxWidth: profile.photo ? "none" : 820 }}>
            <motion.div initial="hidden" animate="show" custom={0} variants={rise}>
              <Chip
                label={`CS @ Northeastern · ${profile.location}`}
                size="small"
                sx={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.muted,
                  fontWeight: 500,
                  mb: 3,
                }}
              />
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={1} variants={rise}>
              <Typography variant="h1" sx={{ mb: 1.5 }}>
                {profile.name}
              </Typography>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={2} variants={rise}>
              <Typography
                variant="h3"
                component="p"
                sx={{ color: palette.accent, fontWeight: 500, mb: 2.5 }}
              >
                {profile.role}
              </Typography>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={3} variants={rise}>
              <Typography variant="subtitle1" sx={{ maxWidth: 560, mb: 4 }}>
                {profile.tagline}
              </Typography>
            </motion.div>

            <motion.div initial="hidden" animate="show" custom={4} variants={rise}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowDownwardIcon />}
                  onClick={() => scrollTo("projects")}
                >
                  View my work
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<NorthEastIcon sx={{ fontSize: 16 }} />}
                  href="https://drive.google.com/file/d/1mmaNnu9ERCRxq-6wIewLTS-31G37Ce_p/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Résumé
                </Button>
              </Stack>
            </motion.div>
          </Box>

          {/* Portrait column — only rendered once profile.photo is set */}
          {profile.photo && (
            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              sx={{ position: "relative", justifySelf: "center", width: "100%", maxWidth: 420 }}
            >
              <Box
                sx={{
                  position: "relative",
                  borderRadius: "999px 999px 28px 28px",
                  overflow: "hidden",
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                }}
              >
                <Box
                  component="img"
                  src={profile.photo}
                  alt={`Portrait of ${profile.name}`}
                  width={1000}
                  height={1193}
                  sx={{ display: "block", width: "100%", height: "auto" }}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
