import { Box, Typography, Stack } from "@mui/material";
import { motion } from "motion/react";
import Section from "../components/Section";
import { palette } from "../theme";
import { skillGroups } from "../data/skills";

export default function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="What I work with"
      intro="Grouped by how I actually use them day to day."
      tinted
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" },
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {skillGroups.map((group, gi) => (
          <Box
            key={group.id}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: gi * 0.08, ease: [0.22, 1, 0.36, 1] }}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: palette.bg,
              border: `1px solid ${palette.border}`,
              height: "100%",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: palette.accent,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mb: 2,
              }}
            >
              {group.label}
            </Typography>

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
              {group.items.map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1.5,
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: palette.text,
                    backgroundColor: palette.surfaceAlt,
                    border: `1px solid ${palette.border}`,
                    transition: "all .18s ease",
                    "&:hover": {
                      borderColor: palette.accent,
                      color: palette.accentDark,
                    },
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Section>
  );
}
