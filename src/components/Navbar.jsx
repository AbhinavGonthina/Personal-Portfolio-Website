import { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { palette } from "../theme";
import { NAV_ITEMS } from "../data/nav";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight whichever section is currently in view.
  useEffect(() => {
    const ids = [...NAV_ITEMS.map((i) => i.id), "connect"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: scrolled ? "rgba(251, 248, 243, 0.85)" : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
          borderBottom: `1px solid ${scrolled ? palette.border : "transparent"}`,
          transition: "background-color .25s ease, border-color .25s ease",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
            <Box
              component="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              sx={{
                border: 0,
                background: "none",
                p: 0,
                cursor: "pointer",
                fontFamily: '"Fraunces", Georgia, serif',
                fontSize: "1.125rem",
                fontWeight: 600,
                color: palette.text,
                letterSpacing: "-0.01em",
              }}
            >
              Abhinav Gonthina
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.5 }}>
              {NAV_ITEMS.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => go(item.id)}
                  disableRipple
                  sx={{
                    color: active === item.id ? palette.text : palette.muted,
                    fontWeight: active === item.id ? 600 : 500,
                    px: 1.75,
                    "&:hover": { backgroundColor: "transparent", color: palette.text },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="contained"
                color="primary"
                onClick={() => go("connect")}
                sx={{ ml: 1.5 }}
              >
                Get in touch
              </Button>
            </Box>

            <IconButton
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              sx={{ display: { xs: "inline-flex", md: "none" }, color: palette.text }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 280, backgroundColor: palette.bg } } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600 }}>Menu</Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="Close navigation menu">
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItemButton key={item.id} onClick={() => go(item.id)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          <ListItemButton onClick={() => go("connect")}>
            <ListItemText primary="Get in touch" sx={{ color: palette.accent }} />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
}
