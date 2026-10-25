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
