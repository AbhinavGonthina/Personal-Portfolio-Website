import { useState } from "react";

/**
 * The way back to the site that replaced this one.
 *
 * This build is reachable from the live site in two places - the
 * footer, and a line painted on the pavement by the mailboxes in
 * the 3D town - so anyone who lands here got here on purpose and
 * needs one obvious way out. Without it the only way back is the
 * browser's back button, and anyone who opened this in a new tab
 * does not have one.
 *
 * Fixed in the corner rather than added to the bar. The bar is
 * already full at desktop width and turns into a drawer below it,
 * so a seventh thing in it would be a layout change to an archive
 * - and the point of an archive is that it still looks like what
 * it looked like. This sits over the top of it instead and touches
 * nothing.
 *
 * Written with plain styles, not MUI, for the same reason: it is
 * not part of the old site, so it does not go through the old
 * site's theme.
 */

// The current site, which this one is published underneath at
// /legacy/. Absolute, so it is right from any scroll position and
// from the sub-paths the router can produce.
const CURRENT = "/";

const SHELL = {
  position: "fixed",
  right: "clamp(12px, 2.5vw, 28px)",
  bottom: "clamp(12px, 2.5vw, 28px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 16px",
  borderRadius: "999px",
  border: "1px solid rgba(30, 144, 255, 0.45)",
  background: "rgba(0, 0, 0, 0.82)",
  backdropFilter: "blur(6px)",
  color: "#ffffff",
  font: "inherit",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.02em",
  lineHeight: 1,
  textDecoration: "none",
  cursor: "pointer",
  boxShadow: "0 6px 24px rgba(0, 0, 0, 0.45)",
  transition: "border-color 0.33s ease, color 0.33s ease, transform 0.33s ease",
};

const HOVER = {
  borderColor: "#1E90FF",
  color: "#1E90FF",
  transform: "translateY(-2px)",
};

export default function BackToCurrent() {
  const [over, setOver] = useState(false);

  return (
    <a
      href={CURRENT}
      style={over ? { ...SHELL, ...HOVER } : SHELL}
      onMouseEnter={() => setOver(true)}
      onMouseLeave={() => setOver(false)}
      onFocus={() => setOver(true)}
      onBlur={() => setOver(false)}
    >
      <span aria-hidden style={{ fontSize: "15px", lineHeight: 1 }}>
        &larr;
      </span>
      {/* Says which one it is going to, not "back". Somebody who
          opened this in a new tab has nothing to go back to, and
          somebody who has never seen the new site needs telling
          that there is one. */}
      Back to the current site
    </a>
  );
}
