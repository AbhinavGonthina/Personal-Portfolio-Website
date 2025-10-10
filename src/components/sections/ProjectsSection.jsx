import { Typography, Box } from "@mui/material";
import { useState, useRef, memo } from "react";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Projects data
const projectsData = {
  "codesign.exe": {
    type: "file",
    title: "CoDesign - Connecting Aspiring Developers and Designers",
    description:
      "CoDesign is a Fiverr inspired platform that connects aspiring developers and designers who are looking for others on the platform to collaborate with. (Note: Backend takes a minute to load)",
    techStack: [
      "React",
      "Javascript",
      "TailwindCSS",
      "Flask",
      "Python",
      "MongoDB",
    ],
    media: {
      type: "iframe",
      url: "https://codesign-group1.netlify.app/",
    },
    github: "https://github.com/Aryan0102/CoDesign",
  },
  "roadquest.exe": {
    type: "file",
    title: "RoadQuest - Game-ify the Road Trip Experience",
    description:
      "RoadQuest is a game website powered by ChatGPT prompting to generate quests for people going on a road trip to embark on while on their journey to their destination. RoadQuest was made in <24 hours at HackBeanpot 2025.",
    techStack: [
      "React",
      "JavaScript",
      "Flask",
      "Python",
      "MongoDB",
      "Tailwind CSS",
      "Google Maps API",
      "OpenAI API",
    ],
    media: {
      type: "images",
      url: "https://tinyurl.com/y4f53bd3",
      images: [
        "/RoadQuestLandingPage.jpg",
        "/RoadQuestMainPage.jpg",
        "/RoadQuestQuestPage.jpg",
      ],
    },
    github: "https://github.com/AbhinavGonthina/RoadQuest",
  },
  "macromanage.exe": {
    type: "file",
    title:
      "MacroManage - Maximize Your Nutrition AND Your Wallet (In Progress)",
    description:
      "MacroManage is set to be a AI-powered meal planning web application that helps users optimize their diet based on their fitness goals and budget. What's special about MacroManage is that it will scrape prices and macronutrient data from popular retailers to provide accurate shopping lists/diet information to make it that much easier.",
    techStack: [
      "React",
      "TypeScript",
      "Express.js",
      "Prisma",
      "PostgreSQL",
      "Python",
      "Selenium",
      "BeautifulSoup",
      "Material-UI",
      "Tailwind CSS",
    ],
    media: {
      type: "images",
      images: ["/MacroManageSneakPeek.png"],
    },
  },
  "portfolio.exe": {
    type: "file",
    title: "Personal Portfolio Website",
    description:
      "This very website you're viewing! Nothing more to tell you 😅",
    techStack: [
      "React",
      "Framer Motion",
      "Material-UI",
      "React Bits",
      "React Awesome Reveal",
      "shadcn.io",
    ],
    media: {
      type: "images",
      images: ["/PortfolioLandingPage.png"],
    },
  },
  "Class Projects": {
    type: "folder",
    contents: {
      "cleanboston.exe": {
        type: "file",
        title: "Clean Boston - Environmental Data Visualization",
        description:
          "Simple game where a user can click w to unpollute the cities shown, with the goal of completely cleaning at least one city.",
        techStack: ["Racket"],
        media: {
          type: "video",
          url: "/videos/BostonCO2Demo.mp4",
          autoplay: true,
        },
      },
      "connections.exe": {
        type: "file",
        title: "Connections - Social Network Analysis Tool",
        description:
          "NYTimes Connections game clone in Java where users guess words based on their connections.",
        techStack: ["Java (impworld)"],
        media: {
          type: "video",
          url: "/videos/ConnectionsDemo.mp4",
          autoplay: true,
        },
      },
      "lightemall.exe": {
        type: "file",
        title: "Light Em All",
        description:
          "Java game where the player must rotate tiles to connect a power source to all light bulbs on the board.",
        techStack: ["Java (impworld)"],
        media: {
          type: "images",
          images: ["/LightEmAllDemo.png"],
        },
      },
      "ztype.exe": {
        type: "file",
        title: "ZType - Typing Game Clone",
        description:
          "A fast-paced typing game where players defend themselves by typing words to destroy incoming enemies.",
        techStack: ["Java (impworld)"],
        media: {
          type: "video",
          url: "/videos/ZTypeDemo.mp4",
          autoplay: true,
        },
      },
    },
  },
  "Start Ups": {
    type: "folder",
    contents: {
      "quak.exe": {
        type: "file",
        title: "Quak Travel - Word's First Itinerary Marketplace",
        description:
          "Quak Travel is a emerging travel startup providing travelers the ability to buy and sell itineraries. Previously, Quak was a travel hub with trip planning and accomodation purchasing functionality. (Note: The pictures represent work before the company's rebranding, current mocks are subject to an NDA)",
        techStack: [
          "React",
          "React Native",
          "Expo",
          "TypeScript",
          "Express.js",
          "Prisma",
          "PostgreSQL",
          "Stripe API",
          "Plaid API",
          "Tailwind CSS",
        ],
        media: {
          type: "images",
          images: [
            "/QuakTravelOldLandingPageWebsite.png",
            "/QuakTravelOldDashboard.png",
            "/QuakTravelOldExpensesPage.png",
            "/QuakTravelOldHotelSearch.png",
          ],
        },
      },
      "rainfall.exe": {
        type: "file",
        title: "Rainfall - CS Education Platform",
        description:
          "Rainfall Learning is a CS education startup powered by students for students focused on providing interactive coding lessons and real-time feedback to students.",
        techStack: [
          "React",
          "TypeScript",
          "Express,js",
          "Prisma",
          "PostgreSQL",
          "Tailwind CSS",
          "Material-UI",
          "Stripe Connect API",
        ],
        media: {
          type: "iframe",
          url: "https://rainfall-learning.com/",
        },
      },
      "recreon.exe": {
        type: "file",
        title: "Recreon - Connecting Sports Enthusiasts",
        description:
          "Recreon is a platform that connects sports enthusiasts looking for others to play sports with. Users can create/join games, chat with other players, and track their stats over time.",
        techStack: [
          "React Native",
          "JavaScript",
          "Express.js",
          "Prisma",
          "PostgreSQL",
          "Expo",
        ],
        media: {
          type: "images",
          images: ["/RecreonHomePage.png"],
        },
      },
    },
  },
};

