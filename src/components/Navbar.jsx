import { NAV_ITEMS } from "../data/nav";
import { profile } from "../data/profile";

const scrollTo = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Navbar() {
  return (
    // Semi-transparent over a blur is the one place a backdrop-filter earns
    // its cost: the bar is short, so the area being re-sampled is small.
    <header className="sticky top-0 z-50 border-b border-ink-700/60 bg-ink-950/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1 px-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mr-auto text-sm font-semibold tracking-tight text-fg transition-colors hover:text-accent"
        >
          {profile.name}
        </button>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="rounded-md px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-ink-800 hover:text-fg"
          >
            {item.label}
          </button>
        ))}

        <button
          onClick={() => scrollTo("connect")}
          className="ml-2 rounded-md bg-fg px-3 py-2 text-sm font-medium text-ink-950 transition-opacity hover:opacity-90"
        >
          Contact
        </button>
      </nav>
    </header>
  );
}
