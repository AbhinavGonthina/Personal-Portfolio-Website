/**
 * Grouped by the domains a recruiter scans for, not by what kind of thing
 * each entry is. "Frameworks & Libraries" put Spring Boot and Tailwind in the
 * same bucket, which tells a reader nothing about what the work was.
 *
 * Everything shows at once — there is no held-back tail — so each group's
 * list is ordered with the high-demand entries first.
 */
export const skillGroups = [
  {
    id: "languages",
    label: "Languages",
    items: ["Python", "Java", "JavaScript", "TypeScript", "C#", "SQL", "R"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    items: [
      "AWS (ECS, EKS, S3, EC2)",
      "Docker",
      "Kubernetes",
      "Terraform",
      "Jenkins",
      "Grafana",
      "Prometheus",
      "JMeter",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    items: ["Spring Boot", ".NET", "Node.js", "Express", "Flask", "Prisma"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: [
      "React",
      "Next.js",
      "React Native",
      "Tailwind CSS",
      "Material UI",
      "HTML",
      "CSS",
    ],
  },
  {
    id: "data",
    label: "Data & Tooling",
    items: [
      "PostgreSQL",
      "DynamoDB",
      "Redis",
      "MongoDB",
      "MySQL",
      "SQLite",
      "Oracle",
      "Git",
      "GitHub",
      "Postman",
      "Jest",
      "Vitest",
      "JUnit",
      "Pandas",
      "NumPy",
      "Figma",
    ],
  },
];

export const totalSkills = skillGroups.reduce((n, g) => n + g.items.length, 0);

/**
 * What the preview screen shows when a skill is pointed at: a mark,
 * and where the thing was actually used.
 *
 * Kept beside the list rather than inside it, so the grouped list
 * stays a grouped list and the plain read does not have to know any
 * of this exists.
 *
 * `icon` is a Devicon directory name, and every skill on the board
 * has one. Simple Icons had dropped Java, C#, AWS, Oracle and
 * DynamoDB over trademark complaints; Devicon carries all of them.
 * JMeter is the only one Devicon lacks, and it keeps a Simple Icons
 * path - see `JMETER` in paint.js.
 *
 * `proof` is only written where there is something real to point
 * at. A tool that is genuinely on the list but has no story behind
 * it gets none, and the screen says what group it belongs to
 * instead of inventing a project. Everything here traces to the
 * resume or to `experience.js`.
 */
export const skillDetail = {
  Python: {
    icon: "python",
    proof:
      "athenahealth: the data-generation pipeline that built and inserted ~722M rows of test data.",
  },
  Java: {
    icon: "java",
    proof:
      "athenahealth: the Spring Boot services the observability metrics came out of.",
  },
  JavaScript: { icon: "javascript", proof: null },
  TypeScript: {
    icon: "typescript",
    proof:
      "Quak, Rainfall and Pawtograder: the language most of that work is written in.",
  },
  "C#": {
    icon: "csharp",
    proof: "Philips: the .NET side of the bedside monitor simulator.",
  },
  SQL: {
    icon: "azuresqldatabase",
    proof:
      "OnTrack: a LAG() window function deriving stage-to-stage conversion from status events.",
  },
  R: { icon: "r", proof: null },

  "AWS (ECS, EKS, S3, EC2)": {
    icon: "amazonwebservices",
    proof:
      "athenahealth: ECS tasks and an EC2 auto-scaling group, taking 10 instances down to about 4.",
  },
  Docker: { icon: "docker", proof: null },
  Kubernetes: {
    icon: "kubernetes",
    proof:
      "athenahealth: checkpointed jobs running the data pipeline across 30 contexts.",
  },
  Terraform: {
    icon: "terraform",
    proof:
      "athenahealth: provisioned the auto-scaling that cut about $5,000 a year of compute.",
  },
  Jenkins: {
    icon: "jenkins",
    proof:
      "athenahealth: the CI/CD pipeline deploying the Consumer Data Store.",
  },
  Grafana: {
    icon: "grafana",
    proof:
      "athenahealth: a 34-panel dashboard spanning 8 microservices, the team's first.",
  },
  Prometheus: {
    icon: "prometheus",
    proof:
      "athenahealth: the metrics behind that dashboard, exposed through Spring Boot Actuator.",
  },
  JMeter: {
    icon: "jmeter",
    proof:
      "athenahealth: load tests at 2,500 concurrent threads, to confirm the scaling behaved.",
  },

  "Spring Boot": {
    icon: "spring",
    proof:
      "athenahealth: Actuator endpoints exposing per-service metrics. OnTrack: the API.",
  },
  ".NET": {
    icon: "dotnetcore",
    proof:
      "Philips: device management and data streaming in the monitor simulator.",
  },
  "Node.js": { icon: "nodejs", proof: null },
  Express: {
    icon: "express",
    proof:
      "Quak, Rainfall and NER: the APIs behind booking, payments and FinishLine.",
  },
  Flask: { icon: "flask", proof: null },
  Prisma: {
    icon: "prisma",
    proof:
      "Rainfall: the handlers each verified Stripe webhook is dispatched to.",
  },

  React: {
    icon: "react",
    proof: "Philips, Quak, NER and Rainfall: the frontend work on all four.",
  },
  "Next.js": {
    icon: "nextjs",
    proof: "OnTrack: the whole frontend. Pawtograder: the paper exams UI.",
  },
  "React Native": {
    icon: "react",
    proof: "Quak: the itinerary and expense views in the mobile app.",
  },
  "Tailwind CSS": {
    icon: "tailwindcss",
    proof: "Quak and CoDesign: the component layer on both.",
  },
  "Material UI": {
    icon: "materialui",
    proof: "NER: FinishLine's parts overview. Quak: the marketplace redesign.",
  },
  HTML: { icon: "html5", proof: null },
  CSS: { icon: "css3", proof: null },

  PostgreSQL: {
    icon: "postgresql",
    proof: "OnTrack: the pipeline store behind the Sankey diagram.",
  },
  DynamoDB: {
    icon: "dynamodb",
    proof:
      "athenahealth: the Consumer Data Store's tenant and service records.",
  },
  Redis: {
    icon: "redis",
    proof:
      "Quak: per-route caches over 26 GET endpoints, cutting search latency up to 80%.",
  },
  MongoDB: { icon: "mongodb", proof: null },
  MySQL: { icon: "mysql", proof: null },
  SQLite: { icon: "sqlite", proof: null },
  Oracle: {
    icon: "oracle",
    proof: "athenahealth: the database those ~722M test rows went into.",
  },
  Git: { icon: "git", proof: null },
  GitHub: {
    icon: "github",
    proof:
      "Rainfall: scoped the checkout into 17 issues and reviewed the team's work.",
  },
  Postman: { icon: "postman", proof: null },
  Jest: { icon: "jest", proof: null },
  Vitest: {
    icon: "vitest",
    proof:
      "Rainfall: 91 tests around the payment path, across three API layers.",
  },
  JUnit: { icon: "junit", proof: null },
  Pandas: { icon: "pandas", proof: null },
  NumPy: { icon: "numpy", proof: null },
  Figma: {
    icon: "figma",
    proof: "Quak: turned the redesign mockups into components.",
  },
};