// Pre-calculate all projects with custom order for GUI
const getAllProjects = (data, path = "") => {
  const projects = [];
  for (const [name, item] of Object.entries(data)) {
    if (item.type === "file") {
      projects.push({ name, data: item, path });
    } else if (item.type === "folder" && item.contents) {
      projects.push(...getAllProjects(item.contents, `${path}${name}/`));
    }
  }
  return projects;
};

// Create custom ordered list for GUI display
const allProjectsUnordered = getAllProjects(projectsData);
const allProjects = [];

// Custom ordering: move portfolio before cleanboston
const orderMap = {
  "codesign.exe": 0,
  "roadquest.exe": 1,
  "macromanage.exe": 2,
  "portfolio.exe": 3,
  "cleanboston.exe": 4,
  "connections.exe": 5,
  "lightemall.exe": 6,
  "ztype.exe": 7,
  "quak.exe": 8,
  "rainfall.exe": 9,
  "recreon.exe": 10,
};

// Sort projects according to custom order
allProjectsUnordered.sort((a, b) => {
  const orderA = orderMap[a.name] ?? 999;
  const orderB = orderMap[b.name] ?? 999;
  return orderA - orderB;
});
allProjects.push(...allProjectsUnordered);

// Initial command history
const initialHistory = [
  { t: "h", c: "Windows PowerShell" },
  { t: "h", c: "Copyright (c) Abhinav Gonthina. All rights reserved." },
  { t: "h", c: "" },
  { t: "i", c: "Type 'ls' to see contents of current folder" },
  {
    t: "i",
    c: "Type 'cd <folder>' to enter a folder (e.g., cd \"Start Ups\")",
  },
  { t: "i", c: "Type 'cd ..' to go back to parent folder" },
  { t: "i", c: "Type './<file>' to run a file (e.g., ./codesign.exe)" },
  { t: "i", c: "Type './project-gui.exe' for clickable GUI mode" },
  { t: "i", c: "Type 'clear' to clear the terminal" },
  { t: "o", c: "" },
  { t: "p", c: "" },
];

// Floating snippets
const snippets = [
  "const server = express();",
  "React.useState(initialValue);",
  "app.listen(PORT, () => {});",
  "useEffect(() => fetch(), []);",
  "router.post('/api', handler);",
  "const data = await response.json();",
  "export default Component;",
  "mongodb.connect(URL, options);",
  "axios.get('/api/data').then();",
];

