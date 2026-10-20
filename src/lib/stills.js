import { useEffect, useState } from "react";
import { projects } from "../data/projects";

/**
 * The project screenshots, decoded, for drawing into a canvas.
 *
 * `useLoader` would give three.js textures, which is the wrong
 * shape: the detail view draws its preview into a 2D context, and
 * that wants an image it can `drawImage`.
 *
 * The ones with an mp4 rather than a still fall back to their
 * poster. A canvas cannot take a frame from a video without playing
 * it, but every one of those projects already ships the poster the
 * player shows before you press anything, and a real frame of the
 * app beats a box saying there is no picture.
 *
 * Nothing is fetched while the plain read is up.
 */
export function useStills(off) {
  const [stills, setStills] = useState({});

  useEffect(() => {
    if (off) return;
    let live = true;
    for (const p of projects) {
      const src = p.image ?? p.poster;
      if (!src || /\.(mp4|webm|mov)$/i.test(src)) continue;
      const img = new Image();
      img.decoding = "async";
      img.src = src;
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
