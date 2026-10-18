import { PICKING, PICKS, usePick } from "../lib/photoPick";

/**
 * Says which portrait is on the board, and what the others are keyed
 * to. Renders nowhere but a development machine - see `photoPick`.
 */
export default function PhotoPicker() {
  const pick = usePick();
  if (!PICKING) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-40 rounded-lg border border-ink-700/80 bg-ink-950/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
      {PICKS.map((o, i) => (
        <div
          key={o.key}
          className={i === pick ? "text-fg" : "text-fg-subtle/60"}
        >
          {o.key} {o.note}
        </div>
      ))}
    </div>
  );
}
