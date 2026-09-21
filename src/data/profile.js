// Single source of truth for identity + contact.
// Phone number is deliberately excluded from this site.
export const profile = {
  name: "Abhinav Gonthina",
  role: "Software Engineer",
  location: "Boston, MA",
  tagline:
    "CS student at Northeastern building backend systems and the interfaces on top of them. Most recently at athenahealth, where I worked on AWS infrastructure, data pipelines, and observability.",
  photo: "/headshot.webp",
  // Four headline technologies, all of them on the résumé.
  focus: ["AWS", "Terraform", "Spring Boot", "React"],
};

export const socials = [
  {
    name: "GitHub",
    value: "AbhinavGonthina",
    href: "https://github.com/AbhinavGonthina",
    icon: "github",
  },
  {
    name: "LinkedIn",
    value: "Abhinav Gonthina",
    href: "https://linkedin.com/in/abhinavgonthina",
    icon: "linkedin",
  },
  {
    name: "Email",
    value: "gonthina.a@northeastern.edu",
    href: "mailto:gonthina.a@northeastern.edu",
    icon: "email",
  },
  {
    name: "Resume",
    value: "View PDF",
    href: "https://drive.google.com/file/d/1mmaNnu9ERCRxq-6wIewLTS-31G37Ce_p/view?usp=sharing",
    icon: "resume",
  },
];
