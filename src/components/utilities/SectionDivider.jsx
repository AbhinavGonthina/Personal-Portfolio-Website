import { motion } from "framer-motion";

export default function SectionDivider() {
  return (
    <motion.div
      style={{
        width: "100%",
        height: "1px",
        background: "#00d4ff",
        boxShadow: "0 0 20px #00d4ff",
      }}
      animate={{
        boxShadow: ["0 0 20px #00d4ff", "0 0 40px #00d4ff", "0 0 20px #00d4ff"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
