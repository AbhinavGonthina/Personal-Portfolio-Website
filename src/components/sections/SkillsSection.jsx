import {
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useState, useRef, memo, useCallback } from "react";
import { motion } from "framer-motion";
import LogoLoop from "../react-bits-components/LogoLoop";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiPython,
  SiNodedotjs,
  SiExpress,
  SiPostgresql,
  SiGit,
  SiGithub,
  SiDocker,
  SiAmazonwebservices,
  SiTailwindcss,
  SiMui,
  SiHtml5,
  SiCss3,
  SiPrisma,
  SiMysql,
  SiLinux,
  SiFigma,
  SiPostman,
  SiIntellijidea,
  SiSqlite,
  SiR,
  SiRacket,
  SiEclipseide,
  SiJunit5,
  SiVitest,
} from "react-icons/si";
import ParticleConnectionBackground from "../ui/ParticleConnectionBackground";

const techLogos = [
  {
    node: <SiRacket />,
    title: "DrRacket",
    href: "https://docs.racket-lang.org/drracket",
  },
  { node: <SiJunit5 />, title: "JUnit", href: "https://junit.org" },
  {
    node: <SiJavascript />,
    title: "JavaScript",
    href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
  },
  {
    node: <SiTypescript />,
    title: "TypeScript",
    href: "https://www.typescriptlang.org",
  },
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiPython />, title: "Python", href: "https://www.python.org" },
  { node: <SiNodedotjs />, title: "Node.js", href: "https://nodejs.org" },
  { node: <SiExpress />, title: "Express", href: "https://expressjs.com" },
  {
    node: <SiPostgresql />,
    title: "PostgreSQL",
    href: "https://www.postgresql.org",
  },
  { node: <SiGit />, title: "Git", href: "https://git-scm.com" },
  { node: <SiGithub />, title: "GitHub", href: "https://github.com" },
  { node: <SiDocker />, title: "Docker", href: "https://www.docker.com" },
  {
    node: <SiAmazonwebservices />,
    title: "AWS",
    href: "https://aws.amazon.com",
  },
  {
    node: <SiTailwindcss />,
    title: "Tailwind CSS",
    href: "https://tailwindcss.com",
  },
  { node: <SiMui />, title: "Material UI", href: "https://mui.com" },
  {
    node: <SiHtml5 />,
    title: "HTML",
    href: "https://developer.mozilla.org/en-US/docs/Web/HTML",
  },
  {
    node: <SiCss3 />,
    title: "CSS",
    href: "https://developer.mozilla.org/en-US/docs/Web/CSS",
  },
  { node: <SiPrisma />, title: "Prisma", href: "https://www.prisma.io" },
  { node: <SiMysql />, title: "MySQL", href: "https://www.mysql.com" },
  { node: <SiLinux />, title: "Linux", href: "https://www.linux.org" },
  { node: <SiFigma />, title: "Figma", href: "https://www.figma.com" },
  { node: <SiPostman />, title: "Postman", href: "https://www.postman.com" },
  {
    node: <SiIntellijidea />,
    title: "IntelliJ IDEA",
    href: "https://www.jetbrains.com/idea",
  },
  { node: <SiSqlite />, title: "SQLite", href: "https://www.sqlite.org" },
  { node: <SiR />, title: "R", href: "https://www.r-project.org" },
  { node: <SiEclipseide />, title: "Eclipse", href: "https://www.eclipse.org" },
  {
    node: <SiGithub />,
    title: "GitHub Desktop",
    href: "https://desktop.github.com",
  },
  { node: <SiVitest />, title: "Vitest", href: "https://vitest.dev/" },
];

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Java",
  "Python",
  "SQL",
  "R",
  "HTML",
  "CSS",
];

const FRAMEWORKS = [
  "React",
  "Node.js",
  "Express",
  "Prisma",
  "Tailwind CSS",
  "Material UI",
  "Beautiful Soup",
  "Framer Motion",
  "JUnit",
  "Pandas",
  "NumPy",
  "Vitest",
];

const TOOLS = [
  "VS Code",
  "IntelliJ IDEA",
  "Eclipse",
  "RStudio",
  "DrRacket",
  "Windows",
  "Linux",
  "Figma",
  "Git",
  "GitHub",
  "Docker",
  "AWS",
  "Postman",
  "PostgreSQL",
  "SQLite",
  "MySQL",
];

const chipSx = {
  color: "#00d4ff",
  borderColor: "#00d4ff",
  bgcolor: "rgba(0,212,255,0.08)",
  fontWeight: 600,
  letterSpacing: 0.2,
  "&:hover": {
    bgcolor: "rgba(0,212,255,0.16)",
    boxShadow: "0 0 12px #00d4ff66",
  },
};

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const fadeInLeft = {
  hidden: {
    opacity: 0,
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const fadeInRight = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

// Memoized PillList component
const PillList = memo(function PillList({ items }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        alignContent: "flex-start",
        mt: 1,
        width: "100%",
        height: "100%",
        overflow: "hidden", // Prevent overflow outside the container
      }}
    >
      {items.map((label) => (
        <Chip key={label} label={label} variant="outlined" sx={chipSx} />
      ))}
    </Box>
  );
});

