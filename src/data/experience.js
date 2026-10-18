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
    did: "I was on a platform team that maintains the shared infrastructure other teams build on. I set up auto-scaling so our servers grow and shrink with traffic instead of running at full size all the time. I also built an internal app that puts tenant and service data in one place, wrote a pipeline to generate large-scale test data, and created the team's first monitoring dashboard.",
    stats: [
      { value: "~$5k", label: "saved a year in compute" },
      { value: "~722M", label: "rows of test data" },
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
      "Oracle",
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
      "Patient monitoring systems that nurses use to watch vital signs and alarms in hospital ICUs.",
    did: "Most of my time went into a simulator that mimics real bedside monitors, so the system can be tested without physical hardware. I owned most of its frontend and contributed to the backend, building things like a live log viewer and a way to configure many devices at once. On the main product, I added help tooltips to the alarm settings and fixed how third-party devices were labeled.",
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
    did: "I joined early and built much of the backend, including hotel booking, payment splitting, and itinerary planning. I also sped up hotel search by caching popular results. When Quak pivoted to an itinerary marketplace, I led the mobile app's redesign.",
    stats: [
      { value: "80%", label: "faster hotel search" },
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
    did: "I work on FinishLine, the team's project management app. I built a page that shows where every part is in the review process, and a tool that warns you about every rule that depends on one before you delete it.",
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
    role: "Tech Lead — Payments & Internal Tools",
    location: "Boston, MA",
    start: "Jun 2025",
    end: "Dec 2025",
    logo: "/logos/badges/rainfall.png",
    brand: "#17319C",
    branch: { side: "right", t: 0.38 },
    blurb: "A platform that connects students with tutors.",
    did: "I wrote feature specs as GitHub issues, reviewed other developers' code, and helped plan the backend for tutor payments.",
    stats: [],
    tech: ["Express", "Prisma", "Stripe API", "GitHub"],
  },
  {
    id: "khoury",
    emblem: "cap",
    accent: "#E63C2F",
    category: "northeastern",
    short: "Khoury",
    company: "Khoury",
    role: "Teaching Assistant — Discrete Structures",
    location: "Boston, MA",
    start: "Aug 2025",
    end: "Dec 2025",
    logo: "/logos/badges/khoury.png",
    brand: "#FFFFFF",
    branch: { side: "left", t: 0.24 },
    blurb:
      "Northeastern's intro CS theory course, where students first learn proofs, logic, and the math behind computing.",
    did: "I run weekly recitations, hold office hours, answer questions on Piazza, and grade assignments. Most of the job is finding a different way to explain a concept when the first one does not click.",
    stats: [
      { value: "500+", label: "students in the course" },
      { value: "30+", label: "students per recitation" },
    ],
    tech: ["Piazza"],
  },
  {
    id: "oasis",
    emblem: "palm",
    category: "northeastern",
    short: "Oasis",
    company: "Oasis",
    accent: "#2E8B9A",
    // TODO(abhinav): the role title and `did` are still unwritten. The
    // panel leaves both out rather than printing a placeholder.
    role: "Role TBD",
    location: "Boston, MA",
    start: "Jan 2026",
    end: "Present",
    logo: "/logos/badges/oasis.png",
    brand: "#FFFFFF",
    blurb:
      "A hiring simulation game where students preparing for co-op play the recruiter instead of the candidate.",
    did: "",
    stats: [],
    tech: [],
  },
  {
    id: "pawtograder",
    emblem: "husky",
    category: "northeastern",
    short: "Pawtograder",
    company: "Pawtograder",
    accent: "#8A6FD6",
    // TODO(abhinav): the role title and the stack are still unwritten.
    // Not guessed at: a wrong stack on a portfolio is worse than a
    // missing one, and this one would have been a guess.
    role: "Role TBD",
    location: "Boston, MA",
    start: "Jan 2026",
    end: "Present",
    logo: "/logos/badges/pawtograder.png",
    brand: "#FFFFFF",
    blurb:
      "The open-source platform Northeastern CS courses use to submit and grade assignments.",
    did: "I am on the team adding support for paper exams. I build the exam templates and answer regions that tell the system where each answer sits on a scanned page.",
    stats: [],
    tech: [],
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
