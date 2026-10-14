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