// Memoized NumberedList component
const NumberedList = memo(function NumberedList({ items }) {
  return (
    <List sx={{ mt: 0, p: 0 }}>
      {items.map((item, index) => (
        <ListItem
          key={item}
          sx={{
            py: 1.5,
            px: 2,
            borderBottom:
              index < items.length - 1
                ? "1px solid rgba(0,212,255,0.2)"
                : "none",
            transition: "all 0.3s ease",
          }}
        >
          <Typography
            sx={{
              color: "#00d4ff",
              fontWeight: 700,
              fontSize: { xs: "16px", sm: "18px", md: "20px" },
              mr: 3,
              minWidth: "30px",
              textAlign: "center",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </Typography>
          <ListItemText
            primary={item}
            primaryTypographyProps={{
              sx: {
                color: "#ccd6f6",
                fontSize: { xs: "14px", sm: "16px", md: "18px" },
                fontWeight: 500,
                letterSpacing: 0.5,
                transition: "all 0.3s ease",
              },
            }}
          />
        </ListItem>
      ))}
    </List>
  );
});

// Optimized TiltCard with throttled mouse movement
const TiltCard = memo(function TiltCard({ children, title }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule the tilt update for the next frame
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Reduced rotation range for smoother performance
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      setTilt({ x: rotateX, y: rotateY });
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <Box
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: "relative",
        height: { xs: "350px", sm: "400px", md: "45vh" },
        width: { xs: "80vw", sm: "80vw", md: "26vw", lg: "26vw" },
        maxWidth: "480px",
        p: "20px",
        border: "2px solid #00d4ff",
        borderRadius: "12px",
        overflow: "visible", // Changed from "visible" to "hidden" to contain content
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: "transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)",
        willChange: "transform",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      }}
    >
      <Typography
        sx={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%)",
          px: 1,
          py: 0.25,
          fontSize: { xs: "14px", sm: "15px", md: "17px" },
          fontWeight: 700,
          lineHeight: 1,
          color: "#00d4ff",
          backgroundColor: "#0f0113",
          whiteSpace: "nowrap",
          zIndex: 1,
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
});

// Memoized FrameworkGrid component
const FrameworkGrid = memo(function FrameworkGrid({ items }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: { xs: "6px", sm: "8px", md: "10px", lg: "14px" },
        width: "100%",
        height: "100%",
      }}
    >
      {items.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: "4px", sm: "6px", md: "8px", lg: "10px" },
            border: "1px solid #00d4ff",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 212, 255, 0.05)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: {
              xs: "10px",
              sm: "11px",
              md: "12px",
              lg: "13px",
            },
            fontWeight: 500,
            color: "#ccd6f6",
            textAlign: "center",
            overflow: "hidden",
            wordWrap: "break-word",
            willChange: "auto",
            "&:hover": {
              backgroundColor: "rgba(0, 212, 255, 0.15)",
              transform: "scale(1.05)",
              borderColor: "#64ffda",
            },
          }}
        >
          {item}
        </Box>
      ))}
    </Box>
  );
});

export default function SkillsSection() {
  return (
    // SkillsSection.jsx - Update the main Box wrapper
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        minHeight: { xs: "auto", md: "90vh" },
        overflow: "hidden",
        gap: "2vh",
      }}
    >
      <ParticleConnectionBackground />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.1,
          margin: "-100px",
        }}
      >
        {/* Title Section */}
        <motion.div variants={fadeInUp}>
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
              My Skills
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

        {/* Logo Loop - Removed centering styles that could cause reflow */}
        <motion.div variants={fadeInUp} style={{ overflow: "hidden" }}>
          <LogoLoop
            className="h-[15vh]"
            logos={techLogos}
            speed={80}
            direction="left"
            gap={50}
            logoHeight={60}
            pauseOnHover={false} // Disabled to prevent reflow on hover
            scaleOnHover={false} // Disabled to prevent layout shifts
            ariaLabel="Technology partners"
          />
        </motion.div>

        {/* Cards Section */}
        <motion.div
          variants={staggerContainer}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "2vh",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: "3vh", sm: "4vh", md: "2vw" },
              alignItems: "center",
              width: { xs: "100%", md: "80vw", lg: "75vw" },
              maxWidth: "1400px",
              justifyContent: "center",
            }}
          >
            <motion.div variants={fadeInLeft}>
              <TiltCard title="Languages">
                <Box
                  sx={{
                    maxHeight: "100%",
                    overflow: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": { width: "8px" },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0,212,255,0.1)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#00d4ff",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <NumberedList items={LANGUAGES} />
                </Box>
              </TiltCard>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <TiltCard title="Frameworks / Libraries">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <FrameworkGrid items={FRAMEWORKS} />
                </Box>
              </TiltCard>
            </motion.div>

            <motion.div variants={fadeInRight}>
              <TiltCard title="Tools / Software">
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    overflow: "auto", // Added scrolling if content overflows
                    "&::-webkit-scrollbar": { width: "8px" },
                    "&::-webkit-scrollbar-track": {
                      background: "rgba(0,212,255,0.1)",
                      borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      background: "#00d4ff",
                      borderRadius: "4px",
                    },
                  }}
                >
                  <PillList items={TOOLS} />
                </Box>
              </TiltCard>
            </motion.div>
          </Box>
        </motion.div>
      </motion.div>
    </Box>
  );
}
