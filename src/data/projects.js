// Flat list — the old nested folder structure became the `category` field.
export const categories = [
  { id: "all", label: "All" },
  { id: "personal", label: "Personal" },
  { id: "startup", label: "Startups" },
  { id: "class", label: "Coursework" },
];

export const projects = [
  {
    id: "ontrack",
    title: "OnTrack",
    blurb:
      "Job application tracker that visualizes an entire interview pipeline as a Sankey diagram.",
    description:
      "A tracker for a software job search. It scores a resume against a job description through Gemini, and draws the whole pipeline as a Sankey diagram so you can see where applications stop.",
    category: "personal",
    period: "Aug 2025 – Present",
    tech: [
      "Next.js",
      "Spring Boot",
      "PostgreSQL",
      "Gemini API",
      "Bucket4j",
      "Resend",
    ],
    image: "/projects/ontrack.webp",
    live: "https://ontrack.abhinavgonthina.dev",
    github: "https://github.com/AbhinavGonthina/ontrack",
  },
  {
    id: "portfolio",
    title: "This Website",
    blurb: "The site you're on, rebuilt from scratch in 2026.",
    description:
      "A full rewrite of my portfolio, as a town you walk through by scrolling. The previous version is archived in the repo under legacy/.",
    category: "personal",
    period: "Sep 2026 – Present",
    tech: ["React", "Vite", "Material UI", "Motion"],
    image: "/projects/portfolio.webp",
    github: "https://github.com/AbhinavGonthina/Personal-Portfolio-Website",
  },
  {
    id: "rainfall",
    title: "Rainfall Learning",
    blurb: "A CS education platform built by students, for students.",
    description:
      "A CS education startup focused on interactive coding lessons and real-time feedback, powered by students for students.",
    category: "startup",
    period: "2025",
    tech: [
      "React",
      "TypeScript",
      "Express",
      "Prisma",
      "PostgreSQL",
      "Stripe Connect",
      "Material UI",
    ],
    image: "/projects/rainfall.webp",
    private: true,
  },
  {
    id: "quak",
    title: "Quak Travel",
    blurb:
      "The world's first itinerary marketplace, for buying and selling travel itineraries.",
    description:
      "An emerging travel startup letting travelers buy and sell itineraries. Previously a travel hub with trip planning and accommodation purchasing.",
    category: "startup",
    period: "Mar 2025 – Jan 2026",
    tech: [
      "React Native",
      "Expo",
      "TypeScript",
      "Express",
      "Prisma",
      "PostgreSQL",
      "Stripe",
      "Plaid",
    ],
    image: "/projects/quak-app.webp",
    gallery: [
      "/projects/quak-1.webp",
      "/projects/quak-2.webp",
      "/projects/quak-3.webp",
      "/projects/quak-4.webp",
    ],
    private: true,
  },
  {
    id: "codesign",
    title: "CoDesign",
    blurb:
      "A Fiverr-inspired platform connecting aspiring developers and designers.",
    description:
      "CoDesign connects aspiring developers and designers looking to collaborate on the platform. Note that the backend is on a free tier and takes a minute to spin up.",
    category: "personal",
    period: "2025",
    tech: ["React", "JavaScript", "Tailwind CSS", "Flask", "Python", "MongoDB"],
    image: "/projects/codesign.webp",
    live: "https://codesign-group1.netlify.app/",
    github: "https://github.com/Aryan0102/CoDesign",
  },
  {
    id: "prepit",
    title: "PrepIt",
    blurb:
      "AI interview prep. A company, your resume and a job description in, a personalised prep report out. Built in under two hours.",
    description:
      "Give it a company name, your resume and a job description. An agent looks the company up, compares the two, and writes a prep report covering what to know going in, where you line up, and what they are likely to ask. Built in under two hours.",
    category: "personal",
    period: "2026",
    tech: ["React", "Python", "Flask", "Subconscious API"],
    image: "/projects/prepit.webp",
    github: "https://github.com/AbhinavGonthina/PrepIt",
  },
  {
    id: "recreon",
    title: "Recreon",
    blurb: "Connecting sports enthusiasts looking for people to play with.",
    description:
      "A platform where users create and join pickup games, chat with other players, and track their stats over time.",
    category: "startup",
    period: "2025",
    tech: [
      "React Native",
      "JavaScript",
      "Express",
      "Prisma",
      "PostgreSQL",
      "Expo",
    ],
    image: "/projects/recreon.webp",
    private: true,
  },
  {
    id: "roadquest",
    title: "RoadQuest",
    blurb:
      "Gamifying road trips with AI-generated quests. Built in under 24 hours at HackBeanpot 2025.",
    description:
      "A game website that uses ChatGPT prompting to generate quests for people to take on during a road trip to their destination. Built in under 24 hours at HackBeanpot 2025.",
    category: "personal",
    period: "HackBeanpot 2025",
    tech: [
      "React",
      "JavaScript",
      "Flask",
      "Python",
      "MongoDB",
      "Google Maps API",
      "OpenAI API",
    ],
    image: "/projects/roadquest-1.webp",
    gallery: [
      "/projects/roadquest-1.webp",
      "/projects/roadquest-2.webp",
      "/projects/roadquest-3.webp",
    ],
    github: "https://github.com/AbhinavGonthina/RoadQuest",
  },
  {
    id: "connections",
    title: "Connections",
    blurb: "A NYTimes Connections clone in Java.",
    description:
      "A clone of the NYTimes Connections game where players group words by their hidden associations.",
    category: "class",
    period: "Coursework",
    tech: ["Java", "impworld"],
    video: "/videos/ConnectionsDemo.mp4",
    poster: "/projects/connections-poster.webp",
    private: true,
  },
  {
    id: "ztype",
    title: "ZType",
    blurb: "A fast-paced typing game where you destroy enemies by typing.",
    description:
      "Players defend themselves by typing words to destroy incoming enemies before they reach the bottom.",
    category: "class",
    period: "Coursework",
    tech: ["Java", "impworld"],
    video: "/videos/ZTypeDemo.mp4",
    poster: "/projects/ztype-poster.webp",
    private: true,
  },
  {
    id: "lightemall",
    title: "Light Em All",
    blurb: "Rotate tiles to connect a power source to every bulb on the board.",
    description:
      "A Java puzzle game where the player rotates tiles to wire a power source through to all light bulbs on the board.",
    category: "class",
    period: "Coursework",
    tech: ["Java", "impworld"],
    image: "/projects/lightemall.webp",
    private: true,
  },
  {
    id: "cleanboston",
    title: "Clean Boston",
    blurb: "Environmental data visualization game built in Racket.",
    description:
      "A game where the player clicks to un-pollute cities, aiming to completely clean at least one city.",
    category: "class",
    period: "Coursework",
    tech: ["Racket"],
    video: "/videos/BostonCO2Demo.mp4",
    poster: "/projects/cleanboston-poster.webp",
    private: true,
  },
];
