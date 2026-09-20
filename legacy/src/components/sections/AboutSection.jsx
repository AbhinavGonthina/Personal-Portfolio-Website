import {
  Typography,
  Box,
  Stack,
  IconButton,
  Button,
  Collapse,
  Tooltip,
} from "@mui/material";
import { useRef, useState, memo, useCallback } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { motion, AnimatePresence } from "framer-motion";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// Framer Motion Animations
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const staggerCol = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

// Current Courses
const currentClasses = [{ name: "I'm on Co-op!", code: "" }];

// Past Courses
const pastClasses = [
  { name: "Algorithms & Data", code: "CS3000" },
  { name: "Object Oriented Design", code: "CS3500" },
  { name: "Cloud Computing", code: "CS4973" },
  { name: "Introduction to Databases", code: "CS3200" },
  { name: "Computer Systems", code: "CS3650" },
  { name: "Foundations of Cybersecurity", code: "CY2550" },
  { name: "Foundations of Data Science", code: "DS3000" },
  { name: "Logic and Computation", code: "CS2800" },
  { name: "Discrete Structures", code: "CS1800" },
  { name: "Fundamentals of Computer Science 2", code: "CS2510" },
  { name: "Fundamentals of Computer Science 1", code: "CS2500" },
  { name: "Intro to Mathematical Reasoning", code: "MATH1365" },
];

// Current Interests (sorry I'm not the most interesting 😭)
const interests = ["Foodie", "LeetCode", "YouTube", "Gym", "Puzzles"];

// Memoized course chip component (so we dont re-render all the courses every time)
const CourseChip = memo(({ course, isCurrent }) => (
  <Box
    sx={{
      px: { xs: 1.5, sm: 2 },
      py: { xs: 0.75, sm: 1 },
      borderRadius: 1,
      border: isCurrent
        ? "1px solid #00d4ff"
        : "1px solid rgba(255,255,255,0.3)",
      background: isCurrent
        ? "rgba(0, 212, 255, 0.1)"
        : "rgba(255,255,255,0.05)",
      fontSize: {
        xs: "0.75rem",
        sm: "0.85rem",
        md: "0.9rem",
      },
      fontWeight: 500,
      display: "flex",
      flexDirection: { xs: "column", sm: "row" },
      alignItems: "center",
      gap: { xs: 0.25, sm: 0.5 },
      textAlign: "center",
      opacity: isCurrent ? 1 : 0.9,
    }}
  >
    <span>{course.name}</span>
    <span style={{ opacity: 0.7, fontSize: "0.85em" }}>{course.code}</span>
  </Box>
));

CourseChip.displayName = "CourseChip";

// Memoized interest chip component (doesn't really need to be memoized but why not)
const InterestChip = memo(({ chip }) => (
  <Box
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
));

InterestChip.displayName = "InterestChip";

