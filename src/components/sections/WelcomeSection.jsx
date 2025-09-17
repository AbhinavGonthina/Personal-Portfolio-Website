import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import SplitText from "../react-bits-components/SplitText";
import Particles from "../react-bits-components/Particles";

export default function WelcomeSection() {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      >
        <Particles
          className="w-full h-full"
          particleColors={["#103F9D", "#103F9D"]}
          particleCount={1000}
          particleSpread={5}
          speed={0.1}
          particleBaseSize={50}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </Box>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          zIndex: 1,
        }}
      >
        {/* Find alternative for this animation it sometimes doesnt load for a millisecond and is shown and hidden too early */}
        <SplitText
          className="right-[65vw] text-[7vh] absolute z-10"
          text="Hello World!"
          delay={70}
          duration={1.5}
          ease="elastic.out(1, 0.3)"
          splitType="chars"
          from={{ opacity: 0, y: 10 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0}
          rootMargin="0px"
          textAlign="center"
        />
        <Box
          component="img"
          sx={{
            height: "auto",
            width: "55vw",
            alignContent: "center",
            paddingTop: "10vh",
            zIndex: 2,
            position: "relative",
          }}
          alt="Opening Profile of Abhinav Gonthina (me)"
          src="../../../OpeningProfile.png"
        />
        <SplitText
          className="left-[65vw] text-[7vh] absolute z-10"
          text="I'm Abhinav."
          delay={70}
          duration={1.5}
          ease="elastic.out(1, 0.3)"
          splitType="chars"
          from={{ opacity: 0, y: 10 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0}
          rootMargin="0px"
          textAlign="center"
        />
      </Box>
    </Box>
  );
}
