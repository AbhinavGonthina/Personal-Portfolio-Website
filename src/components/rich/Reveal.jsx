import { motion, useReducedMotion } from "motion/react";

/**
 * Blur-fade on arrival, which is the one motion the whole rich
 * read shares.
 *
 * Magic UI calls this BlurFade and Aceternity reaches for the same
 * shape: a short rise with the blur coming off as it lands. It is
 * two animated properties on one element and it runs once, so a
 * page with forty of them costs forty short transitions and then
 * nothing at all.
 *
 * `once`, and with a margin that starts it slightly before the
 * element is in view - a reveal that waits until something is
 * properly on screen is a reveal the reader watches happen instead
 * of simply finding the page already there.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 14,
  blur = 6,
  className,
  as = "div",
}) {
  const still = useReducedMotion();
  const Tag = motion[as] ?? motion.div;
  if (still) return <div className={className}>{children}</div>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
