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
    // Supertest is not a tag of its own. It has no mark anywhere -
    // the library ships none, and neither icon set carries one - so
    // beside thirty-two drawn logos it was two letters in a box,
    // and the work it stands for is the same Rainfall payment
    // tests already credited to Vitest. It is named there instead.
    items: ["Redis", "Postman", "Git", "Jest", "Vitest", "JUnit"],
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
 * `use` is the general answer: what the thing is for, in his hands,
 * with no place names in it. It reads as a sentence under the name.
 *
 * `proof` is the specific answer: where, and what the work was, as a
 * bulleted list down the left, because a list set centred is a list
 * nobody can scan.
 *
 * Every skill carries both. On its own the sentence is a claim and
 * the list is a CV extract; the pair is what it is for, and then the
 * evidence that he has done it.
 */
export const skillDetail = {
  JavaScript: {
    icon: "javascript",
    use: "What my first React work was written in, before I moved to TypeScript.",
    proof: [
      "CoDesign: posts, profiles, messaging and the matchmaking screen.",
      "RoadQuest: the whole frontend, built in a day at HackBeanpot.",
    ],
  },
  TypeScript: {
    icon: "typescript",
    use: "What I write every React project in now.",
    proof: [
      "Quak Travel: the site, the app, and the booking and payment APIs.",
      "Philips: the SDC Simulator and PIC iX frontends.",
      "athenahealth: the Consumer Data Index.",
      "Rainfall Learning and OnTrack: both written in it end to end.",
    ],
  },
  Python: {
    icon: "python",
    use: "Data work, and the maths-heavy coursework.",
    proof: [
      "athenahealth: the pipeline that generated and inserted ~722M rows into Oracle.",
      "Coursework: the algorithms in Machine Learning and Data Science.",
    ],
  },
  Java: {
    icon: "java",
    use: "Backend services, where the work wants a type system under it.",
    proof: [
      "athenahealth: the rebalancing endpoint, and the metrics the dashboard reads.",
      "OnTrack: the Spring Boot backend.",
      "Coursework: Object-Oriented Design.",
    ],
  },
  SQL: {
    icon: "azuresqldatabase",
    use: "Usually behind an ORM, by hand where the query is the point.",
    proof: [
      "athenahealth: the Oracle test-data loads, across 30 contexts.",
      "OnTrack: a LAG() window function deriving stage-to-stage conversion.",
      "Coursework: Intro to Databases.",
    ],
  },
  "C#": {
    icon: "csharp",
    use: "The language I write .NET services in.",
    proof: [
      "Philips: device management and data streaming in the SDC Simulator.",
      "Philips: the Event Notification configuration API.",
    ],
  },
  C: {
    icon: "c",
    use: "Systems work, close enough to the machine to see it.",
    proof: [
      "Computer Systems: a Unix shell, and memory allocators.",
      "Computer Systems: concurrent sorting, and work inside the xv6 kernel.",
    ],
  },
  "C++": {
    icon: "cplusplus",
    use: "Object-oriented work in a compiled language.",
    proof: [
      "Coursework: classes, inheritance and polymorphism, in Intro to Programming.",
    ],
  },

  "AWS (ECS, EKS, S3, EC2)": {
    icon: "amazonwebservices",
    use: "The cloud every piece of infrastructure work I have done runs on.",
    proof: [
      "athenahealth: ECS tasks, and an EC2 auto-scaling group.",
      "athenahealth: EKS clusters for the data jobs and the Consumer Data Index.",
      "athenahealth: S3 for the pipeline's backups.",
      "Coursework: Cloud Computing.",
    ],
  },
  Docker: {
    icon: "docker",
    use: "Containers, so a project runs the same way for everyone on it.",
    proof: [
      "Quak Travel: the services, so four of us shared one environment.",
      "Rainfall Learning: the same, across the engineering team.",
    ],
  },
  Kubernetes: {
    icon: "kubernetes",
    use: "Running work across a cluster rather than on a box.",
    proof: [
      "athenahealth: checkpointed jobs generating 722M rows, across 30 contexts.",
      "athenahealth: hosting the Consumer Data Index.",
    ],
  },
  Terraform: {
    icon: "terraform",
    use: "Infrastructure as code, so a cloud setup can be reviewed and rebuilt.",
    proof: [
      "athenahealth: every piece of cloud infrastructure I was given.",
      "athenahealth: the auto-scaling that took EC2 from 10 instances to about 4.",
    ],
  },
  Jenkins: {
    icon: "jenkins",
    use: "Build and deploy pipelines.",
    proof: [
      "athenahealth: the CI/CD pipeline shipping the Consumer Data Index to EKS.",
    ],
  },
  Grafana: {
    icon: "grafana",
    use: "Dashboards for watching a service once it is running.",
    proof: [
      "athenahealth: 34 panels over 8 microservices, the team's first centralised monitoring.",
    ],
  },
  Prometheus: {
    icon: "prometheus",
    use: "Collecting the metrics a dashboard is drawn from.",
    proof: [
      "athenahealth: scraping AWS and Spring Boot Actuator to feed the Grafana panels.",
    ],
  },
  JMeter: {
    icon: "jmeter",
    use: "Load testing, to find out what a system does under traffic.",
    proof: [
      "athenahealth: the web API at 2,500 concurrent threads, to prove the auto-scaling held.",
    ],
  },

  Express: {
    icon: "express",
    use: "My usual answer when something needs a backend.",
    proof: [
      "Quak Travel: the booking and payment-splitting APIs.",
      "Rainfall Learning: checkout and the Stripe webhooks.",
      "NUHire: the backend for the hiring simulation.",
      "Electric Racing: the services behind FinishLine.",
    ],
  },
  Prisma: {
    icon: "prisma",
    use: "The ORM I reach for, so the schema and the types stay one thing.",
    proof: [
      "Quak Travel: the schema and the queries behind booking.",
      "Rainfall Learning: the data layer under the payment path.",
      "Northeastern Electric Racing: FinishLine's parts and reviews.",
    ],
  },
  "Spring Boot": {
    icon: "spring",
    use: "The framework around the Java services.",
    proof: [
      "athenahealth: Actuator endpoints exposing per-service metrics.",
      "OnTrack: the API the frontend talks to.",
    ],
  },
  ".NET": {
    icon: "dotnetcore",
    use: "The framework I write C# services in.",
    proof: [
      "Philips: the SDC Simulator's backend.",
      "Philips: the Event Notification configuration endpoints.",
    ],
  },
  Flask: {
    icon: "flask",
    use: "Small Python backends, where a framework should stay out of the way.",
    proof: [
      "RoadQuest: the service behind the AI-generated quests.",
      "CoDesign: the API the platform sits on.",
    ],
  },

  React: {
    icon: "react",
    use: "The library every interface I have built is made of.",
    proof: [
      "Philips: the SDC Simulator and PIC iX frontends.",
      "athenahealth: the Consumer Data Index.",
      "OnTrack, NUHire and FinishLine: the frontend on each.",
      "CoDesign and RoadQuest: the earlier ones, in JavaScript.",
    ],
  },
  "Next.js": {
    icon: "nextjs",
    use: "React with the routing and the rendering already decided.",
    proof: [
      "OnTrack: the whole frontend, routing and all.",
      "NUHire: the screens a hiring session is spent inside.",
    ],
  },
  Redux: {
    icon: "redux",
    use: "Shared state, where passing it down the tree stops scaling.",
    proof: [
      "Philips: device state in the SDC Simulator, where one change reaches five settings.",
    ],
  },
  HTML: {
    icon: "html5",
    use: "The markup under every interface here.",
    proof: [
      "Every project with a frontend, from CoDesign onwards.",
      "This site: a semantic plain read, so the whole thing works without the 3D.",
    ],
  },
  CSS: {
    icon: "css3",
    use: "Styling, mostly through Tailwind now.",
    proof: [
      "Every project with a frontend.",
      "This site: Tailwind v4 theme tokens, and the transition between its two readings.",
    ],
  },

  Redis: {
    icon: "redis",
    use: "Caching whatever gets asked for over and over.",
    proof: ["Quak Travel: hotel search, cutting query latency by up to 80%."],
  },
  Postman: {
    icon: "postman",
    use: "Trying an endpoint out before anything is wired to it.",
    proof: [
      "Quak Travel: the booking and payment routes.",
      "Rainfall Learning: the Stripe webhook path.",
    ],
  },
  Git: {
    icon: "git",
    use: "Version control, on everything, alone and in teams.",
    proof: [
      "Philips: pull requests across six repositories.",
      "Every project on this page, including the page.",
    ],
  },
  Jest: {
    icon: "jest",
    use: "Unit tests on the frontend.",
    proof: [
      "Philips: the logging UI, the tooltips and config propagation.",
      "Rainfall Learning: the frontend suite.",
    ],
  },
  Vitest: {
    icon: "vitest",
    use: "The test runner on anything built with Vite.",
    proof: [
      "Rainfall Learning: 91 tests around the payment path, across three API layers.",
      "Rainfall Learning: the routes driven through a real server with Supertest.",
    ],
  },
  JUnit: {
    icon: "junit",
    use: "Unit tests on the Java side.",
    proof: [
      "athenahealth: the tests around the Spring Boot services.",
      "OnTrack: the backend tests.",
      "Coursework: Object-Oriented Design.",
    ],
  },
};
