/**
 * One Telegram message per new visitor, and nothing kept.
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

/** Phone-sized: a couple of lines you can read from the lock screen. */
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

    if (!env.TG_TOKEN || !env.TG_CHAT || !env.SALT || !env.SEEN) return blank;

    const ip = request.headers.get("cf-connecting-ip") ?? "";
    const agent = request.headers.get("user-agent") ?? "";
    if (!ip) return blank;

    // Bots are most of the internet and none of them are news.
    if (/bot|crawl|spider|slurp|preview|headless|curl|wget/i.test(agent))
      return blank;

    const key = await fingerprint(ip, agent, env.SALT);

    // The notification is sent after the response, so the page
    // never waits on Telegram being up or slow.
    ctx.waitUntil(
      (async () => {
        if (await env.SEEN.get(key)) return;
        await env.SEEN.put(key, "1", { expirationTtl: WINDOW });
        // Telegram rather than ntfy, and the reason is worth
        // keeping. ntfy.sh meters anonymous publishing by the
        // address it comes from, and the address this comes from
        // is Cloudflare's - a pool shared with every other Worker
        // in the world, whose daily allowance strangers had spent
        // before the first test ran. Authenticating did not help
        // either: a free ntfy account's own allowance is zero, so
        // the 429 just moved from the pool to the account. Their
        // cheapest plan that works is five dollars a month.
        //
        // A Telegram bot has no shared quota, because the message
        // goes to a bot you own rather than through a public
        // service everybody shares.
        const sent = await fetch(
          `https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              chat_id: env.TG_CHAT,
              text: compose(url, request),
              disable_web_page_preview: true,
            }),
          },
        );
        // Said out loud, because the alternative is a notification
        // that silently never arrives and no way to find out why.
        // `wrangler tail` shows this, nothing here reaches the
        // visitor, and no secret is printed.
        if (!sent.ok) {
          console.log(`telegram refused: ${sent.status} ${await sent.text()}`);
        } else {
          console.log("telegram accepted it");
        }
      })().catch((err) => {
        // A notification that did not arrive is not worth a 500 to
        // a browser that is only being polite - but it is worth
        // saying so in the log.
        console.log(`telegram threw: ${err}`);
      }),
    );

    return blank;
  },
};
