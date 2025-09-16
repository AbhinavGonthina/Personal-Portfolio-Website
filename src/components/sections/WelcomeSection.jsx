import { Typography } from "@mui/material";
import { Box } from "@mui/material";
import { useState, useEffect } from "react";
import SplitText from "../react-bits-components/SplitText";
import Particles from "../react-bits-components/Particles";

export default function WelcomeSection() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/*<Particles
        className="w-[500]"
        particleColors={["#103F9D", "#103F9D"]}
        particleCount={1000}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={75}
        moveParticlesOnHover={false}
        alphaParticles={false}
        disableRotation={false}
      /> */}
      {/* Find alternative for this animation it sometimes doesnt load for a millisecond and is shown and hidden too early */}
      <SplitText
        className="right-[65vw] text-[7vh] absolute"
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
          zIndex: "1",
        }}
        alt="Opening Profile of Abhinav Gonthina (me)"
        src="../../../OpeningProfile.png"
      />
      <SplitText
        className="left-[65vw] text-[7vh] absolute"
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
  );
}