function AboutSection() {
  // State and refs for video and classes toggling
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showClasses, setShowClasses] = useState(false);

  // Video control handlers
  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  // Toggle Class handler
  const toggleClasses = useCallback(() => {
    setShowClasses((prev) => !prev);
  }, []);

  const handleVideoEnd = useCallback(() => {
    setIsPlaying(false);
  }, []);

  return (
    <Box
      id="about-section"
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        marginBottom: { xs: "5vh", sm: "5vh", md: "2vh" },
      }}
    >
      {/* Main container with glow effect */}
      <Box
        sx={{
          height: "100%",
          width: "80vw",
          maxWidth: "1400px",
          color: "white",
          backgroundColor: "#0f0113",
          border: "2px solid #00d4ff",
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          animation: "glow 2s infinite ease-in-out",
          "@keyframes glow": {
            "0%, 100%": {
              boxShadow:
                "0 0 10px #00d4ff, inset 0 0 20px rgba(0, 212, 255, 0.1)",
            },
            "50%": {
              boxShadow:
                "0 0 20px #00d4ff, inset 0 0 40px rgba(0, 212, 255, 0.2)",
            },
          },
        }}
      >
        {/* Thicker Top Border */}
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

        {/* Background Circuit Pattern */}
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

        {/* Content */}
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
          {/* Left Side - Personal information */}
          <motion.div
            variants={staggerCol}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{ flex: 1, maxWidth: "600px" }}
          >
            <Stack spacing={{ xs: 3, md: 4 }}>
              {/* Section heading */}
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

              {/* Introduction Text */}
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
                        I'm currently seeking future{" "}
                        <Box component="span" sx={{ fontWeight: "bold" }}>
                          software engineering
                        </Box>{" "}
                        positions, including{" "}
                        <Box component="span" sx={{ fontWeight: "bold" }}>
                          entry-level roles after Spring 2027
                        </Box>{" "}
                        or{" "}
                        <Box component="span" sx={{ fontWeight: "bold" }}>
                          co-op roles during Spring 2027
                        </Box>
                        .
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </motion.div>

              {/* Education section */}
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
                      flexDirection: "column",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      border: "2px solid rgba(255,255,255,0.35)",
                      background: "rgba(255,255,255,0.04)",
                      boxShadow: "0 0 10px rgba(255,255,255,0.12) inset",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* University information */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
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
                              alignItems: { xs: "center", sm: "center" },
                              justifyContent: {
                                xs: "center",
                                sm: "space-between",
                              },
                              flexDirection: { xs: "column", sm: "row" },
                              gap: 1,
                              textAlign: { xs: "center", sm: "left" },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: "1.1rem",
                                  sm: "1.1rem",
                                  md: "1.1rem",
                                },
                                fontWeight: 700,
                              }}
                            >
                              Northeastern University
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.8rem",
                                opacity: 0.8,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              Expected: Apr 2027
                              <Tooltip
                                title={
                                  <>
                                    If I receive a full-time offer during{" "}
                                    <b>Fall 2026</b>, I will graduate in{" "}
                                    <b>Spring 2027</b>. Otherwise, I will
                                    complete a <b>Spring 2027</b> co-op and
                                    graduate in <b>Fall 2027</b>.
                                  </>
                                }
                                arrow
                                placement="top"
                              >
                                <HelpOutlineIcon
                                  sx={{
                                    fontSize: 14,
                                    cursor: "help",
                                    verticalAlign: "middle",
                                  }}
                                />
                              </Tooltip>
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: { xs: "center", sm: "center" },
                              justifyContent: {
                                xs: "center",
                                sm: "space-between",
                              },
                              flexDirection: { xs: "column", sm: "row" },
                              gap: 1,
                              textAlign: { xs: "center", sm: "left" },
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
                              onClick={toggleClasses}
                              endIcon={
                                showClasses ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )
                              }
                              sx={{
                                backgroundColor: "#ab60ecff",
                                color: "#FFFFFF",
                                borderBottom: "2px solid white",
                                fontWeight: "bold",
                                transition: "all 0.3s ease",
                                "&:hover": { backgroundColor: "#C77DFF" },
                              }}
                            >
                              Classes
                            </Button>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>

                    {/* Expandable Classes section */}
                    {showClasses && (
                      <Box
                        sx={{
                          pt: 2,
                          borderTop: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <Stack spacing={3}>
                          {/* Current courses */}
                          <Box>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.9rem", md: "1rem" },
                                fontWeight: 600,
                                mb: 1.5,
                                color: "#00d4ff",
                                textAlign: { xs: "center", sm: "left" },
                              }}
                            >
                              Currently Taking
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                justifyContent: {
                                  xs: "center",
                                  sm: "flex-start",
                                },
                              }}
                            >
                              {currentClasses.map((course) => (
                                <CourseChip
                                  key={course.code}
                                  course={course}
                                  isCurrent={true}
                                />
                              ))}
                            </Box>
                          </Box>

                          {/* Completed courses - No stagger, just simple display */}
                          <Box>
                            <Typography
                              sx={{
                                fontSize: { xs: "0.9rem", md: "1rem" },
                                fontWeight: 600,
                                mb: 1.5,
                                color: "rgba(255,255,255,0.9)",
                                textAlign: { xs: "center", sm: "left" },
                              }}
                            >
                              Completed Courses
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                justifyContent: {
                                  xs: "center",
                                  sm: "flex-start",
                                },
                              }}
                            >
                              {pastClasses.map((course) => (
                                <CourseChip
                                  key={course.code}
                                  course={course}
                                  isCurrent={false}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </motion.div>

              {/* Interests section */}
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
                  {interests.map((chip) => (
                    <InterestChip key={chip} chip={chip} />
                  ))}
                </Box>
              </motion.div>
            </Stack>
          </motion.div>

          {/* Right column - Video Intro */}
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

              {/* Video Player */}
              <motion.div variants={fadeUp}>
                <Box
                  component="video"
                  ref={videoRef}
                  src="/videos/AbhinavGonthinaPortfolioVid.mp4"
                  preload="metadata"
                  poster="/IntroVideoThumbnail.png"
                  onEnded={handleVideoEnd}
                  sx={{
                    width: {
                      xs: "200px",
                      sm: "350px",
                      md: "400px",
                      lg: "425px",
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

              {/* Video Controls */}
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
      </Box>
    </Box>
  );
}

export default memo(AboutSection);
