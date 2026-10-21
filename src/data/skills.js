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
    // Prisma lives in Backend. It was in both, which made the two
    // groups look like they had been filled in separately.
    items: ["Redis", "Postman", "Git", "Jest", "Vitest", "Supertest", "JUnit"],
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
 * Two parts, and the screen sets them differently.
 *
 * `use` is the general answer: what the thing is for, in his hands.
 * It reads as a sentence under the name, and every skill has one.
 *
 * `proof` is the specific answer: where, and what the work was. It
 * is a bulleted list down the left, because a list set centred is a
 * list nobody can scan. It is left off where the general answer
 * already names the only place - repeating "Philips" as a bullet
 * under a sentence that says Philips is a bullet saying nothing.
 */
export const skillDetail = {
  JavaScript: {
    icon: "javascript",
    use: "What my first React projects were written in, before I moved to TypeScript.",
    proof: [
      "CoDesign: posts, profiles, messaging and matchmaking.",
      "RoadQuest: the frontend.",
    ],
  },
  TypeScript: {
    icon: "typescript",
    use: "What I write every React project in now.",
    proof: [
      "Quak Travel: the website and the app.",
      "Philips: the SDC Simulator and PIC iX frontends.",
      "athenahealth: the Consumer Data Index.",
      "Rainfall Learning, and OnTrack.",
    ],
  },
  Python: {
    icon: "python",
    use: "Data pipelines, and the maths-heavy coursework.",
    proof: [
      "athenahealth: the pipeline that generated and inserted ~722M rows into Oracle.",
      "Coursework: machine-learning algorithms in the DS and ML classes.",
    ],
  },
  Java: {
    icon: "java",
    use: "Backend services.",
    proof: [
      "athenahealth: the rebalancing endpoint, and the Actuator metrics behind the dashboard.",
      "OnTrack: the Spring Boot backend.",
      "Coursework: Object-Oriented Design.",
    ],
  },
  SQL: {
    icon: "azuresqldatabase",
    use: "Usually behind an ORM, by hand where it has to be.",
    proof: [
      "athenahealth: the Oracle test-data loads.",
      "OnTrack: Postgres.",
      "Coursework: Intro to Databases.",
    ],
  },
  "C#": {
    icon: "csharp",
    use: "Inside .NET, on the backend at Philips.",
  },
  C: {
    icon: "c",
    use: "Systems work: a Unix shell, memory allocators, concurrent sorting and the xv6 kernel.",
  },
  "C++": {
    icon: "cplusplus",
    use: "Learning it now, in Intro to Programming.",
  },

  "AWS (ECS, EKS, S3, EC2)": {
    icon: "amazonwebservices",
    use: "Where everything I built at athenahealth ran.",
    proof: [
      "ECS tasks and an EC2 auto-scaling group.",
      "EKS clusters for the data jobs and the Consumer Data Index.",
      "S3 backups for the data pipeline.",
      "Coursework: Cloud Computing.",
    ],
  },
  Docker: {
    icon: "docker",
    use: "Containerising the projects I built with other people.",
    proof: ["Quak Travel.", "Rainfall Learning."],
  },
  Kubernetes: {
    icon: "kubernetes",
    use: "Orchestrating jobs, and hosting.",
    proof: [
      "athenahealth: checkpointed jobs for the 722M-row generation.",
      "athenahealth: hosting the Consumer Data Index - not the obvious choice, but what was provisioned.",
    ],
  },
  Terraform: {
    icon: "terraform",
    use: "Everything I was given on the cloud side at athenahealth came through it.",
    proof: [
      "The auto-scaling that took EC2 from 10 instances to about 4, and saved ~$5K a year.",
    ],
  },
  Jenkins: {
    icon: "jenkins",
    use: "CI/CD.",
    proof: [
      "athenahealth: the pipeline for changes to the Consumer Data Index.",
    ],
  },
  Grafana: {
    icon: "grafana",
    use: "The observability dashboard at athenahealth.",
    proof: ["34 panels across 8 microservices, the team's first."],
  },
  Prometheus: {
    icon: "prometheus",
    use: "The metrics behind that dashboard.",
    proof: ["Scraping AWS services and Spring Boot Actuator for Grafana."],
  },
  JMeter: {
    icon: "jmeter",
    use: "Load testing.",
    proof: [
      "athenahealth: the web API in dev, to confirm the auto-scaling held.",
    ],
  },

  Express: {
    icon: "express",
    use: "My standard choice for a backend.",
    proof: [
      "Quak Travel.",
      "Rainfall Learning.",
      "NUHire.",
      "Northeastern Electric Racing.",
    ],
  },
  Prisma: {
    icon: "prisma",
    use: "The ORM I reach for.",
    proof: [
      "Quak Travel.",
      "Rainfall Learning.",
      "Northeastern Electric Racing.",
    ],
  },
  "Spring Boot": {
    icon: "spring",
    use: "Java services.",
    proof: [
      "athenahealth: Actuator, and the endpoint I added.",
      "OnTrack: the API.",
    ],
  },
  ".NET": {
    icon: "dotnetcore",
    use: "The framework around the C# work at Philips.",
    proof: ["The SDC Simulator backend."],
  },
  Flask: {
    icon: "flask",
    use: "Small Python backends.",
    proof: ["RoadQuest.", "CoDesign."],
  },

  React: {
    icon: "react",
    use: "Every project here that has a frontend.",
  },
  "Next.js": {
    icon: "nextjs",
    use: "React with routing and rendering handled for me.",
    proof: ["OnTrack.", "NUHire."],
  },
  Redux: {
    icon: "redux",
    use: "Shared state, where passing it down stops scaling.",
    proof: ["Philips: the SDC Simulator."],
  },
  HTML: {
    icon: "html5",
    use: "Every project here that has a frontend.",
  },
  CSS: {
    icon: "css3",
    use: "Every project here that has a frontend.",
  },

  Redis: {
    icon: "redis",
    use: "Caching what gets asked for over and over.",
    proof: ["Quak Travel: hotel search results, cutting latency by up to 80%."],
  },
  Postman: {
    icon: "postman",
    use: "Trying endpoints out. Not tied to any one project.",
  },
  Git: {
    icon: "git",
    use: "Every project here, and six repositories at Philips.",
  },
  Jest: {
    icon: "jest",
    use: "Unit tests on the frontend.",
    proof: ["Rainfall Learning.", "Philips."],
  },
  Vitest: {
    icon: "vitest",
    use: "Rainfall Learning's frontend tests.",
  },
  Supertest: {
    icon: "",
    use: "API tests driven against a running Express app.",
    proof: ["Rainfall Learning."],
  },
  JUnit: {
    icon: "junit",
    use: "Java tests.",
    proof: ["athenahealth.", "OnTrack.", "Coursework: Object-Oriented Design."],
  },
};
