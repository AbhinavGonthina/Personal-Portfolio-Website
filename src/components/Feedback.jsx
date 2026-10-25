import { useEffect, useRef, useState } from "react";

/**
 * A way to tell me the site is wrong.
 *
 * The version of this site that this one replaced had a suggestion
 * box in its contact section, and it is the one thing from there
 * worth keeping: a portfolio asks people to form an opinion, and
 * giving them nowhere to put it is a strange way to ask.
 *
 * It is a `<dialog>`, which is a lot of work for one tag. The
 * browser puts it in the top layer, so it cannot be covered by the
 * canvas or the bar; closes it on Escape; keeps focus inside it;
 * hands focus back to the button afterwards; and paints the scrim.
 * The alternative is a fixed div and sixty lines of reimplementing
 * those, worse.
 *
 * Nothing here runs until it is opened. The form is not in the
 * document while the dialog is shut, no listener is attached to
 * the page, and no library is imported for it - the way in is two
 * keyframes in `index.css`. A reader who never presses the button
 * pays for one `<button>`.
 */

/**
 * Where it goes. The same Web3Forms endpoint and key the previous
 * site used. That key is a public access key by design - it has
 * been in the built bundle of /legacy since the day it shipped -
 * and the address it forwards to is configured on their side, not
 * here.
 */
const ENDPOINT = "https://api.web3forms.com/submit";
const KEY = "9e0abf8a-056a-47aa-af45-7fa3f96768af";

/**
 * One message every five minutes, remembered in this browser.
 *
 * Carried over from the old form. It is not security - anything
 * kept client side can be cleared by anyone who wants to clear it
 * - it is so that a slip of the finger, or somebody holding the
 * button down to see what happens, does not arrive as forty
 * identical emails.
 */
const COOLDOWN = 5 * 60 * 1000;
const SENT_AT = "feedback-sent-at";

const since = () => {
  try {
    return Date.now() - Number(window.localStorage.getItem(SENT_AT) ?? 0);
  } catch {
    // Private browsing, or storage blocked. Let them send.
    return Infinity;
  }
};

const LABEL = "font-mono text-[11px] uppercase tracking-[0.18em] text-fg-subtle";

const FIELD =
  "w-full rounded-lg border border-(--lift-line) bg-(--lift-fill) px-3.5 py-2.5 text-base text-fg outline-none transition-colors focus:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const GHOST =
  "tap-y rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-subtle transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

const SOLID =
  "tap-y rounded-full border border-(--lift-ring) bg-(--lift-fill-strong) px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg transition-colors hover:border-accent/60 hover:text-accent disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export default function Feedback({ bare = false, className = "" }) {
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [said, setSaid] = useState(null);

  // `showModal`, not the `open` attribute: only the method puts the
  // dialog in the top layer and lights the scrim.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const shut = () => {
    setOpen(false);
    setSaid(null);
  };

  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !message) {
      setSaid(["bad", "Both fields, please."]);
      return;
    }
    const waited = since();
    if (waited < COOLDOWN) {
      const mins = Math.ceil((COOLDOWN - waited) / 60000);
      setSaid(["bad", `Already had one from you. Try again in ${mins} min.`]);
      return;
    }

    setSending(true);
    setSaid(null);
    try {
      const body = new FormData();
      body.append("access_key", KEY);
      body.append("from_name", "abhinavgonthina.dev");
      body.append("subject", "Feedback from the site");
      body.append("name", name);
      body.append("message", message);
      const res = await fetch(ENDPOINT, { method: "POST", body });
      const out = await res.json();
      if (!out.success) throw new Error(out.message || "refused");
      try {
        window.localStorage.setItem(SENT_AT, String(Date.now()));
      } catch {
        // Not worth failing a sent message over.
      }
      setSaid(["good", "Got it, thank you. I read all of these."]);
      form.reset();
    } catch {
      setSaid(["bad", "That did not send. Email works if this keeps failing."]);
    } finally {
      setSending(false);
    }
  }

  // The raw read has every stylesheet switched off, so a class
  // there is meaningless at best and misleading at worst. Same
  // markup, same behaviour, no dress.
  const c = (s) => (bare ? undefined : s);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={c(
          `tap-y transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`,
        )}
      >
        {bare ? "Leave feedback" : "Leave feedback →"}
      </button>

      <dialog
        ref={dialog}
        // Closing has to come back through state, or Escape leaves
        // `open` true and the button stops working.
        onClose={shut}
        // A click that lands on the dialog element itself landed on
        // the scrim - everything visible is inside the form.
        onClick={(e) => {
          if (e.target === dialog.current) shut();
        }}
        className={c(
          // `font-sans normal-case tracking-normal text-base` are
          // not decoration, they are a reset. A dialog is lifted
          // into the browser's top layer for painting but it stays
          // where it is in the document for inheritance, and where
          // it is is inside the footer - which is set in mono
          // capitals at eleven pixels with a sixth of an em of
          // tracking. Without these the heading came out as
          // TELL ME WHAT IS WRONG WITH IT.
          //
          // `bg-ink-950`, not `--plate`. That token is a quarter
          // opacity black meant for a plate laid over the scene,
          // and a form you are asked to type into wants to be a
          // surface rather than a tint - the page was legible
          // straight through the middle of it.
          "sheet m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-ink-700 bg-ink-950 p-0 text-base font-sans normal-case tracking-normal text-fg shadow-2xl shadow-black/50 backdrop:bg-black/70",
        )}
      >
        {/* Not in the document at all until it is wanted. */}
        {open && (
          <form onSubmit={send} className={c("flex flex-col gap-5 p-6 sm:p-7")}>
            <div className={c("flex items-baseline justify-between gap-4")}>
              <h2
                className={c("text-xl font-semibold tracking-tight sm:text-2xl")}
              >
                Tell me what is wrong with it
              </h2>
              <button
                type="button"
                onClick={shut}
                aria-label="Close"
                className={c(
                  "tap -m-2 shrink-0 rounded-full p-2 text-fg-subtle transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
              >
                {bare ? "Close" : "✕"}
              </button>
            </div>

            <p className={c("-mt-2 text-sm leading-relaxed text-fg-muted")}>
              Anything at all: a bug, something that reads badly, a thing you
              wish were here. It reaches me by email.
            </p>

            <label className={c("flex flex-col gap-2")}>
              <span className={c(LABEL)}>Who you are</span>
              <input
                name="name"
                required
                maxLength={80}
                autoComplete="name"
                className={c(FIELD)}
              />
            </label>

            <label className={c("flex flex-col gap-2")}>
              <span className={c(LABEL)}>What you want to say</span>
              <textarea
                name="message"
                required
                rows={5}
                maxLength={2000}
                className={c(`${FIELD} resize-y`)}
              />
            </label>

            {said && (
              <p
                role="status"
                className={c(
                  `text-sm ${said[0] === "good" ? "text-accent" : "text-fg-muted"}`,
                )}
              >
                {said[1]}
              </p>
            )}

            <div className={c("flex items-center justify-end gap-3")}>
              <button type="button" onClick={shut} className={c(GHOST)}>
                Cancel
              </button>
              <button type="submit" disabled={sending} className={c(SOLID)}>
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
