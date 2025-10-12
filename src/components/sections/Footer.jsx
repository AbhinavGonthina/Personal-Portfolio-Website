import { Box, Typography, IconButton, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";

export default function Footer() {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        py: 2,
        px: { xs: 2, sm: 6 },
        mt: 8,
      }}
    >
      {/* Left Side - Copyright text (I see this in other personal portfolio) */}
      <Typography
        sx={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "0.9rem",
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        © {new Date().getFullYear()} Abhinav Gonthina. All rights reserved.
      </Typography>
      {/* Right Side - Social Links */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <IconButton
          component={Link}
          href="https://github.com/AbhinavGonthina"
          target="_blank"
          rel="noopener"
          sx={{ color: "#22d3ee" }}
        >
          <GitHubIcon />
        </IconButton>
        <IconButton
          component={Link}
          href="https://linkedin.com/in/abhinavgonthina"
          target="_blank"
          rel="noopener"
          sx={{ color: "#22d3ee" }}
        >
          <LinkedInIcon />
        </IconButton>
        <IconButton
          component={Link}
          href="mailto:gonthina.a@northeastern.edu"
          sx={{ color: "#22d3ee" }}
        >
          <EmailIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
