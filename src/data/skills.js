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
    items: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "SQL",
      "C#",
      "C",
      "C++",
    ],
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
    items: ["Express", "Prisma", "Spring Boot", ".NET", "Flask"],
  },
  {
    id: "frontend",
    label: "Frontend",
    items: ["React", "Next.js", "Redux", "HTML", "CSS"],
  },
  {
    id: "data",
    label: "Data & Tooling",
    items: ["Prisma", "Redis", "Postman", "Git", "Jest", "Vitest", "JUnit"],
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
 * `proof` says how the thing was used, not only where - "the
 * auto-scaling that took EC2 from 10 instances to about 4" rather
 * than "athenahealth". Where that cannot be said briefly it names
 * the place and stops, which is more use than a sentence padded out
 * to look like one.
 *
 * A string where there is one place to point at, an array where
 * there are several: the screen sets one as a sentence under the
 * name and several as a bulleted list, because a list set centred
 * is a list nobody can scan.
 */
export const skillDetail = {
  JavaScript: {
    icon: "javascript",
    proof: [
      "CoDesign: posts, profiles, messaging and the matchmaking UI.",
      "RoadQuest: the whole frontend.",
    ],
  },
  TypeScript: {
    icon: "typescript",
    proof: [
      "Philips: the SDC Simulator and Event Notification frontends.",
      "Quak: the booking and payment APIs.",
      "FinishLine, NUHire and OnTrack: the React frontends.",
    ],
  },
  Python: {
    icon: "python",
    proof: [
      "athenahealth: the pipeline that generated and inserted ~722M rows into Oracle.",
      "Coursework: data science and machine learning.",
    ],
  },
  Java: {
    icon: "java",
    proof: [
      "athenahealth: Spring Boot microservices, and rebalancing a Zeebe cluster.",
      "OnTrack: the API.",
      "Coursework: Object-Oriented Design.",
    ],
  },
  SQL: {
    icon: "azuresqldatabase",
    proof: [
      "athenahealth: Oracle test-data loads across 30 contexts.",
      "OnTrack: Postgres on Neon.",
      "Coursework: Intro to Databases.",
    ],
  },
  "C#": {
    icon: "csharp",
    proof:
      "Philips: the .NET backends behind the SDC Simulator and the Event Notification config API.",
  },
  C: {
    icon: "c",
    proof:
      "Computer Systems: a Unix shell, memory allocators, concurrent sorting and work inside the xv6 kernel.",
  },
  "C++": {
    icon: "cplusplus",
    proof:
      "Coursework: classes, inheritance and polymorphism, in Intro to C++.",
  },

  "AWS (ECS, EKS, S3, EC2)": {
    icon: "amazonwebservices",
    proof: [
      "athenahealth: ECS tasks and an EC2 auto-scaling group.",
      "athenahealth: EKS clusters for the data jobs and the Consumer Data Store.",
      "athenahealth: S3 backups for the data pipeline.",
      "Coursework: Cloud Computing.",
    ],
  },
  Docker: {
    icon: "docker",
    proof: "Quak: containerising the services.",
  },
  Kubernetes: {
    icon: "kubernetes",
    proof: [
      "athenahealth: checkpointed jobs that generated 722M rows.",
      "athenahealth: the EKS hosting for the Consumer Data Store.",
    ],
  },
  Terraform: {
    icon: "terraform",
    proof:
      "athenahealth: every piece of infrastructure as code, including the auto-scaling that took EC2 from 10 instances to about 4 and saved ~$5K a year.",
  },
  Jenkins: {
    icon: "jenkins",
    proof:
      "athenahealth: the CI/CD pipeline that deploys the Consumer Data Store to EKS.",
  },
  Grafana: {
    icon: "grafana",
    proof:
      "athenahealth: a 34-panel dashboard over 8 microservices - the team's first centralised monitoring.",
  },
  Prometheus: {
    icon: "prometheus",
    proof:
      "athenahealth: scraping Spring Boot Actuator metrics to feed the Grafana dashboard.",
  },
  JMeter: {
    icon: "jmeter",
    proof:
      "athenahealth: load tests at 2,500 concurrent threads, to prove the auto-scaling held.",
  },

  Express: {
    icon: "express",
    proof: [
      "Quak: the booking, payment-splitting and itinerary APIs.",
      "athenahealth: the Consumer Data Store API.",
      "FinishLine and NUHire.",
    ],
  },
  Prisma: {
    icon: "prisma",
    proof: [
      "Quak: the ORM behind the booking backend.",
      "FinishLine: the data layer.",
    ],
  },
  "Spring Boot": {
    icon: "spring",
    proof: [
      "athenahealth: Actuator endpoints exposing per-service metrics.",
      "OnTrack: the API.",
    ],
  },
  ".NET": {
    icon: "dotnetcore",
    proof:
      "Philips: the SDC Simulator, and the Event Notification config API endpoints.",
  },
  Flask: {
    icon: "flask",
    proof: ["CoDesign: the backend.", "Rainfall: the backend services."],
  },

  React: {
    icon: "react",
    proof:
      "Every project with a frontend: the Philips SDC Simulator and PIC iX, athenahealth's Data Store, FinishLine, NUHire, OnTrack and CoDesign.",
  },
  "Next.js": {
    icon: "nextjs",
    proof: "OnTrack and NUHire: the frontend on both.",
  },
  Redux: {
    icon: "redux",
    proof:
      "Philips: SDC Simulator state, including propagating one config across five device settings.",
  },
  HTML: { icon: "html5", proof: "Every project with a frontend." },
  CSS: { icon: "css3", proof: "Every project with a frontend." },

  Redis: {
    icon: "redis",
    proof:
      "Quak: caching hotel search, which took up to 80% off query latency.",
  },
  Postman: {
    icon: "postman",
    proof: "Testing the APIs on every backend project.",
  },
  Git: {
    icon: "git",
    proof:
      "Every project, and pull requests across six repositories at Philips.",
  },
  Jest: {
    icon: "jest",
    proof: [
      "Philips: suites for the logging UI, the tooltips and config propagation.",
      "Rainfall: frontend tests.",
    ],
  },
  Vitest: { icon: "vitest", proof: "Rainfall: the frontend tests." },
  JUnit: {
    icon: "junit",
    proof: [
      "athenahealth: Spring Boot service tests.",
      "OnTrack: backend tests.",
      "Coursework: Object-Oriented Design.",
    ],
  },
};
