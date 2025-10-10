import { Typography, Box, Stack, IconButton, Button } from "@mui/material";
import { useRef, useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerCol = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function AboutSection() {
  const videoRef = useRef(null);
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
    // AboutSection.jsx - Update the main Box wrapper
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        px: { xs: 2, sm: 3, md: 0 },
        marginBottom: "2vh",
      }}
    >
      <motion.div
        style={{
          width: "80vw",
          maxWidth: "1400px",
          color: "white",
          backgroundColor: "#0f0113",
          border: "2px solid #00d4ff",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
        }}
        animate={{
          boxShadow: [
            "0 0 10px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.1)",
            "0 0 20px #00d4ff, inset 0 0 40px rgba(0, 212, 255, 0.2)",
            "0 0 10px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.1)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background:
              "linear-gradient(90deg, transparent, #00d4ff, #00d4ff, transparent)",
            boxShadow: "0 0 20px #00d4ff, 0 4px 30px rgba(0, 212, 255, 0.5)",
            borderRadius: "0 0 4px 4px",
            zIndex: 2,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/CircuitBoard.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            opacity: 0.1,
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 4, md: 6, lg: 8 },
            py: { xs: 4, md: 6, lg: 8 },
            px: { xs: 3, md: 4, lg: 6 },
          }}
        >
          <motion.div
            variants={staggerCol}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{ flex: 1, maxWidth: "600px" }}
          >
            <Stack spacing={{ xs: 3, md: 4 }}>
              <motion.div variants={fadeUp}>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: {
                      xs: "2rem",
                      sm: "2.5rem",
                      md: "3rem",
                      lg: "3.5rem",
                    },
                  }}
                >
                  Who Am I?
                </Typography>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Box sx={{ position: "relative", pl: { sm: 3 } }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      height: "100%",
                      width: "3px",
                      background: "#00d4ff",
                      boxShadow: "0 0 15px rgba(0, 212, 255, 0.5)",
                      display: { xs: "none", sm: "block" },
                    }}
                  />
                  <Stack spacing={2}>
                    <Typography
                      sx={{
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        lineHeight: 1.6,
                      }}
                    >
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
                      , and I'm a software developer who loves building
                      meaningful products through{" "}
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
                        p: 2,
                        border: "1px solid rgba(255,255,255,0.3)",
                        borderRadius: 1,
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                          lineHeight: 1.6,
                        }}
                      >
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
                  </Stack>
                </Box>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Stack spacing={2}>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                    }}
                  >
                    Education
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      border: "2px solid rgba(255,255,255,0.35)",
                      background: "rgba(255,255,255,0.04)",
                      boxShadow: "0 0 10px rgba(255,255,255,0.12) inset",
                      backdropFilter: "blur(10px)",
                      flexDirection: { xs: "column", sm: "row" },
                    }}
                  >
                    <Box
                      component="img"
                      src="../../NortheasternLogo.png"
                      alt="Northeastern University Logo"
                      sx={{
                        width: { xs: 60, md: 80 },
                        height: { xs: 60, md: 80 },
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, width: "100%" }}>
                      <Stack spacing={1}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: {
                                xs: "1.1rem",
                                sm: "1.25rem",
                                md: "1.4rem",
                              },
                              fontWeight: 700,
                            }}
                          >
                            Northeastern University
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.875rem", md: "0.95rem" },
                              opacity: 0.8,
                            }}
                          >
                            Expected: Aug 2027
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: { xs: "0.875rem", md: "1rem" },
                              opacity: 0.9,
                            }}
                          >
                            GPA: 4.0/4.0, Honors Program
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "rgba(35, 182, 47, 1)",
                              color: "#FFFFFF",
                              borderBottom: "2px solid white",
                              transition: "all 0.33s ease",
                              "&:hover": { backgroundColor: "#7240d8ff" },
                            }}
                          >
                            Classes
                          </Button>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Stack>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>Interests:</Typography>
                  {["Food", "YouTube", "Gym", "Puzzles"].map((chip) => (
                    <Box
                      key={chip}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.3)",
                        background: "rgba(255,255,255,0.06)",
                        fontSize: { xs: "0.875rem", md: "0.95rem" },
                        fontWeight: 600,
                        backdropFilter: "blur(5px)",
                      }}
                    >
                      {chip}
                    </Box>
                  ))}
                </Box>
              </motion.div>
            </Stack>
          </motion.div>

          <motion.div
            variants={staggerCol}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            <Stack spacing={2} alignItems="center">
              <motion.div variants={fadeUp}>
                <Typography
                  sx={{
                    fontWeight: "light",
                    fontSize: { xs: "1.25rem", md: "1.5rem", lg: "1.75rem" },
                    textAlign: "center",
                  }}
                >
                  A Short Introduction:
                </Typography>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Box
                  component="video"
                  ref={videoRef}
                  src="/videos/AbhinavGonthinaPortfolioVid.mp4"
                  onEnded={() => setIsPlaying(false)}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "350px",
                      md: "400px",
                      lg: "450px",
                    },
                    maxWidth: "90vw",
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
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                  <IconButton onClick={handleRestart} sx={{ color: "white" }}>
                    <ReplayIcon />
                  </IconButton>
                </Stack>
              </motion.div>
            </Stack>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
}
