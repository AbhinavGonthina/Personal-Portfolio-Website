// Single source of truth for identity + contact.
// Phone number is deliberately excluded from this site.
export const profile = {
  name: "Abhinav Gonthina",
  role: "Software Engineer",
  location: "Boston, MA",
  tagline:
    "CS student at Northeastern building backend systems and the interfaces on top of them. Most recently at athenahealth, where I worked on AWS infrastructure, data pipelines, and observability.",
  // One line on the landing page saying what is happening right now.
  // Short enough to read at a glance; update it when it stops being true.
  //
  // This used to say "Summer 2027 internships", which cannot be true
  // alongside a graduation date of April 2027 - the summer after it is
  // the first summer there is no degree left to go back to.
  currently:
    "Building OnTrack, and looking for full-time software engineering roles.",
  // The same ask in the fewest words that still carry it, for the
  // hoarding, where there is no room for a sentence.
  seeking: "Post-grad SWE roles",
  photo: "/headshot.webp",
  // Four headline technologies, all of them on the résumé.
  focus: ["AWS", "Terraform", "Spring Boot", "React"],
  // The board's own introduction, in the first person, because a
  // hoarding with a face on it is the one surface here that is
  // allowed to say hello. Shorter than `tagline` and doing a
  // different job: the tagline introduces him to a reader who has
  // sat down, this one to someone who has not stopped walking.
  // Two sentences, and the board breaks the line between them
  // rather than wrapping them into one block: the first says who he
  // is, the second says what he does, and they are easier to take
  // in as two things than as a paragraph with a full stop in it.
  pitch: [
    "Hi, I'm Abhi, an Honors CS student at Northeastern University with industry experience scaling from small startups to global enterprises.",
    "My expertise is in full-stack development, having also worked with AWS infra, DevOps tooling, and data pipelines.",
  ],
};

// Three things link to this now (hero button, footer socials, the hand that
// offers it), so it lives in one place rather than being pasted around.
export const RESUME_URL =
  "https://drive.google.com/file/d/1mmaNnu9ERCRxq-6wIewLTS-31G37Ce_p/view?usp=sharing";

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
    href: RESUME_URL,
    icon: "resume",
  },
];
