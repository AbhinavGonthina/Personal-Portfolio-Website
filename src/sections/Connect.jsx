import { Box, Typography, Stack } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import Section from "../components/Section";
import { palette } from "../theme";
import { socials } from "../data/profile";

const ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  email: EmailOutlinedIcon,
  resume: DescriptionOutlinedIcon,
};

export default function Connect() {
  return (
    <Section
      id="connect"
      eyebrow="Connect"
      title="Let's talk"
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: { xs: 2, md: 2.5 },
          maxWidth: 820,
        }}
      >
        {socials.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <Box
              key={s.name}
              component="a"
              href={s.href}
              target={s.icon === "email" ? undefined : "_blank"}
              rel="noopener noreferrer"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2.5,
                borderRadius: 3,
                textDecoration: "none",
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                transition: "all .22s ease",
                "&:hover": {
                  borderColor: palette.accent,
                  transform: "translateY(-2px)",
                  "& .go": { opacity: 1, transform: "translate(2px, -2px)" },
                },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  backgroundColor: palette.bg,
                  border: `1px solid ${palette.border}`,
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: 22, color: palette.accent }} />
              </Box>

              <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 600, color: palette.text }}>
                  {s.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: palette.muted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.value}
                </Typography>
              </Stack>

              <NorthEastIcon
                className="go"
                sx={{
                  fontSize: 18,
                  color: palette.accent,
                  opacity: 0,
                  transition: "all .22s ease",
                  flexShrink: 0,
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Section>
  );
}
