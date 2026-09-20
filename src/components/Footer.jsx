import { Box, Container, Typography, Link, Stack } from "@mui/material";
import { palette } from "../theme";
import { socials } from "../data/profile";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: `1px solid ${palette.border}`, py: 5, mt: 4 }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Typography variant="body2" sx={{ color: palette.muted }}>
            © {new Date().getFullYear()} Abhinav Gonthina — built with React and MUI.
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
                sx={{ color: palette.muted, "&:hover": { color: palette.accent } }}
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
