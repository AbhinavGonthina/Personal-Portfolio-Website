import { Typography, Box, Stack, IconButton, Button } from "@mui/material";
import { useRef, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerCol = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AboutSection() {
  const videoRef = (useRef < HTMLVideoElement) | (null > null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "90vh",
        color: "white",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "10vw",
      }}
    >
      <motion.div
        variants={staggerCol}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        style={{ display: "flex", flexDirection: "column", gap: "5vh" }}
      >
        <motion.div variants={fadeUp}>
          <Typography sx={{ fontWeight: "bold", fontSize: "4vw" }}>
            Who Am I?
          </Typography>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: "-20px",
                top: "0",
                height: "100%",
                width: "3px",
                background: "#00d4ff",
                boxShadow: "0 0 15px rgba(0, 212, 255, 0.5)",
              }}
            />
            <Typography sx={{ maxWidth: "40vw", fontSize: "1.5vw" }}>
              My name is{" "}
              <Box
                component="span"
                sx={{
                  fontWeight: 700,
                  background:
                    "linear-gradient(135deg, #00d4ff 0%, #7240d8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Abhinav Gonthina
              </Box>
              , and I'm a software developer who loves building meaningful
              products through{" "}
              <Box component="span" sx={{ fontStyle: "italic" }}>
                elegant designs
              </Box>{" "}
              and{" "}
              <Box component="span" sx={{ fontWeight: "bold" }}>
                powerful APIs
              </Box>
              .
            </Typography>
            <Box
              sx={{
                maxWidth: "40vw",
                p: 2,
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 1,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <Typography sx={{ fontSize: "1.5vw" }}>
                I'm currently looking for a{" "}
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  full-time software engineering co-op/internship
                </Box>{" "}
                role for{" "}
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  Spring/Summer 2026
                </Box>
                .
              </Typography>
            </Box>
          </Box>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Box>
            <Typography sx={{ fontWeight: "bold", mb: 1, fontSize: 20 }}>
              Education
            </Typography>
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 2,
                width: "45vw",
                minHeight: "10vh",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                border: "2px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.04)",
                boxShadow: "0 0 10px rgba(255,255,255,0.12) inset",
              }}
            >
              <Box
                component="img"
                src="../../NortheasternLogo.png"
                alt="Northeastern University Logo"
                sx={{ width: "4vw", height: "4vw" }}
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontSize: "1.6vw", fontWeight: 700 }}>
                    Northeastern University
                  </Typography>
                  <Typography sx={{ fontSize: "0.9vw", opacity: 0.8 }}>
                    Expected Graduation: Aug 2027
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "1.1vw", opacity: 0.9 }}>
                    GPA: 4.0/4.0, John Martinson Honors Program
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "rgba(35, 182, 47, 1)",
                      color: "#FFFFFF",
                      borderBottom: "2px solid white",
                      width: "10vw",
                      transition: "all 0.33s ease",
                      "&:hover": { backgroundColor: "#7240d8ff" },
                    }}
                  >
                    <Typography sx={{ fontSize: "1vw", fontWeight: "bold" }}>
                      Classes
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Typography sx={{ fontWeight: 700 }}>Interests:</Typography>
            {["Food", "YouTube", "Gym", "Puzzles"].map((chip) => (
              <Box
                key={chip}
                sx={{
                  px: 1.2,
                  py: 0.6,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.3)",
                  background: "rgba(255,255,255,0.06)",
                  fontSize: "0.95vw",
                  fontWeight: 600,
                }}
              >
                {chip}
              </Box>
            ))}
          </Box>
        </motion.div>
      </motion.div>
      <motion.div
        variants={staggerCol}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        style={{ display: "flex" }}
      >
        <Stack spacing={"2vh"} alignItems="center">
          <motion.div variants={fadeUp}>
            <Typography sx={{ fontWeight: "light", fontSize: "2vw" }}>
              A Short Introduction:
            </Typography>
          </motion.div>
          <motion.div variants={fadeUp} style={{ width: "100%" }}>
            <Box
              component="video"
              ref={videoRef}
              src="/videos/PlaceHolder.mp4"
              poster="/Placeholder.png"
              onEnded={() => setIsPlaying(false)}
              sx={{
                width: "30vw",
                height: "auto",
                borderRadius: 2,
                border: "2px solid white",
                boxShadow: "0 0 8px rgba(255,255,255,0.4)",
                objectFit: "cover",
              }}
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <Stack direction="row" spacing={2}>
              <IconButton onClick={handlePlayPause} sx={{ color: "white" }}>
                {isPlaying ? (
                  <PauseIcon fontSize="large" />
                ) : (
                  <PlayArrowIcon fontSize="large" />
                )}
              </IconButton>
              <IconButton onClick={handleRestart} sx={{ color: "white" }}>
                <ReplayIcon fontSize="large" />
              </IconButton>
            </Stack>
          </motion.div>
        </Stack>
      </motion.div>
    </Box>
  );
}