// Floating background - completely separate component
const FloatingBg = memo(() => {
  const delays = [0, 8, 14, 2, 16, 10, 4, 12, 6];
  const speeds = [30, 22, 35, 18, 40, 25, 32, 20, 28];

  return (
    <>
      {snippets.map((s, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            top: i === 8 ? "105vh" : `${20 + i * 11}vh`,
            left: i % 2 === 0 ? "-40vh" : "100%",
            zIndex: 1,
            opacity: 0.15,
          }}
          animate={{
            x:
              i % 2 === 0
                ? ["0vh", "calc(100vw + 40vh)"]
                : ["0vh", "calc(-100vw - 40vh)"],
          }}
          transition={{
            x: {
              duration: speeds[i],
              ease: "linear",
              repeat: Infinity,
              delay: delays[i],
            },
          }}
        >
          <Box
            sx={{
              padding: { xs: "6px 12px", md: "0.8vh 1.5vh" },
              border: "1px solid rgba(0, 212, 255, 0.2)",
              borderRadius: "0.5vh",
              background: "rgba(0, 212, 255, 0.02)",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "14px", md: "2.5vh" },
                color: "#00d4ff",
                fontFamily: "Consolas, monospace",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </Typography>
          </Box>
        </motion.div>
      ))}
    </>
  );
});

