import * as THREE from "three";

/**
 * Text drawn into a canvas, to be hung on a plane in a 3D scene.
 *
 * Both scenes label things this way rather than with TextGeometry, which
 * needs a typeface converted to JSON and shipped as an asset. Nothing else
 * in these scenes is loaded from disk and the lettering should not be the
 * exception.
 */
export function makeTextTexture(
  text,
  { weight = 700, tracking = 20, theme = "dark" } = {},
) {
  const H = 150;
  const PAD = 24;
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  const setup = () => {
    g.font = `${weight} ${H}px "Geist Mono Variable", ui-monospace, monospace`;
    if ("letterSpacing" in g) g.letterSpacing = `${tracking}px`;
  };
  setup();
  c.width = Math.ceil(g.measureText(text).width) + PAD * 2;
  c.height = H + PAD * 2;

  // Resizing a canvas resets its context, so everything is set again here.
  setup();
  g.textAlign = "center";
  g.textBaseline = "middle";
  // Lettering, so it is whatever reads against the sky behind it.
  // The sign is unlit geometry with this texture on it; white on a
  // pale sky is a sign nobody can read.
  g.fillStyle = theme === "light" ? "#1a1f2b" : "#ffffff";
  g.fillText(text, c.width / 2, c.height / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: c.width / c.height };
}
