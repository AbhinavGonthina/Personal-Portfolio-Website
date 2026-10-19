import { useEffect, useState } from "react";
import { projects } from "../data/projects";

/**
 * The project screenshots, decoded, for drawing into a canvas.
 *
 * `useLoader` would give three.js textures, which is the wrong
 * shape: the detail view draws its preview into a 2D context, and
 * that wants an image it can `drawImage`.
 *
 * Videos are skipped. Four of these projects have an mp4 rather
 * than a still and a canvas cannot take a frame from one without
 * playing it; the detail view says so rather than leaving a hole.
 *
 * Nothing is fetched while the plain read is up.
 */
export function useStills(off) {
  const [stills, setStills] = useState({});

  useEffect(() => {
    if (off) return;
    let live = true;
    for (const p of projects) {
      if (!p.image || /\.(mp4|webm|mov)$/i.test(p.image)) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = p.image;
      img
        .decode()
        .then(() => {
          if (live) setStills((s) => (s[p.id] ? s : { ...s, [p.id]: img }));
        })
        .catch(() => {});
    }
    return () => {
      live = false;
    };
  }, [off]);

  return stills;
}
