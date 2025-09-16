import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

function Navbar() {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "black",
        paddingLeft: "10vh",
        paddingRight: "10vh",
        borderBottom: "1px solid #042027ff",
        boxShadow: "0 1px 12px rgba(255, 255, 255, 0.1)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
        }}
      >
        {/* Add an on click here later to go to the top of the page */}
        <Box
          component="img"
          src="../../AbhinavGonthinaLogo.png"
          alt="Abhinav Gonthina Logo"
          sx={{
            height: "5.5vh",
            cursor: "pointer",
          }}
        />
        <Box sx={{ display: "flex", gap: 15 }}>
          <Button sx={{ color: "white", cursor: "default" }} disableTouchRipple>
            <Typography
              sx={{
                fontSize: "100%",
                fontWeight: "bold",
                cursor: "pointer",
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
              About
            </Typography>
          </Button>
          <Button sx={{ color: "white" }} disableTouchRipple>
            <Typography
              sx={{
                fontSize: "100%",
                fontWeight: "bold",
                cursor: "pointer",
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
              Skills
            </Typography>
          </Button>
          <Button sx={{ color: "white" }} disableTouchRipple>
            <Typography
              sx={{
                fontSize: "100%",
                fontWeight: "bold",
                cursor: "pointer",
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
              Experience
            </Typography>
          </Button>
          <Button sx={{ color: "white" }} disableTouchRipple>
            <Typography
              sx={{
                fontSize: "100%",
                fontWeight: "bold",
                cursor: "pointer",
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
              Projects
            </Typography>
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 5 }}>
          <Button
            variant="contained"
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
                fontSize: "100%",
                fontWeight: "bold",
              }}
            >
              Resume
            </Typography>
          </Button>
          <Button
            variant="contained"
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
            <Typography
              sx={{
                fontSize: "100%",
                fontWeight: "bold",
              }}
            >
              Connect
            </Typography>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
