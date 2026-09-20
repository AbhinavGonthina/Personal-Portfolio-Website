import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function Navbar() {
  // State setup for mobile navbar (computer better 😭)
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Scroll animation to each section on the website
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    const offset = 80;
    const y = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Scroll to the top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMobileNavClick = (sectionId) => {
    const DRAWER_CLOSE_MS = 300;
    setMobileOpen(false);
    setTimeout(() => {
      scrollToSection(sectionId);
    }, DRAWER_CLOSE_MS);
  };

  // Link to open resume in a new tab
  const openResume = () => {
    window.open(
      "https://drive.google.com/file/d/1mmaNnu9ERCRxq-6wIewLTS-31G37Ce_p/view?usp=sharing",
      "_blank"
    );
  };

  // Navbar Sections
  const navItems = [
    { label: "About", sectionId: "about-section" },
    { label: "Skills", sectionId: "skills-section" },
    { label: "Experience", sectionId: "experience-section" },
    { label: "Projects", sectionId: "projects-section" },
  ];

  // Mobile Navbar Drawer Component Thing
  const drawer = (
    <Box
      sx={{
        width: 250,
        backgroundColor: "black",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Drawer header with close button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #042027ff",
        }}
      >
        <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
          Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation list items */}
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleMobileNavClick(item.sectionId)}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(30,144,255,0.1)",
                  color: "#1E90FF",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: "bold" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom buttons in drawer */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={openResume}
          sx={{
            backgroundColor: "#5E35B1",
            color: "#FFFFFF",
            borderBottom: "2px solid white",
            transition: "all 0.33s ease",
            "&:hover": {
              backgroundColor: "#7240d8ff",
            },
          }}
        >
          <Typography sx={{ fontSize: "100%", fontWeight: "bold" }}>
            Resume
          </Typography>
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => handleMobileNavClick("connect-section")}
          sx={{
            backgroundColor: "#AF3488FF",
            color: "#FFFFFF",
            borderBottom: "2px solid white",
            transition: "all 0.33s ease",
            "&:hover": {
              backgroundColor: "#DB41AAFF",
            },
          }}
        >
          <Typography sx={{ fontSize: "100%", fontWeight: "bold" }}>
            Connect
          </Typography>
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Main navigation bar */}
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "black",
          paddingLeft: { xs: "2vh", sm: "5vh", md: "10vh" },
          paddingRight: { xs: "2vh", sm: "5vh", md: "10vh" },
          height: { xs: "8vh", md: "10vh" },
          borderBottom: "1px solid #042027ff",
          boxShadow: "0 1px 12px rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            minHeight: { xs: "8vh", md: "10vh" },
            padding: "0 !important",
          }}
        >
          {/* Logo which redirects to top of the screen */}
          <Box
            component="img"
            src="../../AbhinavGonthinaLogo.png"
            alt="Abhinav Gonthina Logo"
            onClick={scrollToTop}
            sx={{
              height: { xs: "4vh", sm: "4.5vh", md: "5.5vh" },
              cursor: "pointer",
            }}
          />

          {/* Desktop navigation */}
          {!isMobile && (
            <>
              {/* Navigation links */}
              <Box sx={{ display: "flex", gap: { md: 8, lg: 15 } }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => scrollToSection(item.sectionId)}
                    sx={{ color: "white" }}
                    disableTouchRipple
                  >
                    <Typography
                      sx={{
                        fontSize: { md: "90%", lg: "100%" },
                        fontWeight: "bold",
                        cursor: "pointer",
                        position: "relative",
                        transition: "color 0.33s ease",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          width: "0%",
                          height: "0.5px",
                          backgroundColor: "#1E90FF",
                          transition: "width 0.33s ease",
                        },
                        "&:hover": {
                          color: "#1E90FF",
                        },
                        "&:hover::after": {
                          width: "100%",
                        },
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Button>
                ))}
              </Box>

              {/* Connect and Resume Buttons */}
              <Box sx={{ display: "flex", gap: { md: 3, lg: 5 } }}>
                <Button
                  variant="contained"
                  onClick={openResume}
                  sx={{
                    backgroundColor: "#5E35B1",
                    color: "#FFFFFF",
                    borderBottom: "2px solid white",
                    transition: "all 0.33s ease",
                    "&:hover": {
                      backgroundColor: "#7240d8ff",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { md: "90%", lg: "100%" },
                      fontWeight: "bold",
                    }}
                  >
                    Resume
                  </Typography>
                </Button>
                <Button
                  variant="contained"
                  onClick={() => scrollToSection("connect-section")}
                  sx={{
                    backgroundColor: "#AF3488FF",
                    color: "#FFFFFF",
                    borderBottom: "2px solid white",
                    transition: "all 0.33s ease",
                    "&:hover": { backgroundColor: "#DB41AAFF" },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { md: "90%", lg: "100%" },
                      fontWeight: "bold",
                    }}
                  >
                    Connect
                  </Typography>
                </Button>
              </Box>
            </>
          )}

          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{ color: "white" }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            backgroundColor: "black",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
