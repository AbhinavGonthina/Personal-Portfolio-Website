import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { ARC_GROUPS, experience } from "../data/experience";
import { profile } from "../data/profile";
import { getProgress } from "../lib/stage";
import { makeTextTexture } from "../lib/canvasText";
import { ExtrudedText, Ground } from "./street";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makeEmblemMaterials } from "../lib/emblemMaterials";
import Emblem from "./emblems";

/**
 * One street, seen from two distances.
 *
 * This canvas sits behind both the landing section and the Experience
 * section and never unmounts between them. Scrolling walks the camera
 * from the far end of the road - where the name stands on the pavement,
 * the portrait is up on a hoarding and the city is a haze of lights
 * ahead - into the arc of buildings that is the Experience section. One
 * GL context, one render loop, one world: the transition between the two
 * is literally travel rather than a crossfade between two scenes.
 *
 * The roles are buildings on an arc that curves around the viewer:
 * startups off to the left, the two industry roles straight ahead,
 * Northeastern to the right. Clicking one flies the camera in and frames
 * it on the left of the viewport, leaving the right half for the written
 * detail.
 *
 * Each group is a different kind of building, so the three clusters are
 * legible as shapes before you read a single label:
 *
 *   work          slim towers, the tallest things on the street
 *   startup       low wide blocks
 *   northeastern  small, close together
 *
 * Entirely procedural - boxes, a canvas-drawn window texture, a grid, two
 * lights and one bloom pass. No models, no asset pipeline.
 */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/**
 * "Jun 2026" -> a month index. Anything it cannot parse - "Present", most
 * obviously - resolves to now rather than NaN. One NaN here used to poison
 * `Math.max` for the whole group, giving every building in it a NaN height,
 * which silently renders nothing at all.
 */
const toMonths = (s) => {
  const [m, y] = String(s).split(" ");
  const year = Number(y);
  if (!Number.isFinite(year)) {
    const now = new Date();
    return now.getFullYear() * 12 + now.getMonth();
  }
  return year * 12 + Math.max(0, MONTHS.indexOf(m));
};

const IDLE = 0.3;
const ARC_R = 11;
const DEG = Math.PI / 180;

/**
 * Left to right across the arc. Not the data's own order - the groups are
 * arranged by where they should sit in front of the viewer.
 */
const ARC_PLACE = {
  startup: { centre: -47, step: 15 },
  work: { centre: 0, step: 19 },
  northeastern: { centre: 47, step: 10.5 },
};
const ARC = ARC_GROUPS.map((g) => ({ ...g, ...ARC_PLACE[g.id] }));

/**
 * Per-group form. `h` is the height band a role is mapped into, so duration
 * still varies a building but never enough to make a teaching assistantship
 * out-tower a two-year role.
 */
const KIND = {
  work: { h: [6.6, 8.8], w: 1.95, d: 1.95 },
  startup: { h: [3.2, 4.3], w: 2.4, d: 2.0 },
  northeastern: { h: [2.9, 4.0], w: 1.7, d: 1.7 },
};

/**
 * A silhouette per building, so no two are the same object at a different
 * height. `shaft` is the body - a box, an octagonal prism or a drum - and
 * `top` is what finishes it. Taken in order within each group, so the forms
 * stay put as roles are added rather than reshuffling the whole street.
 *
 * `fat`/`thin` nudge the footprint, which is what separates two buildings
 * that share a form.
 */
const FORMS = {
  work: [
    { shaft: "box", top: "setback" },
    // No mast: the ward emblem stands where it used to, and a pole
    // through the middle of it helped nothing.
    { shaft: "box", top: null, fat: 0.94 },
  ],
  startup: [
    { shaft: "box", top: "pylons", fat: 1.1, thin: 0.74 },
    { shaft: "oct", top: "setback", fat: 0.88 },
  ],
  northeastern: [
    { shaft: "box", top: "pyramid" },
    { shaft: "oct", top: null, fat: 1.06 },
    { shaft: "cyl", top: "dome", fat: 0.96 },
    { shaft: "box", top: "pylons", fat: 1.08, thin: 0.86 },
  ],
};

function useLayout() {
  return useMemo(() => {
    const out = [];
    ARC.forEach(({ id, centre, step }) => {
      const roles = experience.filter((r) => r.category === id);
      const kind = KIND[id];
      // Longest role in the group sets the top of its height band.
      const spans = roles.map((r) =>
        Math.max(1, toMonths(r.end) - toMonths(r.start)),
      );
      const longest = Math.max(...spans, 1);

      roles.forEach((role, i) => {
        const angle = (centre + (i - (roles.length - 1) / 2) * step) * DEG;
        const t = Math.min(1, Math.sqrt(spans[i] / longest) || 0);
        const form = FORMS[id][i % FORMS[id].length];
        out.push({
          role,
          kind: id,
          angle,
          x: Math.sin(angle) * ARC_R,
          z: -Math.cos(angle) * ARC_R,
          // Faces the centre of the arc, which is where the viewer stands.
          rotY: -angle,
          height: kind.h[0] + (kind.h[1] - kind.h[0]) * t,
          w: kind.w * (form.fat ?? 1),
          d: kind.d * (form.thin ?? form.fat ?? 1),
          shaft: form.shaft,
          top: form.top,
        });
      });
    });
    return out;
  }, []);
}

