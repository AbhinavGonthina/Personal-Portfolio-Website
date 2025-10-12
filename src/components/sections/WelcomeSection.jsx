import { Typography, Box } from "@mui/material";
import Particles from "../react-bits-components/Particles";
import { Fade, Zoom, Bounce } from "react-awesome-reveal";
import { motion } from "motion/react";

export default function WelcomeSection() {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: { xs: "80vh", sm: "90vh" },
        overflow: "hidden",
      }}
    >
      {/* Animated Scroll More Indicator */}
      <Fade delay={3000} duration={1500} triggerOnce>
        <motion.div
          animate={{
            opacity: [1, 0.4, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "7.5vh",
              left: "51%",
              transform: "translateX(-50%)",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2em",
                color: "#ffffff",
                textAlign: "center",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                fontWeight: 300,
                textShadow: "0 0 30px rgba(30, 136, 229, 0.8)",
              }}
            >
              ↓ Scroll Below To Explore More About Me ↓
            </Typography>
          </Box>
        </motion.div>
      </Fade>

      {/* Particle background effect (react-bits) */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Particles
          particleColors={["#103F9D", "#103F9D"]}
          particleCount={1750}
          particleSpread={8}
          speed={0.1}
          particleBaseSize={50}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      >
        {/* Left Floating Text */}
        <Box
          sx={{
            position: "absolute",
            top: "40vh",
            right: "65vw",
            zIndex: 10,
            display: { xs: "none", md: "block" },
          }}
        >
          <Bounce direction="down" delay={1200} duration={1200} triggerOnce>
            <motion.div
              animate={{
                x: [-8, 8, -8],
                y: [0, -25, 0],
                rotate: [-1.5, 1.5, -1.5],
              }}
              transition={{
                x: {
                  duration: 4.5,
                  delay: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y: {
                  duration: 3.2,
                  delay: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 3.8,
                  delay: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Box
                sx={{
                  padding: "2vh 5vh",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "1vh",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "7vh",
                    fontWeight: "600",
                    letterSpacing: "0.02em",
                  }}
                >
                  Hello World!
                </Typography>
              </Box>
            </motion.div>
          </Bounce>
        </Box>

        {/* Image of Me */}
        <Zoom direction="up" delay={300} duration={1500} triggerOnce>
          <Box
            component="img"
            sx={{
              maxHeight: "70vh",
              width: "auto",
              alignContent: "center",
              zIndex: 2,
              position: "relative",
            }}
            alt="Opening Profile of Abhinav Gonthina (me)"
            src="../../../OpeningProfile1.png"
          />
        </Zoom>

        {/* Right Floating Text */}
        <Box
          sx={{
            position: "absolute",
            top: "40vh",
            left: "65vw",
            zIndex: 10,
            display: { xs: "none", md: "block" },
          }}
        >
          <Bounce
            direction="down"
            delay={1400}
            duration={1200}
            fraction={0.5}
            triggerOnce
          >
            <motion.div
              animate={{
                x: [10, -10, 10],
                y: [0, -25, 0],
                rotate: [1.5, -1.5, 1.5],
              }}
              transition={{
                x: {
                  duration: 5.2,
                  delay: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                y: {
                  duration: 4,
                  delay: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 4.5,
                  delay: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <Box
                sx={{
                  padding: "2vh 5vh",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "1vh",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "7vh",
                    fontWeight: "600",
                    letterSpacing: "0.02em",
                  }}
                >
                  I'm Abhinav.
                </Typography>
              </Box>
            </motion.div>
          </Bounce>
        </Box>

        {/* Earth Image */}
        <Box
          component="img"
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-47.5%)",
            zIndex: -1,
            width: "25vh",
            height: "auto",
            opacity: 0.9,
          }}
          alt="Earth"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Earth_Western_Hemisphere_transparent_background.png/600px-Earth_Western_Hemisphere_transparent_background.png"
        />
      </Box>
    </Box>
  );
}
