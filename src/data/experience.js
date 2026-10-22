/**
 * Three kinds of experience, kept apart because they are read differently:
 * a co-op at a healthcare company, a tech-lead role at a small startup and a
 * teaching assistantship are not comparable entries in one flat list.
 */
export const EXPERIENCE_GROUPS = [
  { id: "work", label: "Work" },
  { id: "startup", label: "Startup" },
  { id: "northeastern", label: "Northeastern" },
];

// `emblem` is the small object standing on that building's roof in the 3D
// skyline - what the place does, in one shape.

// `accent` is a light colour per role, used by anything that has to tell
// them apart without reading - the 3D towers behind this section, for one.
// It is not `brand`: that is the logo plate's background, and it is white
// for half of these, which makes it useless as a signal.

/**
 * Reverse-chronological. `branch` positions each role on the organic tree:
 * side = which way the branch grows, t = how far up the trunk it attaches.
 *
 * Each role reads in four parts, in the order somebody who has never
 * heard of the place needs them: what the organisation is, what I did
 * there, what the work was built out of, and the one or two numbers
 * worth quoting.
 *
 * `blurb` is about the company, not about me. Half of these are names
 * a reader will not know, and a list of what somebody shipped is no
 * use until you know what it was shipped into.
 *
 * `stats` holds at most two, and empty is normal - a role that has to
 * reach for a third number does not have two good ones.
 */
