# Visit notifications

A Cloudflare Worker that sends one Telegram message the first
time a visitor appears, and nothing for the next eight hours.

It is separate from the site's build. Nothing in `npm run build`
touches it, and the site works whether or not it is deployed.

## Why there is a server at all

The eight-hour window cannot be done in the browser.
`localStorage` is per browser profile, so a private window, a
cleared cache or a second device all look like a new person, and
two people on one office connection look like one. Only something
in front of the request can tell.

What it does with the address it can see: hashes it with the user
agent and a secret salt, looks the hash up in a store where keys
expire after eight hours, and notifies if it was not there. The
address is never stored, never logged and never included in the
notification. See the comment at the top of `visits.js`.

## Setting it up

**1. Make a bot.**

Message [@BotFather](https://t.me/BotFather) on Telegram, send
`/newbot`, and answer its two questions. It replies with a token
that looks like `8123456789:AAG...`. That token is the bot.

**2. Start a chat with your own bot.**

Open the link BotFather gives you and press Start, or just send it
any message. A bot cannot message you first, so without this step
everything else works and nothing arrives.

**3. Find your chat id.**

Open this in a browser, with your token in place of `TOKEN`:

```
https://api.telegram.org/botTOKEN/getUpdates
```

Look for `"chat":{"id":123456789`. That number is the chat id. If
the response is empty, step 2 did not happen.

**4. Create the store.**

```sh
cd worker
npx wrangler kv namespace create SEEN
```

Paste the id it prints into `wrangler.toml`.

**5. Set the three secrets.**

```sh
npx wrangler secret put TG_TOKEN   # from step 1
npx wrangler secret put TG_CHAT    # from step 3
npx wrangler secret put SALT       # any long random string
```

None are in this repository, and the salt is what stops a hash
being walked back to an address.

**6. Deploy.**

```sh
npx wrangler deploy
```

It prints a URL like `https://visits.<you>.workers.dev`.

**7. Point the site at it.**

Put that URL in `PING` at the top of `src/lib/visits.js`, then
build and deploy the site as usual.

## Who gets filtered out

Crawlers are most of the traffic and none of it is news, so two
tests run before anything is sent: the user agent, and the name of
the network the address belongs to. A visit from Amazon or Hetzner
is a machine.

Three networks are deliberately exempt from that: Akamai,
Cloudflare and Fastly. They are CDNs, so by the rule above they
look like machines, and they are also the three companies Apple
hands the second hop of iCloud Private Relay to. Anybody reading
this from Safari with iCloud+ comes out of one of them. They were
in the blocklist at first, which meant the most likely kind of real
reader was the one kind guaranteed to be dropped, and dropped in
silence. Those visits now arrive marked `via relay`.

The marker matters for reading the message, not just for counting
it. A relayed visit reports the exit's city and not the reader's,
so the location on one of those is Apple's choice of door.

The cost of the exemption is that a crawler renting a CDN gets
through. That is one notification too many, against a reader who
would otherwise never have been mentioned at all.

Still turned away, and worth knowing: anything coming out of a VPN
or a corporate network that exits from a data centre. That is the
price of not being woken by scanners.

## Why not ntfy

It was ntfy first, and it does not work from here. ntfy.sh meters
anonymous publishing by the address it comes from, and a Worker
comes from Cloudflare's shared pool - the day's allowance was
already spent by strangers before the first test ran, and the
reply was a 429 that had nothing to do with this site.

Authenticating did not help: with a token the message is counted
against the account instead of the pool, and a free ntfy
account's allowance is zero. The cheapest plan that works is five
dollars a month. A Telegram bot has no shared quota, because the
message goes to a bot you own.

## Turning it off

Clear `PING` in `src/lib/visits.js` and redeploy the site, or
`npx wrangler delete` the Worker. Either is enough on its own.

## What it costs

Nothing. Cloudflare's free tier is 100,000 Worker requests and
100,000 KV reads a day, and Telegram bots are free.