/**
 * Windows, drawn once into a canvas rather than loaded as an image.
 *
 * A greyscale mask used as `emissiveMap`, so each building multiplies it by
 * its own emissive colour and gets windows in its own light from one shared
 * texture. Rows are deliberately uneven - a perfectly regular grid of
 * identical squares reads as graph paper, not a building.
 */
function makeWindowTexture() {
  const COLS = 6;
  const ROWS = 12;
  const CELL = 16;
  const c = document.createElement("canvas");
  c.width = COLS * CELL;
  c.height = ROWS * CELL;
  const g = c.getContext("2d");
  g.fillStyle = "#000000";
  g.fillRect(0, 0, c.width, c.height);
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      if (Math.random() > 0.55) continue;
      const v = 0.35 + Math.random() * 0.65;
      g.fillStyle = `rgba(255,255,255,${v.toFixed(2)})`;
      g.fillRect(col * CELL + 4, r * CELL + 5, CELL - 8, CELL - 10);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Crowns have to read as equally lit whatever hue they are.
 *
 * One shared emissiveIntensity does not do that. Brightness is the colour
 * times the intensity, so Quak's near-white orange threw several times the
 * light of Rainfall's navy at the same number, and because bloom keys off
 * luminance the dark ones never crossed its threshold and never glowed at
 * all.
 *
 * Two corrections. The colour is normalised so its brightest channel is
 * 1.0, which restores a dark accent's vividness without shifting its hue.
 * Then the intensity is scaled by the inverse of that colour's luminance,
 * so a blue crown - blue contributes only 0.07 of perceived luminance
 * against green's 0.72 - is driven hard enough to bloom like a red one.
 */
const CROWN_LUM = 0.42;

/**
 * One size for every badge, in world units, rather than a fraction of the
 * building. Scaling each to its own facade made the small Northeastern
 * blocks carry marks half the size of the towers', which read as a mistake
 * rather than as scale.
 */
const BADGE = 0.98;

/**
 * A soft glowing outline, drawn once. Used as the frame around a badge so
 * the sign reads as set into the facade with a lit bezel, rather than as a
 * picture stuck on the front.
 */
function makeFrameTexture() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d");
  g.strokeStyle = "#ffffff";
  g.lineWidth = 7;
  g.shadowColor = "#ffffff";
  g.shadowBlur = 14;
  const pad = 26;
  g.beginPath();
  // Matches the badge art's own corner radius once the plane is scaled,
  // so the bezel traces the badge rather than boxing it in.
  g.roundRect(pad, pad, S - pad * 2, S - pad * 2, 48);
  g.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * The company name, drawn into a canvas and hung on the facade under the
 * badge.
 *
 * It used to be a DOM label floating above the roofline. That meant the
 * names drifted as the camera turned, and where buildings stand close
 * together they had to be shunted onto different rows to stay apart -
 * so the one thing that should have been fixed to a building was the one
 * thing that moved. On the facade it is simply part of the building.
 *
 * The type is fitted to the face it sits on: wrapped onto a second line
 * when that buys a bigger size, then scaled up until the longest line
 * nearly spans the wall, and capped so a short name like OASIS does not
 * end up in billboard letters.
 */
const PLATE_RES = 512;
const PLATE_PAD = 16;
const PLATE_MAX = 72;
const plateFont = (g, size) => {
  g.font = `600 ${size}px "Geist Mono Variable", ui-monospace, monospace`;
  if ("letterSpacing" in g) g.letterSpacing = `${(size * 0.08).toFixed(1)}px`;
};

/** The split that leaves the two lines as even as possible. */
function wrapEvenly(words, measure) {
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const wide = Math.max(measure(a), measure(b));
    if (!best || wide < best.wide) best = { lines: [a, b], wide };
  }
  return best;
}

