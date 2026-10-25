/**
 * One push notification per new visitor, and nothing kept.
 *
 * GoatCounter does the dashboard - history, referrers, countries -
 * and has no way to tell you something happened. This does only
 * the telling. The page pings both; they do not know about each
 * other.
 *
 * The whole reason this exists rather than living in the page is
 * that the browser cannot answer the question. "Has this person
 * been here in the last eight hours" needs something that sees
 * the same visitor twice, and `localStorage` is per browser
 * profile: a private window, a cleared cache or a second device
 * all look like somebody new, and two people on one office
 * connection look like one. Only something in front of the
 * request can tell.
 *
 * What it does with the address it can see:
 *
 *   1. Hashes it, together with the user agent and a secret salt,
 *      into 128 bits of hex.
 *   2. Looks that hex up in a store where every key expires after
 *      eight hours.
 *   3. If it was there, stops. If it was not, writes it and sends
 *      one notification.
 *
 * The address exists for the microseconds between reading the
 * header and hashing it. It is never written to the store, never
 * logged, never put in the notification. The hash cannot be
 * walked backwards without the salt, and the salt is a secret
 * that lives in the Worker and not in this repository.
 *
 * Deploying it is in README.md next door.
 */

/** Eight hours, which is how long a visitor stays the same person. */
const WINDOW = 8 * 60 * 60;

/** Hex of SHA-256, first 32 characters. Plenty to not collide. */
async function fingerprint(ip, agent, salt) {
  const bytes = new TextEncoder().encode(`${salt}|${ip}|${agent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Phone-sized: a line you can read from the lock screen. */
function compose(url, request) {
  const page = url.searchParams.get("p") || "/";
  const from = url.searchParams.get("r") || "";
  const country = request.cf?.country ?? "??";
  const city = request.cf?.city ?? "";
  const where = city ? `${city}, ${country}` : country;

  let how = "typed it in or has it bookmarked";
  if (from) {
    try {
      how = `came from ${new URL(from).hostname}`;
    } catch {
      how = `came from ${from.slice(0, 60)}`;
    }
  }
  return `${where} — ${how}\n${page}`;
}

export default {
  async fetch(request, env, ctx) {
    // Nothing to say to anything but a beacon, and nothing to
    // return to it either: the page is not waiting on this.
    const url = new URL(request.url);
    const blank = new Response(null, {
      status: 204,
      headers: {
        "cache-control": "no-store",
        // The page sends this as an image, which needs no CORS at
        // all, but allowing it costs nothing and means a `fetch`
        // would work too.
        "access-control-allow-origin": "*",
      },
    });

    if (!env.NTFY_TOPIC || !env.SALT || !env.SEEN) return blank;

    const ip = request.headers.get("cf-connecting-ip") ?? "";
    const agent = request.headers.get("user-agent") ?? "";
    if (!ip) return blank;

    // Bots are most of the internet and none of them are news.
    if (/bot|crawl|spider|slurp|preview|headless|curl|wget/i.test(agent))
      return blank;

    const key = await fingerprint(ip, agent, env.SALT);

    // The notification is sent after the response, so the page
    // never waits on ntfy being up or slow.
    ctx.waitUntil(
      (async () => {
        if (await env.SEEN.get(key)) return;
        await env.SEEN.put(key, "1", { expirationTtl: WINDOW });
        await fetch(`https://ntfy.sh/${env.NTFY_TOPIC}`, {
          method: "POST",
          body: compose(url, request),
          headers: {
            Title: "Someone is on your site",
            Tags: "wave",
            Priority: "default",
            Click: "https://abhinavgonthina.dev",
          },
        });
      })().catch(() => {
        // A notification that did not arrive is not worth a 500 to
        // a browser that is only being polite.
      }),
    );

    return blank;
  },
};
