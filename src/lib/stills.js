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
 * Nothing is fetched while the plain read is up, and nothing is
 * fetched while the town is still being built either - see the
 * effect.
 */
export function useStills(off) {
  const [stills, setStills] = useState({});

  useEffect(() => {
    if (off) return;
    let live = true;

    // Waited for, rather than raced against the town.
    //
    // Twelve stills is about a megabyte, and decoding them is the
    // same main thread that is compiling the scene's shaders and
    // painting its canvases. None of them is looked at until the
    // fourth stop, which is four sections of scrolling away, so
    // starting them while the town is still being built was
    // competing for the one window where the wait is visible.
    let start = 0;
    const idle =
      typeof requestIdleCallback === "function"
        ? requestIdleCallback
        : (fn) => setTimeout(fn, 200);
    const cancelIdle =
      typeof cancelIdleCallback === "function"
        ? cancelIdleCallback
        : clearTimeout;

    // One render for all of them, not one per image.
    //
    // Each `decode` resolving on its own set state on its own, so
    // a dozen of them meant a dozen renders of the scene's whole
    // tree during the heaviest part of the visit. They are
    // collected here instead and handed over on the next frame,
    // which coalesces whatever has arrived into a single update
    // without making the first one wait for the last.
    let pending = null;
    let frame = 0;
    const flush = () => {
      frame = 0;
      const batch = pending;
      pending = null;
      if (live && batch) setStills((s) => ({ ...s, ...batch }));
    };

    start = idle(() => {
      for (const p of projects) {
        const src = p.image ?? p.poster;
        if (!src || /\.(mp4|webm|mov)$/i.test(src)) continue;
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        img
          .decode()
          .then(() => {
            if (!live) return;
            pending = pending ?? {};
            pending[p.id] = img;
            if (!frame) frame = requestAnimationFrame(flush);
          })
          .catch(() => {});
      }
    });

    return () => {
      live = false;
      cancelIdle(start);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [off]);

  return stills;
}
