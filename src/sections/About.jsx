import { Box, Typography, Chip, Stack, Divider } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import Section from "../components/Section";
import { palette } from "../theme";
import {
  bio,
  education,
  currentCourses,
  pastCourses,
  interests,
} from "../data/about";

function CourseChip({ course, current }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        border: `1px solid ${current ? palette.accent : palette.border}`,
        backgroundColor: current ? `${palette.accent}14` : palette.bg,
        fontSize: "0.875rem",
      }}
    >
      <Box component="span" sx={{ color: palette.text, fontWeight: 500 }}>
        {course.name}
      </Box>
      <Box
        component="span"
        sx={{ color: palette.muted, fontSize: "0.8125rem" }}
      >
        {course.code}
      </Box>
    </Box>
  );
}

export default function About() {
  return (
    <Section id="about" eyebrow="About" title="A bit about me">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
          gap: { xs: 5, md: 7 },
          alignItems: "start",
        }}
      >
        {/* Bio */}
        <Box>
          {bio.map((para) => (
            <Typography
              key={para.slice(0, 32)}
              variant="body1"
              sx={{ mb: 2.5, maxWidth: 620 }}
            >
              {para}
            </Typography>
          ))}

          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            Outside of code
          </Typography>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {interests.map((i) => (
              <Chip
                key={i}
                label={i}
                sx={{
                  backgroundColor: palette.surface,
                  border: `1px solid ${palette.border}`,
                  fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Education card */}
        <Box
          sx={{
            p: { xs: 3, md: 3.5 },
            borderRadius: 3,
            backgroundColor: palette.surface,
            border: `1px solid ${palette.border}`,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 2.5 }}
          >
            <Box
              component="img"
              src={education.logo}
              alt=""
              loading="lazy"
              sx={{ width: 44, height: 44, objectFit: "contain" }}
            />
            <Box>
              <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                {education.school}
              </Typography>
              <Typography variant="body2" sx={{ color: palette.muted }}>
                {education.location}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1.25} sx={{ mb: 3 }}>
            <Row label="Degree" value={education.degree} />
            <Row label="Graduating" value={education.graduation} />
            <Row label="GPA" value={education.gpa} />
            <Row label="Honors" value={education.honors} icon />
          </Stack>

          <Divider sx={{ borderColor: palette.border, mb: 2.5 }} />

          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: palette.accent,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1.5,
            }}
          >
            Currently taking — Fall 2026
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{ mb: 3 }}
          >
            {currentCourses.map((c) => (
              <CourseChip key={c.code} course={c} current />
            ))}
          </Stack>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: palette.muted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              mb: 1.5,
            }}
          >
            Completed
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            useFlexGap
            spacing={1}
            sx={{ maxHeight: 220, overflowY: "auto", pr: 1 }}
          >
            {pastCourses.map((c) => (
              <CourseChip key={c.code} course={c} />
            ))}
          </Stack>
        </Box>
      </Box>
    </Section>
  );
}

function Row({ label, value, icon }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Typography variant="body2" sx={{ color: palette.muted }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center">
        {icon && <SchoolIcon sx={{ fontSize: 15, color: palette.accent }} />}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, textAlign: "right" }}
        >
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}
