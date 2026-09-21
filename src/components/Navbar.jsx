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
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { palette } from "../theme";
import { NAV_ITEMS } from "../data/nav";
import { socials } from "../data/profile";

const SOCIAL_ICONS = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  resume: DescriptionOutlinedIcon,
};

// Email lives in the "Get in touch" CTA, so it's omitted here.
const NAV_SOCIALS = socials.filter((s) => s.icon in SOCIAL_ICONS);

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
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const go = (id) => {
    setOpen(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: scrolled
            ? "rgba(251, 248, 243, 0.85)"
            : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
          // Always visible, not just once scrolled.
          borderBottom: `1px solid ${palette.border}`,
          transition: "background-color .25s ease",
        }}
      >
        <Container maxWidth="lg">
          {/* Three-column grid keeps the links optically centred regardless of
              how wide the logo and action cluster are. */}
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 64, md: 76 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "1fr auto 1fr" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              component="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Abhinav Gonthina — back to top"
              sx={{
                border: 0,
                background: "none",
                p: 0,
                cursor: "pointer",
                display: "inline-flex",
                lineHeight: 0,
                "&:focus-visible": {
                  outline: `2px solid ${palette.accent}`,
                  outlineOffset: 3,
                },
              }}
            >
              <Box
                component="img"
                src="/favicon.png"
                alt=""
                width={40}
                height={40}
                sx={{
                  // The PNG already carries its own rounded-square corners —
                  // adding a CSS radius on top of them made it look circular.
                  width: { xs: 34, md: 40 },
                  height: { xs: 34, md: 40 },
                  display: "block",
                }}
              />
            </Box>

            {/* Centre: section links, each with an underline that grows on hover */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.5,
                justifySelf: "center",
              }}
            >
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.id;
                return (
                  <Button
                    key={item.id}
                    onClick={() => go(item.id)}
                    disableRipple
                    sx={{
                      position: "relative",
                      color: isActive ? palette.text : palette.muted,
                      fontWeight: isActive ? 600 : 500,
                      px: 1.75,
                      "&:hover": {
                        backgroundColor: "transparent",
                        color: palette.text,
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: 14,
                        right: 14,
                        bottom: 4,
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: palette.accent,
                        transformOrigin: "center",
                        transform: `scaleX(${isActive ? 1 : 0})`,
                        transition: "transform .25s cubic-bezier(.22,1,.36,1)",
                      },
                      "&:hover::after": { transform: "scaleX(1)" },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Right: socials + CTA, so the bar isn't lopsided */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 0.5,
                justifySelf: "end",
              }}
            >
              {NAV_SOCIALS.map((s) => {
                const Icon = SOCIAL_ICONS[s.icon];
                return (
                  <IconButton
                    key={s.name}
                    href={s.href}
                    target={s.icon === "email" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    size="small"
                    sx={{
                      color: palette.muted,
                      transition: "color .2s ease, transform .2s ease",
                      "&:hover": { color: palette.accentDark, transform: "translateY(-1px)" },
                    }}
                  >
                    <Icon sx={{ fontSize: 20 }} />
                  </IconButton>
                );
              })}
              <Box
                aria-hidden
                sx={{ width: "1px", height: 20, backgroundColor: palette.border, mx: 1 }}
              />
              <Button variant="contained" color="primary" onClick={() => go("connect")}>
                Get in touch
              </Button>
            </Box>

            <IconButton
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                display: { xs: "inline-flex", md: "none" },
                justifySelf: "end",
                color: palette.text,
              }}
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
        slotProps={{
          paper: { sx: { width: 280, backgroundColor: palette.bg } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
          }}
        >
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600 }}>
            Menu
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
          >
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
            <ListItemText
              primary="Get in touch"
              sx={{ color: palette.accent }}
            />
          </ListItemButton>
        </List>

        <Box sx={{ display: "flex", gap: 1, px: 2, pt: 1 }}>
          {NAV_SOCIALS.map((s) => {
            const Icon = SOCIAL_ICONS[s.icon];
            return (
              <IconButton
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                size="small"
                sx={{ color: palette.muted }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </IconButton>
            );
          })}
        </Box>
      </Drawer>
    </>
  );
}