export const experience = [
  {
    id: "athenahealth",
    emblem: "chart",
    accent: "#7B2D8E",
    category: "work",
    short: "athenahealth",
    company: "athenahealth",
    role: "Software Engineer Intern",
    location: "Boston, MA",
    start: "Jun 2026",
    end: "Aug 2026",
    logo: "/logos/badges/athenahealth.png",
    // Matches the logo art's own background, so the banner is seamless.
    brand: "#FFFFFF",
    branch: { side: "right", t: 0.94 },
    blurb:
      "Cloud software that medical practices use to run billing, patient records, and day-to-day operations.",
    did: [
      "I was on a platform team that maintains the shared infrastructure other teams build on. I set up auto-scaling so our servers grow and shrink with traffic instead of running at full size all the time. I also built an internal app that puts tenant and service data in one place, wrote a pipeline to generate large-scale test data, and created the team's first monitoring dashboard.",
    ],
    // Four, which is the exception. The stack here is long enough to
    // run past the foot of the panel on its own, and a second column
    // of numbers beside it takes some of that height back instead of
    // leaving the space empty.
    stats: [
      { value: "~$5k", label: "saved a year in compute" },
      { value: "~722M", label: "rows of test data" },
      { value: "10 → 4", label: "EC2 instances running" },
      { value: "34", label: "panels, 8 microservices" },
    ],
    tech: [
      "AWS",
      "Terraform",
      "Kubernetes",
      "Jenkins",
      "React",
      "Express",
      "DynamoDB",
      "Python",
      "Grafana",
      "Prometheus",
      "Spring Boot",
      "JMeter",
    ],
  },
  {
    id: "philips",
    emblem: "ward",
    accent: "#1F6FEB",
    category: "work",
    short: "Philips",
    company: "Philips",
    role: "Software Engineer Co-op",
    location: "Cambridge, MA",
    start: "Jan 2026",
    end: "May 2026",
    logo: "/logos/badges/philips.png",
    brand: "#FFFFFF",
    branch: { side: "left", t: 0.8 },
    blurb:
      "Patient monitoring systems that nurses use to watch vital signs and alarms at the bedside in hospitals.",
    did: [
      "Most of my time went into a simulator that mimics real bedside monitors, so the system can be tested without physical hardware. I owned most of its frontend and contributed to the backend, building things like a live log viewer and a way to configure many devices at once. On the main product, I added help tooltips to the alarm settings and fixed how third-party devices were labeled.",
    ],
    stats: [
      { value: "50+", label: "stakeholders at the demo" },
      { value: "6", label: "repositories worked in" },
    ],
    tech: ["React", "TypeScript", "Redux", "C#/.NET", "Tauri", "Swagger"],
  },
  {
    id: "quak",
    emblem: "plane",
    accent: "#FC3600",
    category: "startup",
    short: "Quak Travel",
    company: "Quak Travel",
    role: "Software Engineer Intern",
    location: "Remote",
    start: "Mar 2025",
    end: "Jan 2026",
    logo: "/logos/badges/quak.png",
    brand: "#FC3600",
    branch: { side: "right", t: 0.66 },
    blurb:
      "A startup that makes group travel easier, from booking stays to splitting costs.",
    did: [
      "I joined early and built much of the backend, starting with group hotel booking through Duffel API, per-hotel cost splitting through Stripe, and the itinerary planning around both. I implemented a Redis cache, which cut latency by up to 80% on destinations people actually search for. When Quak pivoted to an itinerary marketplace I led the mobile app's redesign.",
    ],
    stats: [
      { value: "$140K", label: "funding round" },
      { value: "200+", label: "beta users, 4 universities" },
    ],
    tech: [
      "TypeScript",
      "Express",
      "Prisma",
      "Redis",
      "React Native",
      "Tailwind CSS",
      "Material UI",
    ],
  },
  {
    id: "ner",
    emblem: "car",
    accent: "#C8102E",
    category: "northeastern",
    short: "NER",
    company: "Northeastern Electric Racing",
    role: "Software Engineer",
    location: "Boston, MA",
    start: "Jan 2025",
    end: "Apr 2026",
    logo: "/logos/badges/ner.png",
    brand: "#FFFFFF",
    branch: { side: "left", t: 0.52 },
    blurb:
      "Northeastern's student team that builds an electric race car for Formula SAE competitions.",
    did: [
      "I worked on FinishLine, the app the team runs its own engineering on. I built the parts overview, which lists every part in the car with its description, its status in the review process and who it is waiting on, so a stalled part is visible rather than discovered. I also built the guard that runs before a deletion, which finds every rule depending on the thing you are about to remove and tells you about all of them first, and extended the backend services and hooks behind the PDF parsing system.",
    ],
    stats: [],
    tech: ["React", "Material UI", "Express", "Prisma"],
  },
  {
    id: "rainfall",
    emblem: "cloud",
    accent: "#17319C",
    category: "startup",
    short: "Rainfall",
    company: "Rainfall Learning",
    role: "Tech Lead, Payments & Internal Tools",
    location: "Boston, MA",
    start: "Jun 2025",
    end: "Aug 2025",
    logo: "/logos/badges/rainfall.png",
    brand: "#17319C",
    branch: { side: "right", t: 0.38 },
    blurb: "A student-run platform that connects tutees with tutors.",
    did: [
      "I ran the payments side of Rainfall, which meant getting money from a tutee to a tutor without the product ever holding it. That is what Stripe Connect is for, and most of the work was in not trusting it blindly. Stripe tells you a payment succeeded by calling your server, so every one of those calls gets checked against its signature before anything downstream acts on it. I wrote 91 tests around that path, because payment code that is wrong tends to be wrong quietly.",
      "The other half was the checkout itself, and breaking it into pieces small enough that four of us could build it at the same time without stepping on each other.",
    ],
    stats: [
      { value: "4", label: "engineers led" },
      { value: "17", label: "issues scoped" },
    ],
    tech: ["TypeScript", "Express", "Prisma", "Stripe API", "Vitest", "GitHub"],
  },
  {
    id: "khoury",
    emblem: "cap",
    accent: "#E63C2F",
    category: "northeastern",
    short: "Khoury",
    company: "Khoury",
    role: "Teaching Assistant, Discrete Structures",
    location: "Boston, MA",
    start: "Aug 2025",
    end: "Dec 2025",
    logo: "/logos/badges/khoury.png",
    brand: "#FFFFFF",
    branch: { side: "left", t: 0.24 },
    blurb:
      "Northeastern's intro CS theory course, where students first learn proofs, logic, and the math behind computing.",
    did: [
      "I ran weekly recitations, held office hours, answered questions on Piazza and graded assignments. Most of the job was finding a different way to explain a concept when the first one did not land. Combinatorics, graph theory, induction and proofs are all things people get stuck on in their own particular way.",
    ],
    stats: [
      { value: "500+", label: "students in the course" },
      { value: "30+", label: "students per recitation" },
    ],
    // Nothing worth listing. Piazza is not a stack, and a block with
    // one tool in it says less than no block at all.
    tech: [],
  },
  {
    id: "oasis",
    emblem: "palm",
    category: "northeastern",
    short: "Oasis",
    company: "Oasis",
    accent: "#2E8B9A",
    role: "Accelerator Series",
    location: "Boston, MA",
    start: "Sep 2026",
    end: "Present",
    logo: "/logos/badges/oasis.png",
    brand: "#FFFFFF",
    blurb:
      "Northeastern's student-run product incubator. The Project Series takes an idea to a demo in a semester; the Accelerator Series is for the teams that keep building after it.",
    did: [
      "In the Accelerator Series I work on NUHire, a hiring simulation that sits students preparing for co-op on the recruiter's side of the table. I am rebuilding its frontend, so the screens a session is spent inside read like the hiring tools they imitate.",
      "Earlier, from January to April 2025, I was in the Project Series and led the frontend of CoDesign, a platform for finding people to work with on creative projects, building its posts, profiles, messaging and matchmaking. We showed it at Demo Day.",
    ],
    stats: [{ value: "100+", label: "at Oasis Demo Day" }],
    tech: ["React", "Next.js", "Express", "PostgreSQL"],
  },
  {
    id: "pawtograder",
    emblem: "husky",
    category: "northeastern",
    short: "Pawtograder",
    company: "Pawtograder",
    accent: "#8A6FD6",
    role: "Paper Exams, CS4535",
    location: "Boston, MA",
    start: "Sep 2026",
    end: "Present",
    logo: "/logos/badges/pawtograder.png",
    brand: "#FFFFFF",
    blurb:
      "The open-source platform Northeastern CS courses use to submit assignments, run autograders and manage grades.",
    did: [
      "I am on the Paper Exams team, which is adding support for exams written on paper and then scanned in to be graded in Pawtograder. My part is integrating templates and answer regions. A template describes the layout of an exam, and the regions mark where each question's answer sits on the page, so when a scan arrives the system knows which piece of it to put in front of a grader.",
    ],
    stats: [],
    tech: ["TypeScript", "Next.js", "PostgreSQL", "Supabase"],
  },
];

/**
 * The groups left to right across the skyline arc, which is not the order
 * above: that one is reverse-chronological, this one is spatial. The 3D
 * scene lays the buildings out in it and the detail panel's arrows step
 * along it, so both have to read from the same list or the left arrow
 * would walk off in some order of its own.
 *
 * `ground` is the word written on the pavement in front of each cluster.
 */
export const ARC_GROUPS = [
  { id: "startup", ground: "STARTUPS" },
  { id: "work", ground: "WORK" },
  { id: "northeastern", ground: "NORTHEASTERN" },
];

export const arcOrder = ARC_GROUPS.flatMap(({ id }) =>
  experience.filter((r) => r.category === id),
);
