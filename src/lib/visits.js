/**
 * Counting visits, with no third-party script on the page.
 *
 * GitHub Pages tells you nothing about who came, so this is the
 * only way to know whether anybody is reading it. Every hosted
 * analytics service hands you a `<script>` to paste into the head,
 * and pasting one back in would undo the thing this site spent a
 * day on: the Google Fonts tag that was removed was a third-party
 * request in the head that blocked the first paint, and a tracker
 * is the same shape.
 *
 * So no script. GoatCounter documents its `/count` endpoint as a
 * plain tracking pixel, guaranteed to stay compatible, and that is
 * all this is - one image request, fired once, after the page has
 * finished loading. Nothing is downloaded, nothing is parsed,
 * nothing runs again.
 *
 *   https://www.goatcounter.com/help/pixel
 *
 * No cookies, so no consent banner, and nothing here can identify
 * anyone: the request carries the path, the title, the referrer
 * and the screen size, and GoatCounter does the counting.
 */

/**
 * The GoatCounter site code, as in `https://CODE.goatcounter.com`.
 *
 * Empty until the account exists, and empty means this does
 * nothing at all - no request, no error, no console noise. Sign up
 * at goatcounter.com, which is free for a personal site, and put
 * the code you chose here.
 */
const SITE = "";

/** Where the pixel lives, once there is a site to send it to. */
const endpoint = () => `https://${SITE}.goatcounter.com/count`;

/**
 * Whether this visit should be counted at all.
 *
 * Not from a developer's own machine, which would otherwise be
 * most of the traffic, and not from anybody who has asked not to
 * be followed around. `doNotTrack` is widely ignored and honouring
 * it costs nothing.
 */
function wanted() {
  if (!SITE) return false;
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (!host || host === "localhost" || host === "127.0.0.1" || host === "[::1]")
    return false;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return false;
  return true;
}

/**
 * One pixel, once, after everything else.
 *
 * Fired on `load` rather than at import, so it is never in front
 * of a font, a chunk or the first frame of the town. If the page
 * has already loaded by the time this runs, it goes immediately.
 */
export function countVisit() {
  if (!wanted()) return;

  const send = () => {
    const q = new URLSearchParams({
      p: window.location.pathname,
      t: document.title,
      r: document.referrer,
      s: [screen.width, screen.height, window.devicePixelRatio || 1].join(","),
      // Documented as ignored, and there to stop a proxy or a
      // browser serving the same pixel out of cache instead of
      // asking for it again.
      rnd: Math.random().toString(36).slice(2),
    });
    // An `Image` rather than `fetch`: no CORS preflight to satisfy,
    // no promise to leave unhandled, and a failure is silent, which
    // is the right outcome for something nobody is waiting on.
    new Image().src = `${endpoint()}?${q}`;
  };

  if (document.readyState === "complete") send();
  else window.addEventListener("load", send, { once: true });
}
