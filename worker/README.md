# Visit notifications

A Cloudflare Worker that sends one phone notification the first
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

**1. Pick an ntfy topic and install the app.**

Install [ntfy](https://ntfy.sh) on your phone and subscribe to a
topic. Treat the name like a password: ntfy topics are a shared
public namespace, so anyone who guesses yours can read your
notifications. Something like `abhi-site-8f3a91c2` rather than
`abhi-visits`.

**2. Create the store.**

```sh
cd worker
npx wrangler kv namespace create SEEN
```

Paste the id it prints into `wrangler.toml`.

**3. Set the two secrets.**

```sh
npx wrangler secret put NTFY_TOPIC     # the topic from step 1
npx wrangler secret put SALT           # any long random string
```

Neither is in this repository, and the salt is what stops a hash
being walked back to an address.

**4. Deploy.**

```sh
npx wrangler deploy
```

It prints a URL like `https://visits.<you>.workers.dev`.

**5. Point the site at it.**

Put that URL in `PING` at the top of `src/lib/visits.js`, then
build and deploy the site as usual.

## Turning it off

Clear `PING` in `src/lib/visits.js` and redeploy the site, or
`npx wrangler delete` the Worker. Either is enough on its own.

## What it costs

Nothing. Cloudflare's free tier is 100,000 Worker requests and
100,000 KV reads a day, and ntfy is free.
