import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function ProjectsSection() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        style={{ width: "100%", paddingTop: "4vh" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2vw",
          }}
        >
          <Box
            sx={{
              width: "30vw",
              height: "3px",
              background: "linear-gradient(90deg, transparent, #00d4ff)",
              borderRadius: "2px",
              boxShadow: "0 0 10px #00d4ff66",
            }}
          />

          <Typography
            sx={{ fontWeight: "bold", fontSize: "4vw", color: "#fff" }}
          >
            Projects
          </Typography>

          <Box
            sx={{
              width: "30vw",
              height: "3px",
              background: "linear-gradient(90deg, #00d4ff, transparent)",
              borderRadius: "2px",
              boxShadow: "0 0 10px #00d4ff66",
            }}
          />
        </Box>
      </motion.div>
    </Box>
  );
}
