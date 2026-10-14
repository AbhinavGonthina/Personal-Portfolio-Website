import { Box, Typography } from "@mui/material";
import Section from "../components/Section";
import MossBackdrop from "../components/MossBackdrop";
import Offering, {
  ResumeSheet,
  EnvelopeHeld,
  BranchCard,
  ProfileCard,
} from "../components/Offering";
import { palette, MONO, PINE } from "../theme";
import { profile, socials, RESUME_URL } from "../data/profile";

/**
 * The end of the page — there is no footer under this, so this section is the
 * last thing and sizes itself to one screen.
 *
 * Four hands come up out of the ground, each offering a different way of
 * getting hold of me. They are illustrations rather than buttons: the same
 * line work as the brick wall in the hero, and each holds a different object
 * so the row does not read as four copies of one drawing.
 */

const href = (icon) => socials.find((s) => s.icon === icon).href;

const OFFERINGS = [
  {
    key: "resume",
    href: RESUME_URL,
    caption: "Résumé",
    label: "View my résumé (opens a PDF in a new tab)",
    art: <ResumeSheet />,
  },
  {
    key: "email",
    href: href("email"),
    caption: "Email",
    label: `Email me at ${socials.find((s) => s.icon === "email").value}`,
    art: <EnvelopeHeld />,
  },
  {
    key: "github",
    href: href("github"),
    caption: "GitHub",
    label: "My GitHub profile (opens in a new tab)",
    art: <BranchCard />,
  },
  {
    key: "linkedin",
    href: href("linkedin"),
    caption: "LinkedIn",
    label: "My LinkedIn profile (opens in a new tab)",
    art: <ProfileCard />,
  },
];

export default function Connect() {
  return (
    <Section
      id="connect"
      eyebrow="Connect"
      title="Let's talk"
      intro="Open to new-grad and internship roles, and always happy to talk about infrastructure, backend systems, or anything growing in a terminal."
      grow
      decor={<MossBackdrop />}
      aside={
        <Box
          sx={{
            fontFamily: MONO,
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            color: PINE,
            opacity: 0.75,
            whiteSpace: "nowrap",
          }}
        >
          [ {profile.location.toUpperCase()} ]
        </Box>
      }
    >
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* `mt: auto` drops the row onto the floor of the section, which is
            what Section's `grow` prop exists to allow. Zero column gap so the
            ground segments tile into one continuous surface. */}
        <Box
          sx={{
            mt: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            columnGap: 0,
            rowGap: { xs: 4, md: 0 },
            alignItems: "end",
          }}
        >
          {OFFERINGS.map((o, i) => (
            <Offering
              key={o.key}
              href={o.href}
              caption={o.caption}
              label={o.label}
              index={i}
            >
              {o.art}
            </Offering>
          ))}
        </Box>

        {/* What used to be the footer, now buried under the ground the hands
            come out of. */}
        <Typography
          sx={{
            mt: 3,
            textAlign: "center",
            fontSize: "0.75rem",
            color: palette.muted,
            opacity: 0.8,
          }}
        >
          © {new Date().getFullYear()} {profile.name} — built with React and
          MUI.
        </Typography>
      </Box>
    </Section>
  );
}
