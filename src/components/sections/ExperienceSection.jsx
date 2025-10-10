import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { motion } from "framer-motion";
import { WavyBackground } from "../ui/wavy-background";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

export default function ExperienceSection() {
  const [selectedExperience, setSelectedExperience] = useState("quak");

  const experienceData = {
    quak: {
      title: "Quak Travel",
      logo: "/QuakTravelLogo.png",
      description:
        "Quak Travel is a travel-based startup building a central hub for posting and finding trip itineraries. I contribute as a Software Engineer, turning Figma designs into a responsive frontend, architecting key endpoints, and leading database design. Earlier, I worked on building a website with hotel booking, payment splitting, and social media features before the company's rebrand.",
      techStack: [
        "React Native",
        "Express",
        "PostgreSQL",
        "Prisma",
        "TypeScript",
        "Expo",
      ],
      achievements: [
        "💵 Raised $30,000 from an earlier prototype",
        "📱 Learned mobile development for the first time",
      ],
    },
    rainfall: {
      title: "Rainfall Learning",
      logo: "/RainfallLearningLogo.png",
      description:
        "Rainfall Learning is a Northeastern student-led startup building an affordable, flexible e-learning platform for computer science. As Tech Lead for the Payments/Internal Tools team, I am integrating Stripe API to connect tutors with students. The platform is set to evolve into a B2B2C model, enabling businesses to create their own interactive curricula with our platform.",
      techStack: [
        "React",
        "Express",
        "PostgreSQL",
        "Prisma",
        "TypeScript",
        "Material UI",
      ],
      achievements: [
        "👥 Managing 3 sub-team members",
        "🔧 Reviewing tickets across 20+ developers/designers",
      ],
    },
    khoury: {
      title: "Khoury TA",
      logo: "/KhouryLogo.png",
      description:
        "I serve as a Teaching Assistant for the Discrete Structures (CS1800) course at Northeastern's Khoury College of Computer Sciences. In this role, I support a cohort of 500+ students by helping them master topics such as combinatorics, graph theory, algorithmic efficiency, logic, induction, and proofs. ",
      techStack: ["N/A"],
      achievements: [
        "👨‍🏫 Personally assisting 30+ students at recitations",
        "📃 Grading almost 100 assignments a week",
      ],
    },
    ner: {
      title: "NER",
      logo: "/NERLogo.png",
      description:
        "I contribute to Northeastern Electric Racing as a Software Developer, working on FinishLine—our team's internal project management platform. Currently, I'm developing a PDF parsing system that converts competition documents into an easily readable format. Previously, I contributed to a parts overview system with status tracking and notifications to improve ticket visibility.",
      techStack: [
        "React",
        "Express",
        "PostgreSQL",
        "Prisma",
        "TypeScript",
        "Material UI",
      ],
      achievements: [
        "🤖 Learned GitHub Workflow",
        "📊 Figured out structured backend development",
      ],
    },
  };

  const currentExperience = selectedExperience
    ? experienceData[selectedExperience]
    : null;

  return (
    <WavyBackground
      containerClassName="w-full h-auto overflow-x-hidden"
      className="w-full"
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "90vh",
          overflow: "hidden",
          gap: "4vh",
          marginBottom: "7.5vh",
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          style={{ width: "100%", maxWidth: "1400px" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: "3vw", sm: "2vw" },
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: { xs: "20vw", sm: "25vw", md: "30vw" },
                height: "3px",
                background: "linear-gradient(90deg, transparent, #00d4ff)",
                borderRadius: "2px",
                boxShadow: "0 0 10px #00d4ff66",
              }}
            />

            <Typography
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "8vw", sm: "6vw", md: "3.5vw" },
                whiteSpace: "nowrap",
              }}
            >
              Experience
            </Typography>

            <Box
              sx={{
                width: { xs: "20vw", sm: "25vw", md: "30vw" },
                height: "3px",
                background: "linear-gradient(90deg, #00d4ff, transparent)",
                borderRadius: "2px",
                boxShadow: "0 0 10px #00d4ff66",
              }}
            />
          </Box>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          style={{ width: "80vw", maxWidth: "1400px" }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: "4vw", md: "6vw", lg: "6vw" },
            }}
          >
            <motion.div variants={slideInLeft}>
              <Box
                sx={{
                  border: "2px solid rgba(34, 211, 238, 0.4)",
                  borderRadius: "15px",
                  width: { xs: "25vw", md: "24vw", lg: "22vw" },
                  maxWidth: "500px",
                  height: "50vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "stretch",
                  padding: 0,
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(34, 211, 238, 0.1)",
                  background: "rgba(15, 15, 25, 0.9)",
                  backdropFilter: "blur(20px)",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 32px rgba(34, 211, 238, 0.15)",
                    borderColor: "rgba(34, 211, 238, 0.6)",
                  },
                }}
              >
                {Object.keys(experienceData).map((key, index, arr) => (
                  <Box
                    key={key}
                    onClick={() => setSelectedExperience(key)}
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom:
                        index !== arr.length - 1
                          ? "1px solid rgba(34, 211, 238, 0.15)"
                          : "none",
                      padding: "0 2vw",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      background:
                        selectedExperience === key
                          ? "rgba(34, 211, 238, 0.05)"
                          : "transparent",
                      borderLeft:
                        selectedExperience === key
                          ? "3px solid #22d3ee"
                          : "3px solid transparent",
                      "&:hover": {
                        backgroundColor: "rgba(34, 211, 238, 0.03)",
                        cursor: "pointer",
                        paddingLeft: "2.5vw",
                        borderLeft: "3px solid #22d3ee",
                        "& .arrow": {
                          transform: "translateX(8px)",
                          color: "#22d3ee",
                        },
                        "& .text": {
                          color: "#22d3ee",
                        },
                      },
                    }}
                  >
                    <Typography
                      className="text"
                      sx={{
                        fontWeight: "500",
                        fontSize: { xs: "1.8vw", md: "1.6vw", lg: "1.4vw" },
                        color:
                          selectedExperience === key
                            ? "#22d3ee"
                            : "rgba(255, 255, 255, 0.9)",
                        transition: "color 0.3s ease",
                        letterSpacing: "0.8px",
                        fontFamily: "'Inter', 'Segoe UI', sans-serif",
                      }}
                    >
                      {experienceData[key].title}
                    </Typography>
                    <Typography
                      className="arrow"
                      sx={{
                        fontSize: { xs: "1.4vw", md: "1.2vw", lg: "1vw" },
                        color:
                          selectedExperience === key
                            ? "#22d3ee"
                            : "rgba(34, 211, 238, 0.5)",
                        transition: "all 0.3s ease",
                        fontWeight: "300",
                        transform:
                          selectedExperience === key
                            ? "translateX(8px)"
                            : "none",
                      }}
                    >
                      ▶
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>

            <motion.div variants={slideInRight}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(20, 20, 35, 0.95) 100%)",
                  width: { xs: "40vw", md: "43vw", lg: "46vw" },
                  maxWidth: "1000px",
                  height: "70vh",
                  borderRadius: "20px",
                  border: "1px solid rgba(34, 211, 238, 0.2)",
                  padding: "2vw",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2vh",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent)",
                  },
                }}
              >
                {!currentExperience ? (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "2vh",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "rgba(34, 211, 238, 0.3)",
                        fontSize: { xs: "2.5vw", md: "2vw", lg: "1.8vw" },
                        fontWeight: "300",
                        marginBottom: "1vh",
                      }}
                    >
                      ←
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        fontSize: { xs: "1.1vw", md: "1vw", lg: "0.9vw" },
                        fontWeight: "400",
                        textAlign: "center",
                        maxWidth: "80%",
                        lineHeight: "1.6",
                      }}
                    >
                      Select an experience to view details
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(34, 211, 238, 0.4)",
                        fontSize: { xs: "0.8vw", md: "0.7vw", lg: "0.65vw" },
                        marginTop: "1vh",
                        fontStyle: "italic",
                      }}
                    >
                      Click any option to explore my professional journey
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        width: "100%",
                        height: "25%",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "2px solid rgba(34, 211, 238, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(34, 211, 238, 0.05)",
                        position: "relative",
                        boxShadow:
                          "0 0 20px rgba(34, 211, 238, 0.2), inset 0 0 20px rgba(34, 211, 238, 0.1)",
                      }}
                    >
                      <Box
                        component="img"
                        src={currentExperience.logo}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        alt={`${currentExperience.title} Logo`}
                      />
                    </Box>

                    <Box
                      sx={{
                        flex: "0 0 auto",
                        padding: "1.5vh 0",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#22d3ee",
                          fontSize: { xs: "1.5vw", md: "1.4vw", lg: "1.3vw" },
                          fontWeight: "600",
                          marginBottom: "1vh",
                          letterSpacing: "1px",
                        }}
                      >
                        {currentExperience.title}
                      </Typography>
                      <Typography
                        sx={{
                          color: "rgba(255, 255, 255, 0.7)",
                          fontSize: { xs: "0.9vw", md: "0.85vw", lg: "0.8vw" },
                          lineHeight: "1.6",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {currentExperience.description}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        gap: "1.5vw",
                        marginTop: "auto",
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          background: "rgba(34, 211, 238, 0.03)",
                          borderRadius: "10px",
                          padding: "1.5vh 1.2vw",
                          border: "1px solid rgba(34, 211, 238, 0.1)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "rgba(34, 211, 238, 0.8)",
                            fontSize: {
                              xs: "0.95vw",
                              md: "0.9vw",
                              lg: "0.85vw",
                            },
                            fontWeight: "500",
                            marginBottom: "1.5vh",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                          }}
                        >
                          Tech Stack
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.4vw",
                          }}
                        >
                          {currentExperience.techStack.map((tech) => (
                            <Box
                              key={tech}
                              sx={{
                                padding: "0.3vh 0.6vw",
                                background: "rgba(34, 211, 238, 0.1)",
                                border: "1px solid rgba(34, 211, 238, 0.2)",
                                borderRadius: "5px",
                                color: "rgba(255, 255, 255, 0.8)",
                                fontSize: {
                                  xs: "0.8vw",
                                  md: "0.75vw",
                                  lg: "0.7vw",
                                },
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  background: "rgba(34, 211, 238, 0.2)",
                                  borderColor: "rgba(34, 211, 238, 0.4)",
                                  transform: "translateY(-2px)",
                                },
                              }}
                            >
                              {tech}
                            </Box>
                          ))}
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          background: "rgba(168, 85, 247, 0.03)",
                          borderRadius: "10px",
                          padding: "1.5vh 1.2vw",
                          border: "1px solid rgba(168, 85, 247, 0.15)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "rgba(168, 85, 247, 0.9)",
                            fontSize: {
                              xs: "0.95vw",
                              md: "0.9vw",
                              lg: "0.85vw",
                            },
                            fontWeight: "500",
                            marginBottom: "1.5vh",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                          }}
                        >
                          Achievements
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.8vh",
                          }}
                        >
                          {currentExperience.achievements.map(
                            (achievement, index) => (
                              <Typography
                                key={index}
                                sx={{
                                  color: "rgba(255, 255, 255, 0.7)",
                                  fontSize: {
                                    xs: "0.8vw",
                                    md: "0.75vw",
                                    lg: "0.7vw",
                                  },
                                  lineHeight: "1.4",
                                  paddingLeft: "0.4vw",
                                  borderLeft:
                                    "2px solid rgba(168, 85, 247, 0.3)",
                                }}
                              >
                                {achievement}
                              </Typography>
                            )
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </WavyBackground>
  );
}
