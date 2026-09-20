import { useMemo, useState } from "react";
import { Box, Typography, Stack, Chip, Button, IconButton } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import { motion, AnimatePresence } from "motion/react";
import Section from "../components/Section";
import { palette } from "../theme";
import { projects, categories } from "../data/projects";

function Media({ project }) {
  const common = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: project.imageFit ?? "cover",
    objectPosition: "top center",
  };

  if (project.video) {
    // poster shows a real frame without downloading the video; it only loads on hover.
    return (
      <Box
        component="video"
        src={project.video}
        poster={project.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={`${project.title} demo`}
        onMouseEnter={(e) => {
          const p = e.currentTarget.play();
          if (p) p.catch(() => {});
        }}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
        sx={common}
      />
    );
  }

  return (
    <Box
      component="img"
      src={project.image}
      alt={`${project.title} preview`}
      loading="lazy"
      sx={{
        ...common,
        p: project.imageFit === "contain" ? 4 : 0,
        transition: "transform .4s cubic-bezier(.22,1,.36,1)",
      }}
    />
  );
}

function Card({ project, featured }) {
  return (
    <Box
      component={motion.article}
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        display: "flex",
        flexDirection: featured ? { xs: "column", md: "row" } : "column",
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: palette.bg,
        border: `1px solid ${palette.border}`,
        transition: "border-color .25s ease, box-shadow .25s ease, transform .25s ease",
        "&:hover": {
          borderColor: palette.accent,
          boxShadow: `0 12px 32px ${palette.accent}22`,
          transform: "translateY(-3px)",
        },
        "&:hover img": { transform: "scale(1.03)" },
        gridColumn: featured ? { xs: "auto", md: "1 / -1" } : "auto",
      }}
    >
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: palette.surface,
          borderBottom: featured ? "none" : `1px solid ${palette.border}`,
          flex: featured ? { md: "1 1 56%" } : "none",
          aspectRatio: featured ? { xs: "16 / 10", md: "auto" } : "16 / 10",
          minHeight: featured ? { md: 320 } : "auto",
        }}
      >
        <Media project={project} />
      </Box>

      <Box
        sx={{
          p: featured ? { xs: 3, md: 4 } : 2.5,
          display: "flex",
          flexDirection: "column",
          flex: featured ? { md: "1 1 44%" } : 1,
          justifyContent: "center",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {featured && (
            <Chip
              label="Featured"
              size="small"
              sx={{
                backgroundColor: palette.accent,
                color: "#fff",
                fontWeight: 600,
                height: 22,
              }}
            />
          )}
          <Typography variant="caption" sx={{ color: palette.muted }}>
            {project.period}
          </Typography>
        </Stack>

        <Typography variant={featured ? "h3" : "h4"} sx={{ mb: 1 }}>
          {project.title}
        </Typography>

        <Typography variant="body2" sx={{ color: palette.muted, mb: 2 }}>
          {featured ? project.description : project.blurb}
        </Typography>

        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 2 }}>
          {project.tech.slice(0, featured ? 99 : 5).map((t) => (
            <Box
              key={t}
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: "0.75rem",
                fontWeight: 500,
                color: palette.muted,
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
              }}
            >
              {t}
            </Box>
          ))}
          {!featured && project.tech.length > 5 && (
            <Box sx={{ px: 1, py: 0.25, fontSize: "0.75rem", color: palette.muted }}>
              +{project.tech.length - 5}
            </Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: "auto" }}>
          {project.live && (
            <Button
              size="small"
              variant={featured ? "contained" : "text"}
              color="primary"
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<NorthEastIcon sx={{ fontSize: 14 }} />}
              sx={!featured ? { px: 0, color: palette.accentDark } : undefined}
            >
              Live site
            </Button>
          )}
          {project.github && (
            <IconButton
              size="small"
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub`}
              sx={{ color: palette.muted, "&:hover": { color: palette.text } }}
            >
              <GitHubIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Things I've built"
      intro="Side projects, startup work, and a few favourites from coursework."
      tinted
    >
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 3 }}>
        {categories.map((c) => {
          const active = filter === c.id;
          return (
            <Box
              component="button"
              key={c.id}
              onClick={() => setFilter(c.id)}
              aria-pressed={active}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 999,
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                fontFamily: "inherit",
                color: active ? "#fff" : palette.muted,
                backgroundColor: active ? palette.accent : palette.bg,
                border: `1px solid ${active ? palette.accent : palette.border}`,
                transition: "all .2s ease",
                "&:hover": { borderColor: palette.accent, color: active ? "#fff" : palette.text },
              }}
            >
              {c.label}
            </Box>
          );
        })}
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
          gap: { xs: 2.5, md: 3 },
          alignItems: "stretch",
        }}
      >
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <Card key={p.id} project={p} featured={p.featured && filter !== "class"} />
          ))}
        </AnimatePresence>
      </Box>
    </Section>
  );
}