function makeNamePlate(text, faceW) {
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  const REF = 100;
  plateFont(g, REF);
  const measure = (t) => g.measureText(t).width;

  const words = text.toUpperCase().split(" ");
  const avail = PLATE_RES - PLATE_PAD * 2;
  let lines = [words.join(" ")];
  let wide = measure(lines[0]);
  if (words.length > 1) {
    const two = wrapEvenly(words, measure);
    // Only worth a second line if it buys a meaningfully larger size;
    // otherwise a two-word name splits for no reason.
    if (two && two.wide < wide * 0.78) {
      lines = two.lines;
      wide = two.wide;
    }
  }

  const size = Math.min(PLATE_MAX, (avail / wide) * REF);
  const lead = size * 1.3;
  c.width = PLATE_RES;
  c.height = Math.ceil(lines.length * lead) + PLATE_PAD * 2;

  // Resizing a canvas resets its context, so everything is set again here.
  plateFont(g, size);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#ffffff";
  // The wall behind is lit windows, not flat black. Three passes build the
  // shadow into a dark pad under the glyphs so they stay legible over one.
  g.shadowColor = "rgba(0,0,0,0.92)";
  g.shadowBlur = size * 0.42;
  lines.forEach((l, i) => {
    const y = PLATE_PAD + lead * (i + 0.5);
    for (let pass = 0; pass < 3; pass++) g.fillText(l, c.width / 2, y);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const scale = (faceW * 0.96) / PLATE_RES;
  return { tex, w: PLATE_RES * scale, h: c.height * scale };
}

function crownLight(hex) {
  const c = new THREE.Color(hex);
  const peak = Math.max(c.r, c.g, c.b) || 1;
  c.multiplyScalar(1 / peak);
  const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  // Clamped: without a ceiling a pure blue would be driven to absurdity.
  const gain = Math.min(4, Math.max(1, CROWN_LUM / Math.max(lum, 0.06)));
  return { color: c, gain };
}

/**
 * The body of a building. An octagon's radius is set so its flat faces sit
 * exactly where a box's would, which keeps the signboard offset the same
 * for both; `thetaStart` turns it so a face, not a corner, meets the
 * viewer.
 */
const OCT = Math.cos(Math.PI / 8);
function makeShaft(form, w, d, h) {
  if (form === "cyl") return new THREE.CylinderGeometry(w / 2, w / 2, h, 28);
  if (form === "oct")
    return new THREE.CylinderGeometry(
      w / 2 / OCT,
      w / 2 / OCT,
      h,
      8,
      1,
      false,
      -Math.PI / 8,
    );
  return new THREE.BoxGeometry(w, h, d);
}

/** One geometry per shape, built once and thrown away with the building. */
function useShaft(form, w, d, h) {
  const geo = useMemo(() => makeShaft(form, w, d, h), [form, w, d, h]);
  useEffect(() => () => geo.dispose(), [geo]);
  return geo;
}

function ShaftGeo({ form, w, d, h }) {
  return <primitive object={useShaft(form, w, d, h)} attach="geometry" />;
}

const EDGE_IDLE = 0.11;
const EDGE_ON = 0.4;
const EDGE_DIM = 0.03;

/**
 * A hairline along the building's edges.
 *
 * Against a black sky an unlit facade has no silhouette at all - the
 * buildings were reading as holes in the page rather than as volumes, and
 * only the crown and the badge told you anything was standing there. The
 * threshold angle keeps the drum smooth: at eighteen degrees a 28-sided
 * cylinder draws only its top and bottom rings, while the octagon's
 * forty-five degree corners still come through.
 */
function Edges({ form, w, d, h, color, matRef }) {
  const base = useShaft(form, w, d, h);
  const geo = useMemo(() => new THREE.EdgesGeometry(base, 18), [base]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={EDGE_IDLE}
        // Occluded by whatever is in front, but never writes depth of its
        // own: a hairline punching a hole in the building behind it looks
        // worse than the overlap does.
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function Building({
  tower,
  windows,
  logo,
  frame,
  focused,
  dimmed,
  onFocus,
  mirrored,
}) {
  const body = useRef();
  const stage = useRef();
  const crown = useRef();
  const light = useRef();
  // Signage is unlit on purpose, so dimming the building does nothing to
  // it. Behind the detail column a dropped-back tower was still showing a
  // full-brightness badge and a white nameplate through the copy.
  const signage = useRef([]);
  const edges = useRef([]);
  const [hovered, setHovered] = useState(false);
  const { role, x, z, rotY, height, w, d, shaft: form, top } = tower;
  const on = focused || hovered;
  const lit = useMemo(() => crownLight(role.accent), [role.accent]);

  // Two materials shared by every part of the roof emblem, lerped here
  // with everything else the building owns.
  // Built from the normalised accent, not the raw one, and driven by the
  // same gain the crowns use - otherwise Rainfall's navy emblem sits at a
  // fraction of the brightness of Quak's orange for the same number.
  const emblem = useMemo(() => makeEmblemMaterials(lit.color), [lit]);
  useEffect(
    () => () => {
      emblem.base.dispose();
      emblem.lit.dispose();
    },
    [emblem],
  );

  // A round building has no flat face, so the sign hangs off the apothem
  // (which the octagon's radius is chosen to make equal to w/2) or the
  // drum's radius. A flat plane tangent to a cylinder never intersects it.
  const faceZ = form === "box" ? d / 2 : w / 2;
  // Tinted toward the building's own accent but washed most of the way to
  // white, so the outline reads as a lit edge and not as a second colour.
  const edgeColor = useMemo(
    () => lit.color.clone().lerp(new THREE.Color("#ffffff"), 0.6),
    [lit],
  );
  const plate = useMemo(
    () => makeNamePlate(role.company, w),
    [role.company, w],
  );
  useEffect(() => () => plate.tex.dispose(), [plate]);

  const map = useMemo(() => {
    const m = windows.clone();
    m.needsUpdate = true;
    m.repeat.set(2, Math.max(2, Math.round(height / 1.1)));
    m.offset.set(Math.random(), Math.random());
    return m;
  }, [windows, height]);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-6 * delta);
    const target = on ? 1 : dimmed ? 0.015 : IDLE;
    // Both parts of the shaft, not just the lower one - the stepped-back
    // upper stage has its own material and was staying dark while the rest
    // of the building lit up.
    for (const part of [body.current, stage.current]) {
      if (!part) continue;
      const m = part.material;
      m.emissiveIntensity += (target * 0.5 - m.emissiveIntensity) * k;
    }
    if (crown.current) {
      const m = crown.current.material;
      const want = target * 3.4 * lit.gain;
      m.emissiveIntensity += (want - m.emissiveIntensity) * k;
    }
    if (light.current) {
      light.current.intensity += (target * 9 - light.current.intensity) * k;
    }
    const want = dimmed ? 0.06 : 1;
    for (const part of signage.current) {
      if (!part) continue;
      const m = part.material;
      m.opacity += (want * (m.userData.full ?? 1) - m.opacity) * k;
    }
    const line = on ? EDGE_ON : dimmed ? EDGE_DIM : EDGE_IDLE;
    for (const m of edges.current) {
      if (m) m.opacity += (line - m.opacity) * k;
    }
    emblem.base.emissiveIntensity +=
      (target * 1.5 * lit.gain - emblem.base.emissiveIntensity) * k;
    emblem.lit.emissiveIntensity +=
      (target * 3.2 * lit.gain - emblem.lit.emissiveIntensity) * k;
  });

  const body_h = top === "setback" ? height * 0.78 : height;
  const crownW = top === "setback" ? w * 0.62 : w;
  const crownD = top === "setback" ? d * 0.62 : d;
  // The sign goes on the widest part of the building. On the setback
  // tower it was landing on the narrow upper stage, where a nameplate
  // sized to the full facade hung off both sides into open air.
  const signTop = top === "setback" ? body_h - 0.3 : height - 0.62;
  // Clear of whatever finishes the building, so the emblem never grows
  // out of a pyramid or sits inside a dome.
  // Clear of whatever finishes the building, then lifted again so the
  // emblem floats in its own air. Sitting on the roof it was reading as
  // part of the building's silhouette rather than as a thing you were
  // meant to look at.
  const ROOF = { pyramid: 0.82, pylons: 0.5, setback: 0.34 };
  const emblemY =
    height + (top === "dome" ? w * 0.5 + 0.26 : (ROOF[top] ?? 0.34)) + 0.72;

  // On the group rather than the shaft, so the crown, the sign, the mast
  // and the upper stage are all part of the same target. With them on the
  // shaft alone, pointing at the top of a building did nothing.
  const events = mirrored
    ? {}
    : {
        onPointerOver: (e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          setHovered(false);
          document.body.style.cursor = "";
        },
        onClick: (e) => {
          e.stopPropagation();
          onFocus(role.id);
        },
      };

  // One invisible box per building, covering the shaft, the upper stage,
  // the crown, the sign and the mast. Relying on the real meshes left dead
  // spots - the sign plane and everything above it on the taller towers
  // simply did not register - and chasing which child the ray happened to
  // hit is not worth it when a single convex target is exact.
  //
  // `visible={false}` would be skipped by the raycaster, so it is a fully
  // transparent material that writes neither colour nor depth instead.
  const hitH = height + 1.9;

  // Collects the sign meshes so the frame loop can fade them with the
  // building. `full` is the opacity each one sits at when nothing is
  // dropped back, since the bezel is deliberately not solid.
  const sign =
    (i, full = 1) =>
    (m) => {
      if (m) m.material.userData.full = full;
      signage.current[i] = m;
    };
  const edge = (i) => (m) => {
    edges.current[i] = m;
  };

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {!mirrored && (
        <mesh position={[0, hitH / 2, 0]} {...events}>
          <boxGeometry args={[w * 1.25, hitH, d * 1.25]} />
          <meshBasicMaterial
            transparent
            opacity={0}
            depthWrite={false}
            colorWrite={false}
          />
        </mesh>
      )}

      <group position={[0, body_h / 2, 0]}>
        <Edges
          form={form}
          w={w}
          d={d}
          h={body_h}
          color={edgeColor}
          matRef={edge(0)}
        />
      </group>

      <mesh ref={body} position={[0, body_h / 2, 0]}>
        <ShaftGeo form={form} w={w} d={d} h={body_h} />
        <meshStandardMaterial
          color="#09090b"
          emissive={role.accent}
          emissiveMap={map}
          emissiveIntensity={IDLE * 0.5}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* A narrower upper stage. */}
      {top === "setback" && (
        <group position={[0, body_h + (height - body_h) / 2, 0]}>
          <Edges
            form={form}
            w={w * 0.62}
            d={d * 0.62}
            h={height - body_h}
            color={edgeColor}
            matRef={edge(1)}
          />
        </group>
      )}

      {top === "setback" && (
        <mesh ref={stage} position={[0, body_h + (height - body_h) / 2, 0]}>
          <ShaftGeo form={form} w={w * 0.62} d={d * 0.62} h={height - body_h} />
          <meshStandardMaterial
            color="#09090b"
            emissive={role.accent}
            emissiveMap={map}
            emissiveIntensity={IDLE * 0.5}
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* The lit band at the top. One cheap detail is the difference between
          reading as a building and reading as a bar on a chart. */}
      <mesh ref={crown} position={[0, height - 0.18, 0]}>
        <ShaftGeo form={form} w={crownW + 0.11} d={crownD + 0.11} h={0.26} />
        <meshStandardMaterial
          color="#000000"
          emissive={lit.color}
          emissiveIntensity={IDLE * 3.4 * lit.gain}
          toneMapped={false}
        />
      </mesh>

      {/* What finishes the building off. Each is a few triangles, and
          between them they stop the street reading as eight copies of one
          box at different heights. */}
      {top === "pyramid" && (
        <mesh position={[0, height + 0.36, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[w * 0.78, 0.76, 4]} />
          <meshStandardMaterial
            color="#09090b"
            emissive={lit.color}
            emissiveIntensity={IDLE * 0.5}
            roughness={0.42}
            metalness={0.3}
          />
        </mesh>
      )}

      {top === "dome" && (
        <mesh position={[0, height - 0.04, 0]}>
          <sphereGeometry
            args={[w * 0.5, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <meshStandardMaterial
            color="#09090b"
            emissive={lit.color}
            emissiveIntensity={IDLE * 0.5}
            roughness={0.3}
            metalness={0.45}
          />
        </mesh>
      )}

      {top === "pylons" &&
        [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([sx, sz]) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (w / 2 - 0.12), height + 0.22, sz * (d / 2 - 0.12)]}
          >
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial
              color="#000000"
              emissive={lit.color}
              emissiveIntensity={0.9 * lit.gain}
              toneMapped={false}
            />
          </mesh>
        ))}

      {/* The signboard, three layers deep so it reads as built in rather
          than applied: a dark plate, a lit bezel around it in the
          building's own colour, and the badge itself on the front.

          The bezel hugs the badge. Sized any wider and the dark plate
          shows through as a band between the two, which makes the outline
          look like a separate frame hung around the logo. The plate is now
          only just smaller than the badge: its job is to stop the windows
          showing through the badge's feathered edge, not to be seen. */}
      {logo && (
        <group position={[0, signTop - BADGE / 2, faceZ + 0.018]}>
          <mesh position={[0, 0, -0.014]} ref={sign(0)}>
            <planeGeometry args={[BADGE * 0.98, BADGE * 0.98]} />
            <meshStandardMaterial
              color="#0a0a0d"
              roughness={0.55}
              metalness={0.35}
              transparent
            />
          </mesh>
          <mesh position={[0, 0, -0.007]} ref={sign(1, 0.85)}>
            <planeGeometry args={[BADGE * 1.16, BADGE * 1.16]} />
            <meshBasicMaterial
              map={frame}
              color={lit.color}
              transparent
              opacity={0.85}
              toneMapped={false}
              depthWrite={false}
            />
          </mesh>
          <mesh ref={sign(2)}>
            <planeGeometry args={[BADGE, BADGE]} />
            <meshBasicMaterial map={logo} toneMapped={false} transparent />
          </mesh>
        </group>
      )}

      {/* The name, on the wall directly under the badge. Unlit, so it
          stays the same clean white however the building is lit - it is
          signage, not a surface. Just clear of the badge, which has a
          feathered edge of its own. */}
      <mesh
        ref={sign(3)}
        position={[0, signTop - BADGE - 0.1 - plate.h / 2, faceZ + 0.019]}
      >
        <planeGeometry args={[plate.w, plate.h]} />
        <meshBasicMaterial
          map={plate.tex}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Not in the reflection. The emblems are the most detailed thing
          in the scene and the mirrored copies sit at 45% under a dark
          sheet, which is a poor return on doubling them. */}
      {role.emblem && !mirrored && (
        <group position={[0, emblemY, 0]}>
          <Emblem kind={role.emblem} mats={emblem} scale={1} />
        </group>
      )}

      <pointLight
        ref={light}
        position={[0, height - 0.2, 0.9]}
        color={lit.color}
        intensity={0}
        distance={9}
        decay={2}
      />
    </group>
  );
}

