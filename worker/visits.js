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

/**
 * How long a visitor is remembered well enough to be recognised.
 *
 * Longer than the window above, which exists only to stop one
 * person being announced twice in a morning. This one is so the
 * message can say whether somebody has been before, and it is the
 * same hash either way - no new fact about anyone is written down
 * to make it work, only the one already being written is kept for
 * longer.
 */
const MEMORY = 90 * 24 * 60 * 60;

/** 1st, 2nd, 3rd, 4th. */
const nth = (n) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return n + (["th", "st", "nd", "rd"][n % 10] ?? "th");
};

/**
 * Networks nobody reads a portfolio from.
 *
 * Clouds, hosts and the companies that scan the internet for a
 * living. Matched against the network name Cloudflare attaches to
 * the request, so it does not care what the browser calls itself.
 *
 * Add to it freely - `wrangler tail` prints the name of anything
 * this turns away, and the name of anything it lets through, so a
 * new source of noise takes one line to silence.
 *
 * One known cost: somebody browsing through Cloudflare WARP, or
 * any VPN that exits from a data centre, looks like a machine from
 * here and will not be reported. That is the price of not being
 * woken by crawlers, and it is the right way round.
 */
const MACHINES =
  /amazon|aws|google|microsoft|azure|digitalocean|linode|oracle|alibaba|tencent|baidu|huawei|bytedance|ovh|hetzner|scaleway|vultr|contabo|leaseweb|choopa|m247|datacamp|gcore|stackpath|cdn77|hostinger|namecheap|godaddy|ionos|rackspace|equinix|censys|shodan|netcraft|zscaler|palo alto|internet measurement|digital ocean|host|server|cloud|data ?cent|colo|vpn|proxy/i;

/**
 * The three networks a Mac or an iPhone comes out of, and why they
 * are not in the list above.
 *
 * Akamai, Cloudflare and Fastly were in it, and that was a bug with
 * a very specific victim: everybody browsing from Safari with iCloud
 * Private Relay on. Private Relay is two hops - Apple takes the
 * first and hands the second to one of exactly these three, so the
 * address the Worker sees belongs to Cloudflare or Akamai or Fastly
 * and the person it belongs to is sitting on a sofa. Anyone with
 * iCloud+ has it, Safari turns it on by default, and it is the
 * single most likely way a real reader arrives here. They were being
 * dropped in silence, which is the worst way to be wrong: the log
 * said "skipped a machine on Cloudflare" and it was a friend.
 *
 * So these three are let through, and the cost is the other thing
 * they are: CDNs, which a crawler can also rent. The arithmetic is
 * not close. A crawler that slips past is one notification nobody
 * needed; a reader who does not is the entire point of this file,
 * and there is no second place to go and check. The notification
 * says `via relay` so the two can be told apart by eye.
 *
 *   https://blog.apnic.net/2023/01/25/an-investigation-into-apples-new-relay-network/
 */
const RELAYS = /akamai|cloudflare|fastly/i;

/** Hex of SHA-256, first 32 characters. Plenty to not collide. */
async function fingerprint(ip, agent, salt) {
  const bytes = new TextEncoder().encode(`${salt}|${ip}|${agent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Phone-sized: a few lines you can read from the lock screen. The
 * visitor's tag and count are appended by the caller.
 */
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
    //
    // Two tests, because one was not enough. The user agent catches
    // the ones that say what they are, and plenty do not: the first
    // night this ran live it reported visitors from Ashburn,
    // Council Bluffs, Moses Lake and Amsterdam, every one of them
    // with no referrer and every one of them on `/`. Those are not
    // towns people live in, they are towns data centres live in -
    // Council Bluffs has sixty thousand residents and one very
    // large Google building - and the traffic was crawlers,
    // scanners and link previewers wearing an ordinary Chrome
    // string. They run JavaScript too, which is why the beacon
    // fired at all.
    //
    // So the second test asks who owns the address rather than
    // what the browser claims to be. Cloudflare hands the Worker
    // the network's name, and a visit from Amazon or Google or
    // Hetzner is a machine - people read websites from their phone
    // network or their home provider, not from a rack.
    if (/bot|crawl|spider|slurp|preview|headless|curl|wget|python|axios|http-client|monitor|uptime|scan/i.test(agent))
      return blank;

    const net = request.cf?.asOrganization ?? "";
    // Checked before the blocklist, not after, so a relay keeps its
    // pass even if its name happens to contain one of the loose
    // words up there - "cloud", "host" and "server" all match more
    // company names than they were meant to.
    const relayed = RELAYS.test(net);
    if (!relayed && MACHINES.test(net)) {
      console.log(`skipped a machine on ${net}`);
      return blank;
    }

    const key = await fingerprint(ip, agent, env.SALT);

    // The notification is sent after the response, so the page
    // never waits on Telegram being up or slow.
    ctx.waitUntil(
      (async () => {
        if (await env.SEEN.get(key)) return;
        await env.SEEN.put(key, "1", { expirationTtl: WINDOW });

        // How many times this one has turned up, ever - or at
        // least within the ninety days the count is kept for. The
        // tag is the first six characters of the same hash, which
        // is a name for a visitor that means nothing to anybody
        // but you and cannot be turned back into an address.
        const been = Number((await env.SEEN.get(`n:${key}`)) ?? 0) + 1;
        await env.SEEN.put(`n:${key}`, String(been), {
          expirationTtl: MEMORY,
        });
        // `via relay` is the honest caveat on the two lines above
        // it. Private Relay gives the exit's city rather than the
        // reader's, so "Los Angeles" may mean nothing more than
        // which Cloudflare door Apple opened, and the tag is per
        // exit rather than per person. Worth saying on the message
        // itself, because the alternative is reading a location
        // off a lock screen and believing it.
        const who =
          `#${key.slice(0, 6)} · ${been === 1 ? "first time" : nth(been) + " visit"}` +
          (relayed ? " · via relay" : "");
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
              text: `${compose(url, request)}
${who}`,
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
          console.log(`telegram accepted it (${net || "unknown network"})`);
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
