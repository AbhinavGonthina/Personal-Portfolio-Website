import { Box, Container, Typography, Link, Stack } from "@mui/material";
import { palette, PAGE_MAX } from "../theme";
import { RULE } from "./Section";
import { socials } from "../data/profile";

export default function Footer() {
  return (
    <Box
      component="footer"
      // Same hairline as the dividers between sections.
      sx={{ borderTop: `1px solid ${RULE}`, py: 5, mt: 4 }}
    >
      <Container maxWidth={false} sx={{ maxWidth: PAGE_MAX, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Typography variant="body2" sx={{ color: palette.muted }}>
            © {new Date().getFullYear()} Abhinav Gonthina — built with React
            and MUI.
          </Typography>

          <Stack direction="row" spacing={3}>
            {socials.map((s) => (
              <Link
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                variant="body2"
                sx={{
                  color: palette.muted,
                  "&:hover": { color: palette.accent },
                }}
              >
                {s.name}
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