// Image Gallery Component
const ImageGallery = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <img
        src={images[currentImage]}
        alt={`Screenshot ${currentImage + 1}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Box
            onClick={prevImage}
            sx={{
              position: "absolute",
              left: { xs: "10px", md: "2vh" },
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
              width: { xs: "36px", md: "5vh" },
              height: { xs: "36px", md: "5vh" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                background: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <ArrowBackIosIcon
              sx={{
                color: "#fff",
                fontSize: { xs: "18px", md: "2.5vh" },
                marginLeft: { xs: "6px", md: "0.8vh" },
              }}
            />
          </Box>

          <Box
            onClick={nextImage}
            sx={{
              position: "absolute",
              right: { xs: "10px", md: "2vh" },
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
              width: { xs: "36px", md: "5vh" },
              height: { xs: "36px", md: "5vh" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                background: "rgba(0, 0, 0, 0.7)",
              },
            }}
          >
            <ArrowForwardIosIcon
              sx={{
                color: "#fff",
                fontSize: { xs: "18px", md: "2.5vh" },
              }}
            />
          </Box>
        </>
      )}

      {/* Image Indicators */}
      {images.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: "10px", md: "2vh" },
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: { xs: "6px", md: "1vh" },
          }}
        >
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentImage(index)}
              sx={{
                width: { xs: "8px", md: "1.2vh" },
                height: { xs: "8px", md: "1.2vh" },
                borderRadius: "50%",
                background:
                  index === currentImage
                    ? "#00d4ff"
                    : "rgba(255, 255, 255, 0.5)",
                cursor: "pointer",
                transition: "background 0.3s",
                "&:hover": {
                  background:
                    index === currentImage
                      ? "#00d4ff"
                      : "rgba(255, 255, 255, 0.8)",
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default function ProjectsSection() {
  const [history, setHistory] = useState(initialHistory);
  const [cmd, setCmd] = useState("");
  const [path, setPath] = useState("C:\\Users\\Abhinav\\Projects");
  const [folder, setFolder] = useState(projectsData);
  const [project, setProject] = useState(null);
  const [gui, setGui] = useState(false);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const processingRef = useRef(false);

  const execute = (command) => {
    // Prevent multiple rapid executions
    if (processingRef.current) return;
    processingRef.current = true;

    const trimmed = command.trim();
    const parts = trimmed.split(" ");
    const base = parts[0].toLowerCase();
    const args = parts.slice(1).join(" ");

    let out = [];

    if (base === "./project-gui.exe" || base === "project-gui.exe") {
      setGui(true);
      out = ["Switching to GUI mode..."];
    } else if (base === "ls" && !args) {
      // Pre-build the ls output as a single array to avoid multiple operations
      const entries = Object.entries(folder);
      out = [
        "",
        `    Directory: ${path}`,
        "",
        "Mode         LastWriteTime          Length  Name",
        "----         -------------          ------  ----",
        ...entries.map(
          ([name, data]) =>
            `${data.type === "folder" ? "d-----" : "-a----"}       11/15/2024  3:45 PM         ${name}`
        ),
        "",
      ];
    } else if (base.startsWith("./")) {
      const name = base.substring(2);
      const entry = Object.entries(folder).find(
        ([k]) => k.toLowerCase() === name.toLowerCase()
      );
      if (entry && entry[1].type === "file") {
        setProject(entry[1]);
        out = ["Loading project..."];
      } else if (entry && entry[1].type === "folder") {
        out.push(
          `Error: '${name}' is a folder. Use 'cd ${name}' to navigate into it.`
        );
      } else {
        out.push(
          `Error: Project '${name}' not found`,
          "Type 'ls' to see available projects"
        );
      }
    } else if (base === "cd") {
      if (!args || args === "..") {
        if (path.includes("\\Start Ups") || path.includes("\\Class Projects")) {
          setPath("C:\\Users\\Abhinav\\Projects");
          setFolder(projectsData);
          out.push("");
        }
      } else {
        const entry = Object.entries(folder).find(
          ([k, v]) =>
            k.toLowerCase() === args.toLowerCase() && v.type === "folder"
        );
        if (entry) {
          setPath(`${path}\\${entry[0]}`);
          setFolder(entry[1].contents);
          out.push("");
        } else {
          out.push(`Error: Directory '${args}' not found`);
        }
      }
    } else if (base === "clear" || base === "cls") {
      // Use functional setState to avoid closure issues
      setHistory(() => [...initialHistory]);
      setCmd("");
      requestAnimationFrame(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = 0;
        if (inputRef.current) inputRef.current.focus();
        processingRef.current = false;
      });
      return;
    } else if (base === "") {
      out = [];
    } else {
      out.push(
        `'${base}' is not recognized as a valid command.`,
        "",
        "Available commands:",
        "  ls",
        "  cd <folder>",
        "  cd ..",
        "  ./<file>",
        "  clear"
      );
    }

    // Batch all state updates together
    setHistory((prev) => {
      const newHistory = [
        ...prev.slice(0, -1),
        { t: "c", c: `PS ${path}> ${command}` },
        ...out.map((l) => ({ t: "o", c: l })),
        { t: "p", c: "" },
      ];
      return newHistory.slice(-30);
    });
    setCmd("");

    // Use requestAnimationFrame instead of setTimeout for better performance
    requestAnimationFrame(() => {
      if (terminalRef.current)
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      if (inputRef.current && !project && !gui) inputRef.current.focus();
      processingRef.current = false;
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !processingRef.current) {
      execute(cmd);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <FloatingBg />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
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
          {" "}
          <Box
            sx={{
              width: { xs: "20vw", sm: "25vw", md: "30vw" },
              height: "3px",
              background: "linear-gradient(90deg, transparent, #00d4ff)",
              borderRadius: "2px",
              boxShadow: "0 0 10px #00d4ff66",
            }}
          />{" "}
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "8vw", sm: "6vw", md: "3.5vw" },
              whiteSpace: "nowrap",
            }}
          >
            {" "}
            Projects{" "}
          </Typography>{" "}
          <Box
            sx={{
              width: { xs: "20vw", sm: "25vw", md: "30vw" },
              height: "3px",
              background: "linear-gradient(90deg, #00d4ff, transparent)",
              borderRadius: "2px",
              boxShadow: "0 0 10px #00d4ff66",
            }}
          />{" "}
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          position: "relative",
          zIndex: 2,
          marginTop: "6vh",
          paddingBottom: "10vh",
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "90vw", sm: "85vw", md: "80vw", lg: "75vw" },
            maxWidth: "1400px",
            background: "rgba(10, 15, 30, 0.9)",
            borderRadius: { xs: "8px", md: "0.8vh" },
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            position: "relative",
          }}
        >
          {!gui && !project && (
            <Box
              sx={{
                position: "absolute",
                top: { xs: "8px", md: "1vh" },
                right: { xs: "10px", md: "15vh" },
                zIndex: 100,
                background: "rgba(0, 255, 136, 0.2)",
                border: "1px solid #00ff88",
                borderRadius: { xs: "6px", md: "0.8vh" },
                padding: { xs: "6px 10px", md: "0.8vh 1.5vh" },
                display: { xs: "none", sm: "none", md: "block" },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "12px", sm: "14px", md: "1.6vh" },
                  color: "#00ff88",
                  fontWeight: "bold",
                  fontFamily: "Consolas, monospace",
                }}
              >
                💡 Type './project-gui.exe' for clickable mode
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              background: "rgba(15, 25, 45, 0.95)",
              padding: { xs: "10px 15px", md: "1.5vh 2.5vh" },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: "10px", md: "1.5vh" },
              }}
            >
              <Box
                component="img"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M0 0h11.5v11.5H0zm12.5 0H24v11.5H12.5zM0 12.5h11.5V24H0zm12.5 0H24V24H12.5z'/%3E%3C/svg%3E"
                sx={{
                  width: { xs: "20px", md: "3vh" },
                  height: { xs: "20px", md: "3vh" },
                  opacity: 0.9,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "Consolas, monospace",
                  fontSize: { xs: "14px", sm: "16px", md: "2.2vh" },
                  color: "#fff",
                  fontWeight: 500,
                }}
              >
                Windows PowerShell
              </Typography>
            </Box>
            {gui && !project && (
              <Typography
                onClick={() => setGui(false)}
                sx={{
                  fontSize: { xs: "12px", sm: "14px", md: "1.6vh" },
                  color: "#00d4ff",
                  cursor: "pointer",
                  fontWeight: "500",
                  "&:hover": { color: "#00ff88" },
                }}
              >
                ← Back to Terminal
              </Typography>
            )}
            <Box
              sx={{
                display: "flex",
                gap: { xs: "6px", md: "1vh" },
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: { xs: "14px", md: "2vh" },
                  height: { xs: "2px", md: "0.3vh" },
                  background: "#fff",
                }}
              />
              <Box
                sx={{
                  width: { xs: "12px", md: "1.8vh" },
                  height: { xs: "12px", md: "1.8vh" },
                  border: { xs: "2px solid #fff", md: "0.25vh solid #fff" },
                }}
              />
              <Box
                sx={{
                  fontSize: { xs: "18px", md: "2.5vh" },
                  color: "#fff",
                  lineHeight: 0.5,
                  cursor: "pointer",
                }}
              >
                ×
              </Box>
            </Box>
          </Box>

          <Box
            ref={terminalRef}
            sx={{
              padding: { xs: "16px", md: "3vh" },
              height: project ? "auto" : { xs: "70vh", md: "80vh" },
              minHeight: project
                ? { xs: "85vh", md: "95vh" }
                : { xs: "70vh", md: "80vh" },
              overflowY: project ? "hidden" : "auto",
              fontFamily: "Consolas, 'Courier New', monospace",
              position: "relative",
            }}
            onClick={() => {
              if (!project && !gui && inputRef.current)
                inputRef.current.focus();
            }}
          >
            {gui && !project ? (
              <Box sx={{ padding: { xs: "12px", md: "2vh" } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "20px", sm: "24px", md: "3vh" },
                    color: "#00d4ff",
                    marginBottom: { xs: "20px", md: "3vh" },
                    fontWeight: "bold",
                  }}
                >
                  Project Gallery - Click to Open
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(auto-fill, minmax(280px, 1fr))",
                      lg: "repeat(auto-fill, minmax(320px, 1fr))",
                    },
                    gap: { xs: "16px", md: "2.5vh" },
                  }}
                >
                  {allProjects.map(({ name, data, path }, i) => (
                    <Box
                      key={i}
                      onClick={() => setProject(data)}
                      sx={{
                        background: "rgba(0, 212, 255, 0.05)",
                        border: "2px solid rgba(0, 212, 255, 0.2)",
                        borderRadius: { xs: "8px", md: "1vh" },
                        padding: { xs: "12px", md: "2vh" },
                        cursor: "pointer",
                        "&:hover": {
                          background: "rgba(0, 212, 255, 0.1)",
                          borderColor: "#00d4ff",
                        },
                      }}
                    >
                      {path && (
                        <Typography
                          sx={{
                            fontSize: { xs: "11px", sm: "12px", md: "1.4vh" },
                            color: "#00ff88",
                            marginBottom: { xs: "4px", md: "0.5vh" },
                            opacity: 0.7,
                          }}
                        >
                          📁 {path.slice(0, -1)}
                        </Typography>
                      )}
                      <Typography
                        sx={{
                          fontSize: { xs: "16px", sm: "18px", md: "2.2vh" },
                          color: "#00ff88",
                          fontWeight: "600",
                          marginBottom: { xs: "8px", md: "1vh" },
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: "13px", sm: "14px", md: "1.6vh" },
                          color: "rgba(255, 255, 255, 0.7)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {data.title}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : project ? (
              <Box sx={{ color: "#fff", height: "100%", overflow: "auto" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    marginBottom: { xs: "16px", md: "2vh" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: "12px", sm: 0 },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "24px", sm: "28px", md: "3.5vh" },
                      fontWeight: "bold",
                      color: "#00d4ff",
                    }}
                  >
                    {project.title}
                  </Typography>
                  <Box
                    sx={{ display: "flex", gap: { xs: "10px", md: "1.5vh" } }}
                  >
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: "6px", md: "0.8vh" },
                            padding: { xs: "6px 10px", md: "0.8vh 1.5vh" },
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: { xs: "4px", md: "0.5vh" },
                            cursor: "pointer",
                            transition: "all 0.3s",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.2)",
                              borderColor: "#fff",
                            },
                          }}
                        >
                          <GitHubIcon
                            sx={{
                              fontSize: { xs: "18px", md: "2.2vh" },
                              color: "#fff",
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: { xs: "13px", sm: "14px", md: "1.6vh" },
                              color: "#fff",
                              fontWeight: "600",
                              fontFamily: "Consolas, monospace",
                            }}
                          >
                            View on GitHub
                          </Typography>
                        </Box>
                      </a>
                    )}
                    <Box
                      onClick={() => {
                        setProject(null);
                        if (!gui) {
                          setHistory((prev) =>
                            [
                              ...prev.slice(0, -1),
                              { t: "o", c: "Returned to terminal" },
                              { t: "p", c: "" },
                            ].slice(-30)
                          );
                          setCmd("");
                        }
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: "6px", md: "0.8vh" },
                        padding: { xs: "6px 10px", md: "0.8vh 1.5vh" },
                        background: "rgba(255, 0, 0, 0.1)",
                        border: "1px solid rgba(255, 0, 0, 0.5)",
                        borderRadius: { xs: "4px", md: "0.5vh" },
                        cursor: "pointer",
                        "&:hover": {
                          background: "rgba(255, 0, 0, 0.2)",
                          borderColor: "#ff0000",
                        },
                      }}
                    >
                      <ArrowBackIcon
                        sx={{
                          fontSize: { xs: "18px", md: "2.2vh" },
                          color: "#ff6666",
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: { xs: "13px", sm: "14px", md: "1.6vh" },
                          color: "#ff6666",
                          fontWeight: "600",
                          fontFamily: "Consolas, monospace",
                        }}
                      >
                        Back to Terminal
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "14px", sm: "16px", md: "2vh" },
                    lineHeight: 1.6,
                    marginBottom: { xs: "16px", md: "2.5vh" },
                    color: "rgba(255, 255, 255, 0.9)",
                  }}
                >
                  {project.description}
                </Typography>
                <Box sx={{ marginBottom: { xs: "16px", md: "2.5vh" } }}>
                  <Typography
                    sx={{
                      fontSize: { xs: "18px", sm: "20px", md: "2.5vh" },
                      fontWeight: "600",
                      marginBottom: { xs: "10px", md: "1.5vh" },
                      color: "#00ff88",
                    }}
                  >
                    Tech Stack
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: { xs: "8px", md: "1vh" },
                    }}
                  >
                    {project.techStack.map((tech, i) => (
                      <Box
                        key={i}
                        sx={{
                          padding: { xs: "6px 12px", md: "0.8vh 2vh" },
                          background: "rgba(0, 212, 255, 0.1)",
                          border: "1px solid rgba(0, 212, 255, 0.3)",
                          borderRadius: { xs: "20px", md: "3vh" },
                          fontSize: { xs: "13px", sm: "14px", md: "1.8vh" },
                          color: "#00d4ff",
                        }}
                      >
                        {tech}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Only show clickable link for non-video projects */}
                {project.media.url && project.media.type !== "video" && (
                  <Box
                    sx={{
                      marginBottom: { xs: "16px", md: "2vh" },
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: "8px", md: "1vh" },
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "16px", sm: "18px", md: "2vh" },
                        color: "#00ff88",
                        fontWeight: "600",
                      }}
                    >
                      Live Demo:
                    </Typography>
                    <a
                      href={project.media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5vh",
                        color: "#00d4ff",
                        textDecoration: "none",
                        fontSize: "1.8vh",
                        padding: "0.5vh 1.5vh",
                        background: "rgba(0, 212, 255, 0.1)",
                        border: "1px solid rgba(0, 212, 255, 0.3)",
                        borderRadius: "0.5vh",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0, 212, 255, 0.2)";
                        e.currentTarget.style.borderColor = "#00d4ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0, 212, 255, 0.1)";
                        e.currentTarget.style.borderColor =
                          "rgba(0, 212, 255, 0.3)";
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "13px", sm: "14px", md: "1.8vh" },
                        }}
                      >
                        {project.media.url}
                      </Typography>
                      <OpenInNewIcon
                        sx={{ fontSize: { xs: "14px", md: "1.8vh" } }}
                      />
                    </a>
                  </Box>
                )}

                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(0, 212, 255, 0.3)",
                    borderRadius: { xs: "8px", md: "1vh" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: { xs: "16px", md: "2vh" },
                    overflow: "hidden",
                  }}
                >
                  {project.media.type === "iframe" && project.media.url ? (
                    <iframe
                      src={project.media.url}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      title={project.title}
                    />
                  ) : project.media.type === "video" && project.media.url ? (
                    <video
                      src={project.media.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onLoadedData={(e) => {
                        e.target.play();
                      }}
                    />
                  ) : project.media.type === "images" &&
                    project.media.images ? (
                    <ImageGallery images={project.media.images} />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: { xs: "16px", md: "2.2vh" },
                        color: "rgba(255, 255, 255, 0.5)",
                        textAlign: "center",
                      }}
                    >
                      {project.media.type === "iframe" &&
                        "🌐 Website Preview Placeholder"}
                      {project.media.type === "video" &&
                        !project.media.url &&
                        "🎬 Video Demo Placeholder"}
                      {project.media.type === "images" &&
                        !project.media.images &&
                        "🖼️ Image Gallery Placeholder"}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : (
              <>
                {history.map((e, i) => (
                  <Box
                    key={i}
                    sx={{ marginBottom: { xs: "6px", md: "0.8vh" } }}
                  >
                    {e.t === "h" && (
                      <Typography
                        sx={{
                          fontSize: { xs: "14px", sm: "16px", md: "2.2vh" },
                          color: "#fff",
                        }}
                      >
                        {e.c}
                      </Typography>
                    )}
                    {e.t === "i" && (
                      <Typography
                        sx={{
                          fontSize: { xs: "14px", sm: "16px", md: "2.2vh" },
                          color: "#00d4ff",
                        }}
                      >
                        {e.c}
                      </Typography>
                    )}
                    {e.t === "c" && (
                      <Typography
                        sx={{
                          fontSize: { xs: "14px", sm: "16px", md: "2.2vh" },
                          color: "#ffff00",
                        }}
                      >
                        {e.c}
                      </Typography>
                    )}
                    {e.t === "o" && (
                      <Typography
                        sx={{
                          fontSize: { xs: "14px", sm: "16px", md: "2.2vh" },
                          color: e.c.includes("Error")
                            ? "#ff5555"
                            : e.c.includes(".exe")
                              ? "#00ff88"
                              : "#fff",
                          whiteSpace: "pre",
                          fontFamily: "Consolas, monospace",
                          fontWeight: e.c.includes(".exe") ? "600" : "400",
                        }}
                      >
                        {e.c}
                      </Typography>
                    )}
                    {e.t === "p" && i === history.length - 1 && (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            fontSize: { xs: "14px", sm: "16px", md: "2.2vh" },
                            color: "#fff",
                            whiteSpace: "pre",
                          }}
                        >
                          PS {path}
                          {">"}{" "}
                        </Typography>
                        <input
                          ref={inputRef}
                          type="text"
                          value={cmd}
                          onChange={(e) => setCmd(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onBlur={(e) => {
                            if (!project && !gui)
                              setTimeout(() => e.target.focus(), 0);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "#fff",
                            fontFamily: "Consolas, monospace",
                            fontSize:
                              window.innerWidth < 768 ? "14px" : "2.2vh",
                            flex: 1,
                            minWidth: 0,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                ))}
              </>
            )}
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
}
