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
 * `proof` is the specific answer: where, and what the work was, as
 * a bulleted list down the left, because a list set centred is a
 * list nobody can scan. Every skill carries both - on its own the
 * sentence is a claim and the list is a CV extract.
 *
 * Written for somebody who has not read the CV, which is everybody
 * pointing at this board. A bullet that says "athenahealth: the
 * Consumer Data Index" is a line only he can read; what it has to
 * say is what the thing was and what it was for. The same goes for
 * a number on its own - "10 to 4 EC2 instances" means something
 * once you are told that servers were running at full size all
 * night for a load that came in the daytime.
 *
 * Three bullets at most. The panel is 820 by 1000 and a fourth
 * two-line entry runs off the bottom of it, which is the real
 * constraint behind the editing here - where a skill has been used
 * in more places than that, the extra ones are named inside a
 * bullet rather than given one.
 */
export const skillDetail = {
  JavaScript: {
    icon: "javascript",
    use: "What my first React work was written in, before I moved to TypeScript.",
    proof: [
      "CoDesign, a Fiverr-style site for student designers: posts, profiles and matchmaking.",
      "RoadQuest, a road-trip game built in a day at a hackathon: the whole frontend.",
    ],
  },
  TypeScript: {
    icon: "typescript",
    use: "What I write every React project in now.",
    proof: [
      "Quak Travel, a group-travel startup: the booking and cost-splitting APIs.",
      "Philips: the simulator that stands in for hospital bedside monitors.",
      "Rainfall Learning, a student tutoring platform: checkout and the payments behind it.",
    ],
  },
  Python: {
    icon: "python",
    use: "Data work, and the maths-heavy coursework.",
    proof: [
      "athenahealth: a generator that filled the test databases with about 722 million rows, so teams could test against something the size of the real thing.",
      "Coursework: Machine Learning, and Data Science.",
    ],
  },
  Java: {
    icon: "java",
    use: "Backend services, where the work wants a type system under it.",
    proof: [
      "OnTrack, a job application tracker: the backend behind it.",
      "athenahealth: the per-service health numbers the monitoring dashboard reads.",
      "Coursework: Object-Oriented Design.",
    ],
  },
  SQL: {
    icon: "azuresqldatabase",
    use: "Usually through a library that writes it for me, by hand where the query is the point.",
    proof: [
      "OnTrack: working out how many job applications get from one stage of the pipeline to the next.",
      "athenahealth: loading hundreds of millions of test rows into Oracle, across 30 environments.",
      "Coursework: Intro to Databases.",
    ],
  },
  "C#": {
    icon: "csharp",
    use: "The language I write .NET services in.",
    proof: [
      "Philips: the backend of the bedside monitor simulator - what each fake device is doing, and streaming its readings out.",
      "Philips: configuring a whole fleet of those devices at once rather than one at a time.",
    ],
  },
  C: {
    icon: "c",
    use: "Systems work, close enough to the machine to see it.",
    proof: [
      "Computer Systems: a working Unix shell, and the memory allocator underneath a program rather than the program.",
      "Computer Systems: concurrent sorting, and changes inside xv6, a small teaching operating system.",
    ],
  },
  "C++": {
    icon: "cplusplus",
    use: "Object-oriented work in a compiled language.",
    proof: [
      "Intro to Programming in C++: classes, inheritance and polymorphism.",
    ],
  },

  "AWS (ECS, EKS, S3, EC2)": {
    icon: "amazonwebservices",
    use: "The cloud every piece of infrastructure work I have done runs on.",
    proof: [
      "athenahealth: the containers and the virtual machines a platform team's services run on.",
      "athenahealth: the clusters behind the big data jobs, and the storage they backed up to.",
      "Coursework: Cloud Computing.",
    ],
  },
  Docker: {
    icon: "docker",
    use: "Containers, so a project runs the same way for everyone on it.",
    proof: [
      "Quak Travel: packaging the services, so the team ran one environment rather than four slightly different ones.",
      "Rainfall Learning: the same, across the engineers building checkout.",
    ],
  },
  Kubernetes: {
    icon: "kubernetes",
    use: "Running work across a cluster rather than on one machine.",
    proof: [
      "athenahealth: splitting the 722-million-row generation into jobs that could pick up where they left off if one died.",
      "athenahealth: running an internal data app on a cluster.",
    ],
  },
  Terraform: {
    icon: "terraform",
    use: "The cloud setup written down as files, so it can be rebuilt from nothing.",
    proof: [
      "athenahealth: every piece of cloud infrastructure I was given was written this way.",
      "The auto-scaling, for one: ten servers ran all night for a load that only came in the day. Now they start and stop with it - about four on average, and $5,000 a year saved.",
    ],
  },
  Jenkins: {
    icon: "jenkins",
    use: "The pipeline that builds a change and puts it where it runs.",
    proof: [
      "athenahealth: building an internal data app and shipping it to its cluster whenever the code changed.",
    ],
  },
  Grafana: {
    icon: "grafana",
    use: "Dashboards for watching a service once it is running.",
    proof: [
      "athenahealth: the team's first shared dashboard - 34 panels over 8 services, so what was failing could be seen rather than asked about.",
    ],
  },
  Prometheus: {
    icon: "prometheus",
    use: "Collecting the numbers a dashboard is drawn from.",
    proof: [
      "athenahealth: the collector behind that dashboard, pulling readings out of the cloud services and the Java ones every few seconds.",
    ],
  },
  JMeter: {
    icon: "jmeter",
    use: "Load testing: finding out what a system does under traffic before the traffic is real.",
    proof: [
      "athenahealth: 2,500 requests at once against a web API in a test environment, to prove the auto-scaling reacted before anything fell over.",
    ],
  },

  Express: {
    icon: "express",
    use: "My usual answer when something needs a backend.",
    proof: [
      "Quak Travel: booking a hotel for a group, and splitting what it cost between them.",
      "Rainfall Learning: checkout, and the endpoint Stripe calls to say a payment went through.",
      "Northeastern Electric Racing: the services behind the app the race team runs its engineering on.",
    ],
  },
  Prisma: {
    icon: "prisma",
    use: "The layer between the code and the database, so the schema and the types in front of it stay one thing.",
    proof: [
      "Quak Travel: the schema and the queries behind booking.",
      "Rainfall Learning: the data under the payment path.",
      "Northeastern Electric Racing: the parts and reviews in the team's engineering app.",
    ],
  },
  "Spring Boot": {
    icon: "spring",
    use: "The framework around the Java services.",
    proof: [
      "OnTrack: the API behind the job tracker.",
      "athenahealth: the endpoints that hand each service's own health numbers to the dashboard.",
    ],
  },
  ".NET": {
    icon: "dotnetcore",
    use: "The framework I write C# services in.",
    proof: [
      "Philips: the backend of the simulator that stands in for hospital bedside monitors.",
      "Philips: the endpoints behind configuring many of those devices at once.",
    ],
  },
  Flask: {
    icon: "flask",
    use: "Small Python backends, where a framework should stay out of the way.",
    proof: [
      "PrepIt: the backend that sends a resume and a job description to the agent and streams the report back.",
      "RoadQuest: the service that turned a route into a set of quests to do along it.",
      "CoDesign: the API the platform sits on.",
    ],
  },

  React: {
    icon: "react",
    use: "The library every interface I have built is made of.",
    proof: [
      "Philips: the interface for a simulator standing in for hospital bedside monitors, and a live view of what those devices were doing.",
      "athenahealth: an internal app pulling scattered service data into one place.",
      "OnTrack, NUHire and Northeastern Electric Racing's engineering app: the frontend on each.",
    ],
  },
  "Next.js": {
    icon: "nextjs",
    use: "React with the routing and the rendering already decided.",
    proof: [
      "OnTrack: the whole frontend of the job tracker, routing and all.",
      "NUHire: the screens a hiring session is spent inside.",
    ],
  },
  Redux: {
    icon: "redux",
    use: "Shared state, where passing it down through every component stops scaling.",
    proof: [
      "Philips: what every simulated device is doing at once, so changing one setting updates the five places that depend on it.",
    ],
  },
  HTML: {
    icon: "html5",
    use: "The markup under every interface here.",
    proof: [
      "Every project on this site with a frontend.",
      "This site: the plain reading is ordinary marked-up text, so the whole thing works with the 3D town switched off.",
    ],
  },
  CSS: {
    icon: "css3",
    use: "Styling, mostly through Tailwind now.",
    proof: [
      "Every project on this site with a frontend.",
      "This site: one file holds the colour and type scale, and the move between its two readings is written in it.",
    ],
  },

  Redis: {
    icon: "redis",
    use: "Keeping hold of whatever gets asked for over and over, so it is not worked out twice.",
    proof: [
      "Quak Travel: hotel search results for the places people actually search for, which cut the wait by up to 80%.",
    ],
  },
  Postman: {
    icon: "postman",
    use: "Trying an endpoint out by hand before anything is wired to it.",
    proof: [
      "Quak Travel: the booking and payment endpoints, before there was a frontend to call them.",
      "Rainfall Learning: the endpoint Stripe calls back on.",
    ],
  },
  Git: {
    icon: "git",
    use: "Version control, on everything, alone and in teams.",
    proof: [
      "Philips: work spread across six repositories, reviewed by the team before any of it merged.",
      "Every project on this page, including this page.",
    ],
  },
  Jest: {
    icon: "jest",
    use: "Unit tests on the frontend.",
    proof: [
      "Philips: the live log view, the help tooltips on the alarm settings, and pushing one setting out to many devices.",
      "Rainfall Learning: the frontend tests.",
    ],
  },
  Vitest: {
    icon: "vitest",
    use: "The test runner on anything built with Vite.",
    proof: [
      "Rainfall Learning: 91 tests around the payment path, because payment code that is wrong tends to be wrong quietly.",
      "Those run against a real server, through Supertest, rather than a stand-in for one.",
    ],
  },
  JUnit: {
    icon: "junit",
    use: "Unit tests on the Java side.",
    proof: [
      "athenahealth: the tests around the Java services.",
      "OnTrack: the backend tests.",
      "Coursework: Object-Oriented Design.",
    ],
  },
};
