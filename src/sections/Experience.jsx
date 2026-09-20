import { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ParkOutlinedIcon from "@mui/icons-material/ParkOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion, AnimatePresence } from "motion/react";
import Section from "../components/Section";
import ExperienceTree from "./ExperienceTree";
import { palette } from "../theme";
import { experience } from "../data/experience";

function Detail({ exp }) {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 3,
        backgroundColor: palette.surface,
        border: `1px solid ${palette.border}`,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Wide wordmarks, so this is a landscape plate rather than a square. */}
          <Box
            sx={{
              width: 116,
              height: 48,
              borderRadius: 2,
              flexShrink: 0,
              backgroundColor: palette.bg,
              border: `1px solid ${palette.border}`,
              display: "grid",
              placeItems: "center",
              px: 1.25,
            }}
          >
            <Box
              component="img"
              src={exp.logo}
              alt=""
              loading="lazy"
              sx={{ maxWidth: "100%", maxHeight: 28, objectFit: "contain" }}
            />
          </Box>
          <Box>
            <Typography variant="h3" sx={{ lineHeight: 1.2 }}>
              {exp.company}
            </Typography>
            <Typography variant="body2" sx={{ color: palette.accent, fontWeight: 600 }}>
              {exp.role}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ textAlign: { xs: "left", sm: "right" }, flexShrink: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
            sx={{ display: "flex", gap: 1.5, mb: 1.5, alignItems: "flex-start" }}
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
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mt: 2.5 }}>
          {exp.tech.map((t) => (
            <Chip
              key={t}
              label={t}
              size="small"
              sx={{
                backgroundColor: palette.bg,
                border: `1px solid ${palette.border}`,
                fontWeight: 500,
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default function Experience() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Tree is the default where there's room to read it; the labels inside a
  // 1100-unit viewBox are unreadable on a phone, so small screens open on the list.
  const [view, setView] = useState("tree");
  const [selected, setSelected] = useState(experience[0].id);

  const effectiveView = isDesktop ? view : view === "tree" ? "list" : view;
  const current = experience.find((e) => e.id === selected) ?? experience[0];

  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Where I've worked"
      intro="Six roles across healthcare tech, travel, education, and motorsport. Click a branch to read more."
    >
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={effectiveView}
          onChange={(_, v) => v && setView(v)}
          sx={{
            "& .MuiToggleButton-root": {
              borderColor: palette.border,
              color: palette.muted,
              px: 1.75,
              gap: 0.75,
              "&.Mui-selected": {
                backgroundColor: palette.surface,
                color: palette.accentDark,
                "&:hover": { backgroundColor: palette.surfaceAlt },
              },
            },
          }}
        >
          <ToggleButton value="tree" disabled={!isDesktop}>
            <ParkOutlinedIcon sx={{ fontSize: 18 }} /> Tree
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListOutlinedIcon sx={{ fontSize: 18 }} /> List
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {effectiveView === "tree" ? (
        <Box>
          <ExperienceTree selected={selected} onSelect={setSelected} />
          <Box sx={{ mt: 4 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Detail exp={current} />
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {experience.map((exp) => {
            const open = selected === exp.id;
            return (
              <Box key={exp.id}>
                <Box
                  component="button"
                  onClick={() => setSelected(open ? "" : exp.id)}
                  aria-expanded={open}
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    textAlign: "left",
                    p: 2,
                    cursor: "pointer",
                    borderRadius: 2,
                    border: `1px solid ${open ? palette.accent : palette.border}`,
                    backgroundColor: open ? palette.surface : palette.bg,
                    transition: "border-color .2s ease, background-color .2s ease",
                    "&:hover": { borderColor: palette.accent },
                  }}
                >
                  <Box
                    component="img"
                    src={exp.logo}
                    alt=""
                    loading="lazy"
                    sx={{ width: 84, maxHeight: 26, objectFit: "contain", flexShrink: 0 }}
                  />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>{exp.company}</Typography>
                    <Typography variant="body2" sx={{ color: palette.muted }}>
                      {exp.role}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: palette.muted,
                      flexShrink: 0,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    {exp.start} – {exp.end}
                  </Typography>
                  <ExpandMoreIcon
                    sx={{
                      color: palette.muted,
                      transform: open ? "rotate(180deg)" : "none",
                      transition: "transform .2s ease",
                    }}
                  />
                </Box>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <Box sx={{ pt: 1.5 }}>
                        <Detail exp={exp} />
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            );
          })}
        </Stack>
      )}
    </Section>
  );
}