/**
 * The name of a cluster, standing on the pavement in front of it, in the
 * same extruded lettering the hero uses for the name.
 */
const SIGN_R = 7.4;
const SIGN_H = 0.52;

function ClusterSigns({ hidden }) {
  const mats = useRef([]);
  const made = useMemo(
    () =>
      ARC.map(({ id, ground, centre }) => ({
        id,
        ...makeTextTexture(ground),
        angle: centre * DEG,
      })),
    [],
  );
  useEffect(() => () => made.forEach((m) => m.tex.dispose()), [made]);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-3.4 * delta);
    for (const m of mats.current) {
      if (m) m.opacity += ((hidden ? 0 : 1) - m.opacity) * k;
    }
  });

  mats.current.length = 0;
  return made.map((m) => (
    // Turned to face the centre of the arc, like the buildings behind it.
    <group key={m.id} rotation={[0, -m.angle, 0]}>
      <group position={[0, SIGN_H * 0.62, -SIGN_R]}>
        <ExtrudedText
          tex={m.tex}
          aspect={m.aspect}
          height={SIGN_H}
          matRef={(el) => el && mats.current.push(el)}
        />
      </group>
    </group>
  ));
}

/**
 * The rest of the city, far enough out to be shapes.
 *
 * Only two draw calls: every silhouette is merged into one buffer and
 * every crown light into another. They stand on a wide arc well outside
 * the eight real buildings, which gives the landing view a skyline to
 * look at and the skyline view something behind it. The crown pips are
 * the only colour up there, and they are the role accents - the city is
 * lit by the same eight lights the foreground is.
 */
