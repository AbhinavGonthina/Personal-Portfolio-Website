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
  seeking: "Open to full-time SWE",
  photo: "/headshot.webp",
  // Four headline technologies, all of them on the résumé.
  focus: ["AWS", "Terraform", "Spring Boot", "React"],
  // One sentence for the hoarding: who he is and what the work has
  // been in, in the order someone asks it. Shorter than `tagline`
  // and doing a different job - the tagline introduces him to a
  // reader who has sat down, this introduces him to someone who has
  // not stopped walking.
  pitch:
    "CS student at Northeastern, with experience across backend services, cloud infrastructure, and data pipelines at athenahealth and Philips.",
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
