import { Box, Chip, Container, Typography, Button, Stack } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import HistoryIcon from "@mui/icons-material/History";
import { motion } from "motion/react";
import { Canopy, LeafMark, Plant, VineDivider } from "../components/Botanical";
import StoneFrame from "../components/StoneWall";
import { palette, PAGE_MAX } from "../theme";
import { profile } from "../data/profile";
// The About section is parked, but its education data still feeds the landing.
import { education } from "../data/about";

// The badge above already says "CS @ Northeastern", so the degree is omitted.
const CREDENTIALS = [
  `Graduating ${education.graduation}`,
  `GPA ${education.gpa}`,
  education.honors,
];

const RESUME_URL =
  "https://drive.google.com/file/d/1mmaNnu9ERCRxq-6wIewLTS-31G37Ce_p/view?usp=sharing";

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Hero() {
  const scrollTo = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        // Fills the first screen, minus the sticky navbar it sits under.
        minHeight: { md: "calc(100dvh - 76px)" },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        pt: { xs: 6, md: 7 },
        // The vine rule, not the section edge, is what the eye reads as the
        // bottom of the hero — so the content centres against the vine's
        // centre line. That sits 35px up from the section floor (10px offset
        // plus half its 50px height), and matching it as extra bottom padding
        // holds the centring at any viewport height.
        pb: { xs: 6, md: "91px" },
      }}
    >
      {/* Ambient forest vignette in the top-right, so the cream isn't flat */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(42,59,42,0.10) 0%, rgba(42,59,42,0.04) 38%, transparent 70%)",
        }}
      />

      {/* Canopy spills in from the top-right and stops above the photo card.
          zIndex 0 keeps it behind the content. */}
      <Box
        aria-hidden
        sx={{
          display: { xs: "none", md: "block" },
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* Narrower box pushed further right, so the stems hang along the
            canvas edge instead of crossing the photo frame's top border.
            392x285 keeps the SVG at the same 0.89 scale, so leaf size is
            unchanged. */}
        <Plant
          w={{ md: 330, lg: 392 }}
          h={{ md: 240, lg: 285 }}
          top={-40}
          right={-72}
        >
          <Canopy stems={8} opacity={0.5} animate={false} />
        </Plant>

        {/* Smaller mirrored canopy from the top-left. Narrower box than the
            right one, and `length` hangs the stems lower without enlarging
            the leaves. */}
        <Plant
          w={{ md: 200, lg: 240 }}
          h={{ md: 146, lg: 175 }}
          top={-40}
          left={-156}
        >
          <Canopy stems={6} opacity={0.42} length={1.5} animate={false} flip />
        </Plant>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: PAGE_MAX,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            gap: { xs: 5, md: 4 },
            alignItems: "center",
          }}
        >
          {/* Copy — 7 of 12 */}
          <Box sx={{ gridColumn: { md: "span 7" } }}>
            <motion.div
              initial="hidden"
              animate="show"
              custom={0}
              variants={rise}
            >
              <Chip
                icon={<LeafMark size={15} tone={palette.olive} />}
                label={`CS @ Northeastern · ${profile.location}`}
                size="small"
                sx={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  color: palette.text,
                  fontWeight: 500,
                  mb: 3,
                  pl: 0.75,
                  "& .MuiChip-icon": { ml: 0, mr: 0.25 },
                }}
              />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={1}
              variants={rise}
            >
              <Typography variant="h1" sx={{ mb: 1.5 }}>
                {profile.name}
              </Typography>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={2}
              variants={rise}
            >
              {/* Tracked sans rather than mono — same editorial weight without
                  the terminal feel. */}
              <Typography
                component="p"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#2A3B2A",
                  mb: 3,
                }}
              >
                {profile.role}
              </Typography>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={3}
              variants={rise}
            >
              {/* Lead paragraph: larger and looser than a standard body copy,
                  so it carries the left column on its own. */}
              <Typography
                sx={{
                  maxWidth: 580,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.95,
                  color: "#292524",
                }}
              >
                {profile.tagline}
              </Typography>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={4}
              variants={rise}
            >
              {/* Rule grounds the metadata against the lead paragraph */}
              <Box
                aria-hidden
                sx={{
                  maxWidth: 580,
                  my: 3.5,
                  borderTop: "1px solid rgba(42, 59, 42, 0.15)",
                }}
              />
              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                sx={{
                  alignItems: "center",
                  columnGap: 1.5,
                  rowGap: 0.75,
                  mb: 4,
                }}
              >
                {/* Separator trails its item, so a wrap never starts with a dot */}
                {CREDENTIALS.map((c, i) => (
                  <Stack
                    key={c}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.9375rem",
                        fontWeight: 600,
                        color: palette.text,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c}
                    </Typography>
                    {i < CREDENTIALS.length - 1 && (
                      <Box
                        aria-hidden
                        sx={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          backgroundColor: palette.action,
                          opacity: 0.55,
                        }}
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="show"
              custom={5}
              variants={rise}
            >
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowDownwardIcon />}
                  onClick={() => scrollTo("experience")}
                >
                  View my work
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<NorthEastIcon sx={{ fontSize: 16 }} />}
                  href={RESUME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Résumé
                </Button>
                {/* A plain anchor, not a router link: the archive is a
                    separate app served as static files under /legacy, so this
                    has to be a real navigation. */}
                <Button
                  variant="text"
                  size="large"
                  endIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
                  href="/legacy/"
                  sx={{ color: palette.muted }}
                >
                  Legacy site
                </Button>
              </Stack>
            </motion.div>
          </Box>

          {/* Portrait — 5 of 12. Square container matches the square source, so
              the shoulders are never cropped. */}
          {/* No fade-in of its own: StoneFrame throws the portrait onto the
              wall on load, and a second entrance underneath it would have the
              picture fading up while it is still in the air. */}
          <Box
            sx={{
              gridColumn: { md: "span 5" },
              justifySelf: { xs: "center", md: "end" },
              width: "100%",
              maxWidth: 320,
              display: { xs: "none", md: "block" },
            }}
          >
            {/* Portrait set into a weathered stone wall, with ivy rooted in the
                mortar joints around it. */}
            <Box sx={{ position: "relative" }}>
              <StoneFrame seed={19} spread={2.1}>
                {profile.photo && (
                  <Box
                    component="img"
                    src={profile.photo}
                    alt={`Portrait of ${profile.name}`}
                    width={820}
                    height={820}
                    sx={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                  />
                )}
              </StoneFrame>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Botanical rule. Absolute and a sibling of the Container, so it anchors
          to the section's bottom and never shifts where the content centres. */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          // Centred in the gap between the buttons and the section floor.
          // That midpoint moves with viewport height, so it is solved rather
          // than pinned: with the content block centred by pt/pb, the gap
          // below it is (H - pt + pb)/2 - gridH/2, and half of that less half
          // the rule's own height gives
          //   (100dvh - 76 - 56 + 91)/4 - 445/4 - 25  =  25dvh - 146.5px
          // The 445 is the content block's height; if that copy grows by a
          // line, this constant needs revisiting.
          bottom: { xs: 10, md: "max(10px, calc(25dvh - 146.5px))" },
          zIndex: 1,
          width: "90%",
          maxWidth: 896,
          height: 50,
          pointerEvents: "none",
        }}
      >
        <VineDivider leaves={21} opacity={0.9} stroke="rgba(42, 59, 42, 0.4)" />
      </Box>
    </Box>
  );
}