function makeDistant() {
  const base = [];
  const lit = [];
  for (let i = 0; i < 26; i++) {
    // Seeded, so the horizon is the same one on every visit.
    const n = (x) => {
      const v = Math.sin(i * x) * 43758.5453;
      return v - Math.floor(v);
    };
    const a = (-78 + (i / 25) * 156 + (n(12.9898) - 0.5) * 5) * DEG;
    const r = 27 + n(78.233) * 17;
    const w = 1.8 + n(37.719) * 2.6;
    const h = 3 + n(11.135) * 11;
    const x = Math.sin(a) * r;
    const z = -Math.cos(a) * r;
    base.push(new THREE.BoxGeometry(w, h, w).translate(x, h / 2, z));
    lit.push(
      new THREE.BoxGeometry(w + 0.08, 0.16, w + 0.08).translate(x, h + 0.08, z),
    );
  }
  return {
    base: mergeGeometries(base, false),
    lit: mergeGeometries(lit, false),
  };
}

function Distant() {
  const made = useMemo(makeDistant, []);
  useEffect(
    () => () => {
      made.base.dispose();
      made.lit.dispose();
    },
    [made],
  );
  return (
    <group>
      <mesh geometry={made.base}>
        <meshBasicMaterial color="#04040a" />
      </mesh>
      {/* One colour for the far lights rather than eight: at this
          distance individual hues turn to mud, and a single cool white
          with the accents only in the foreground keeps the eight that
          matter legible. */}
      <mesh geometry={made.lit}>
        <meshBasicMaterial color="#5f6ea8" toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * The landing end of the street: the name standing on the pavement and
 * the portrait up on a hoarding beside it.
 *
 * Both fade out as the camera walks past them, because it does walk
 * past them - they sit between the viewer's first position and the arc,
 * and watching a nameplate slide through the camera is not the effect.
 */
const HERO_Z = 12.2;
const NAME_H = 0.66;
const BOARD = 2.05;

function Approach() {
  const mats = useRef([]);
  const lines = useMemo(() => {
    const [first, ...rest] = profile.name.toUpperCase().split(" ");
    return [first, rest.join(" ")].map((t) => makeTextTexture(t));
  }, []);
  useEffect(() => () => lines.forEach((l) => l.tex.dispose()), [lines]);
  const photo = useLoader(THREE.TextureLoader, profile.photo);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-6 * delta);
    // Gone by the time the skyline fills the frame.
    const want = 1 - Math.min(1, Math.max(0, (getProgress() - 0.18) / 0.4));
    for (const m of mats.current) {
      if (m) m.opacity += (want * (m.userData.full ?? 1) - m.opacity) * k;
    }
  });

  mats.current.length = 0;
  const keep =
    (full = 1) =>
    (m) => {
      if (!m) return;
      m.userData.full = full;
      mats.current.push(m);
    };

  const half = BOARD / 2;
  const mid = 1.45 + half;

  return (
    <>
      <group position={[-4.6, 0, HERO_Z]} rotation={[0, 0.16, 0]}>
        {lines.map((l, i) => (
          <group key={i} position={[0, NAME_H * (1.58 - i) * 1.16, 0]}>
            <ExtrudedText
              tex={l.tex}
              aspect={l.aspect}
              height={NAME_H}
              depth={0.3}
              layers={14}
              matRef={keep()}
            />
          </group>
        ))}
      </group>

      <group position={[5.5, 0, HERO_Z - 2.2]} rotation={[0, -0.24, 0]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * (half - 0.26), 0.72, 0]}>
            <boxGeometry args={[0.12, 1.45, 0.12]} />
            <meshBasicMaterial
              ref={keep(0.85)}
              color="#15151d"
              transparent
              opacity={0.85}
            />
          </mesh>
        ))}
        <mesh position={[0, mid, -0.06]}>
          <boxGeometry args={[BOARD + 0.16, BOARD + 0.16, 0.12]} />
          <meshBasicMaterial
            ref={keep(0.9)}
            color="#0b0b12"
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh position={[0, mid, 0.012]}>
          <planeGeometry args={[BOARD, BOARD]} />
          <meshBasicMaterial
            ref={keep()}
            map={photo}
            transparent
            toneMapped={false}
          />
        </mesh>
        {/* Four bars, not a wireframe plane: a wireframe draws the
            quad's diagonal too, which put a line straight across the
            photo. */}
        {[
          [0, half + 0.06, BOARD + 0.14, 0.055],
          [0, -half - 0.06, BOARD + 0.14, 0.055],
        ].map(([dx, dy, bw, bh], i) => (
          <mesh key={`h${i}`} position={[dx, mid + dy, 0.03]}>
            <boxGeometry args={[bw, bh, 0.055]} />
            <meshBasicMaterial
              ref={keep(0.75)}
              color="#aab4e0"
              transparent
              opacity={0.75}
              toneMapped={false}
            />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh key={`v${side}`} position={[side * (half + 0.06), mid, 0.03]}>
            <boxGeometry args={[0.055, BOARD + 0.14, 0.055]} />
            <meshBasicMaterial
              ref={keep(0.75)}
              color="#aab4e0"
              transparent
              opacity={0.75}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </>
  );
}

const LOOK = { x: 0, y: 3, z: -2 };

/** Where the camera stands at the landing end of the road. */
const HERO_STOP = { y: 2.0, z: 20.5 };
const ease = (p) => p * p * (3 - 2 * p);

function Rig({ target, narrow }) {
  useFrame((state, delta) => {
    const k = 1 - Math.exp(-2.6 * delta);
    const cam = state.camera;
    const halfFov = (cam.fov * DEG) / 2;
    const t = state.clock.elapsedTime;

    if (!target) {
      // Standing on the street inside the arc, looking up. Buildings run
      // past the edges of the frame on purpose - turning your head to find
      // the rest of them is the point, so the camera does not retreat until
      // everything fits.
      // Follows the cursor rather than needing a drag: the pointer steers
      // where you are looking, the same feel as before, just from the
      // pavement instead of above the block.
      // Scroll walks the camera up the road. At p=0 you are at the far
      // end looking at the city; at p=1 you are standing inside the arc.
      // Everything in between is the same shot moving, which is the
      // whole point of one canvas spanning both sections.
      const p = ease(getProgress());

      // The cursor steers less from a distance than it does up close -
      // at the far end a big swing would throw the city off the side of
      // the frame before you had looked at it.
      const sway = 0.2 + p * 0.42;
      const yaw = state.pointer.x * sway + Math.sin(t * 0.07) * 0.03;
      const pitch =
        (1 - p) * 0.02 +
        p * 0.17 +
        state.pointer.y * (0.04 + p * 0.06) +
        Math.sin(t * 0.05) * 0.012;

      const px = Math.sin(yaw) * (0.4 + p * 0.7);
      const py =
        HERO_STOP.y + (1.8 - HERO_STOP.y) * p + Math.sin(t * 0.09) * 0.06;
      const pz = HERO_STOP.z + (3.6 - HERO_STOP.z) * p;

      cam.position.x += (px - cam.position.x) * k;
      cam.position.y += (py - cam.position.y) * k;
      cam.position.z += (pz - cam.position.z) * k;

      // Aimed at a point on a sphere around the viewer rather than at a
      // fixed spot, so steering turns the head instead of sliding the
      // whole shot sideways.
      const reach = 14 + (1 - p) * 10;
      LOOK.x += (cam.position.x + Math.sin(yaw) * reach - LOOK.x) * k;
      LOOK.y += (cam.position.y + Math.tan(pitch) * reach - LOOK.y) * k;
      LOOK.z += (cam.position.z - Math.cos(yaw) * reach - LOOK.z) * k;
      cam.lookAt(LOOK.x, LOOK.y, LOOK.z);
      return;
    }

    // Square on to the building, not to the world.
    //
    // Backing straight off along +Z was fine for the two towers in the
    // middle of the arc and wrong for everything else: the buildings at
    // either end stand turned by up to sixty degrees, so you flew in and
    // met them at a corner. The approach now runs along the building's own
    // facing normal - which, since every building is turned to look at the
    // centre of the arc, points from it back at the viewer.
    const dist = narrow ? 22 : 13.5;
    const nx = -Math.sin(target.angle);
    const nz = Math.cos(target.angle);
    // The camera's right in that frame, so the building can be pushed to
    // the left of the viewport along the screen's own axis rather than the
    // world's.
    const rx = Math.cos(target.angle);
    const rz = Math.sin(target.angle);

    // Sideways offset derived from how wide the camera actually sees at
    // this distance. A fixed world offset puts the building a third of the
    // way across a laptop and dead centre on an ultrawide.
    const halfW = narrow ? 0 : Math.tan(halfFov) * dist * cam.aspect;

    const px = target.x + nx * dist + rx * halfW * 0.5;
    const pz = target.z + nz * dist + rz * halfW * 0.5;
    const lx = target.x + rx * halfW * 0.42;
    const lz = target.z + rz * halfW * 0.42;
    const py = narrow ? target.height * 0.5 + 1.2 : target.height * 0.58;
    const ly = narrow ? -1.2 : target.height * 0.5;

    cam.position.x += (px - cam.position.x) * k;
    cam.position.y += (py - cam.position.y) * k;
    cam.position.z += (pz - cam.position.z) * k;
    LOOK.x += (lx - LOOK.x) * k;
    LOOK.y += (ly - LOOK.y) * k;
    LOOK.z += (lz - LOOK.z) * k;
    cam.lookAt(LOOK.x, LOOK.y, LOOK.z);
  });
  return null;
}

export default function StreetScene({ focused, onFocus, active, narrow }) {
  const layout = useLayout();
  const windows = useMemo(makeWindowTexture, []);
  const frame = useMemo(makeFrameTexture, []);
  const target = focused ? layout.find((t) => t.role.id === focused) : null;

  // Only the roles that actually have art. useLoader caches and suspends,
  // and SceneSlot already wraps the scene in a Suspense boundary.
  const urls = useMemo(
    () => [...new Set(layout.map((t) => t.role.logo).filter(Boolean))],
    [layout],
  );
  const loaded = useLoader(THREE.TextureLoader, urls);
  const byUrl = useMemo(
    () => Object.fromEntries(urls.map((u, i) => [u, loaded[i]])),
    [urls, loaded],
  );

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, HERO_STOP.y, HERO_STOP.z], fov: 52 }}
      onPointerMissed={() => onFocus(null)}
      style={{ position: "absolute", inset: 0 }}
      // The stage owns where this sits on the page.
    >
      <color attach="background" args={["#000000"]} />
      {/* Exponential rather than linear: distance falls off smoothly into
          the background instead of everything past a hard plane vanishing
          at once. Matched to the page background so there is no seam. */}
      <fogExp2 attach="fog" args={["#000000", 0.019]} />
      <ambientLight intensity={0.16} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} />

      <Rig target={target} narrow={narrow} />
      <Distant />
      <Approach />
      <ClusterSigns hidden={Boolean(focused)} />

      {/* Mirrored, non-interactive copies, foreshortened. A full-length
          mirror reads as a second skyline hanging downward. */}
      <group scale={[1, -0.45, 1]}>
        {layout.map((tower) => (
          <Building
            key={`r-${tower.role.id}`}
            tower={tower}
            windows={windows}
            frame={frame}
            logo={tower.role.logo ? byUrl[tower.role.logo] : null}
            focused={tower.role.id === focused}
            dimmed={Boolean(focused) && tower.role.id !== focused}
            onFocus={() => {}}
            mirrored
          />
        ))}
      </group>

      {layout.map((tower) => (
        <Building
          key={tower.role.id}
          tower={tower}
          windows={windows}
          frame={frame}
          logo={tower.role.logo ? byUrl[tower.role.logo] : null}
          focused={tower.role.id === focused}
          dimmed={Boolean(focused) && tower.role.id !== focused}
          onFocus={onFocus}
        />
      ))}

      <Ground />

      {/* Thresholded at 0.9 so bloom only catches the crowns and masts,
          which are the only things pushed past 1.0 - hence their
          toneMapped={false}. */}
      <EffectComposer enableNormalPass={false}>
        <Bloom
          mipmapBlur
          intensity={1.15}
          luminanceThreshold={0.9}
          luminanceSmoothing={0.3}
        />
      </EffectComposer>
    </Canvas>
  );
}
