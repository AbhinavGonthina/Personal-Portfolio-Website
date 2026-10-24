import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { ARC_GROUPS, experience } from "../data/experience";
import { getSeen, setSeen, getJourney } from "../lib/stage";
import { STOP, STOPS } from "../lib/stops";
import {
  ACCENT,
  MAT,
  SCENE,
  tintTown,
  useTownMaterials,
} from "../lib/townMaterials";
import { useTheme } from "../lib/theme";
import { Billboard, Dressing, House, Interior, Mailboxes } from "./town";
import { box, cyl } from "../lib/geo";
import { makeTextTexture } from "../lib/canvasText";
import { ExtrudedText, Ground } from "./street";
import Motes from "./motes";
import Car from "./arrival";
import { ARRIVAL_END, arrivalShot, ride } from "../lib/arrivalPath";
import { jumpTo } from "../lib/scrollLock";
import { clearReady, markReady } from "../lib/ready";
import { endArrival, frozenAt, isArriving, useArriving } from "../lib/arrival";
import { markLanded } from "../lib/welcome";
import {
  CRANE,
  FOG,
  FR,
  frameBox,
  frameStep,
  getSwitch,
  sceneReady,
  OPEN,
  placePage,
  SHUT,
  SLIDE,
  WIDE,
} from "../lib/switchView";
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

function makeNamePlate(text, faceW, theme) {
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
  // The name takes whichever of the two the wall behind it is not.
  // White on a near-black tower at night; on a daylight tower the
  // same white is a name you cannot read.
  const day = theme === "light";
  tintTown(theme);
  g.fillStyle = MAT.letterInk;
  // The wall behind is lit windows, not flat black. Three passes build the
  // shadow into a dark pad under the glyphs so they stay legible over one.
  g.shadowColor = day ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.92)";
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
  live,
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

  // Scrolling off the arc takes the pointer handlers away with
  // `live`, and a handler that no longer exists cannot fire its
  // `onPointerOut` - so a building you were pointing at when you
  // left stayed lit until you came back and pointed at it again.
  // Nothing else clears it: the ray is only recast when the pointer
  // moves, and scrolling away does not move the pointer.
  useEffect(() => {
    if (!live && hovered) setHovered(false);
  }, [live, hovered]);
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
  const theme = useTheme();
  const plate = useMemo(
    () => makeNamePlate(role.company, w, theme),
    [role.company, w, theme],
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
  const events =
    mirrored || live === false
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
      {!mirrored && live !== false && (
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

      {/* Outlines are what keeps a tower off the background. The
          reflection has a pavement behind it and is a silhouette
          anyway, so it goes without. */}
      {!mirrored && (
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
      )}

      <mesh ref={body} position={[0, body_h / 2, 0]}>
        <ShaftGeo form={form} w={w} d={d} h={body_h} />
        <meshStandardMaterial
          color={MAT.tower}
          emissive={role.accent}
          emissiveMap={map}
          emissiveIntensity={IDLE * 0.5}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* A narrower upper stage. */}
      {top === "setback" && !mirrored && (
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
            color={MAT.tower}
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
          color={MAT.towerTop}
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
            color={MAT.tower}
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
            color={MAT.tower}
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
              color={MAT.towerTop}
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
      {/* Neither the badge nor the name goes into the reflection.
          They are four draw calls apiece of small type, upside down
          at forty-five percent under a dark pavement - nothing you
          could read, and a third of what the mirrored copies cost. */}
      {logo && !mirrored && (
        <group position={[0, signTop - BADGE / 2, faceZ + 0.018]}>
          <mesh position={[0, 0, -0.014]} ref={sign(0)}>
            <planeGeometry args={[BADGE * 0.98, BADGE * 0.98]} />
            <meshStandardMaterial
              color={MAT.towerSign}
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
      {!mirrored && (
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
      )}

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
  const theme = useTheme();
  const made = useMemo(
    () =>
      ARC.map(({ id, ground, centre }) => ({
        id,
        ...makeTextTexture(ground, { theme }),
        angle: centre * DEG,
      })),
    [theme],
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
        <meshBasicMaterial color={MAT.far} />
      </mesh>
      {/* One colour for the far lights rather than eight: at this
          distance individual hues turn to mud, and a single cool white
          with the accents only in the foreground keeps the eight that
          matter legible. */}
      <mesh geometry={made.lit}>
        <meshBasicMaterial color={MAT.farLine} toneMapped={false} />
      </mesh>
    </group>
  );
}

const ease = (p) => p * p * (3 - 2 * p);

/**
 * How far the cursor turns your head at a stop that is framing one
 * thing: about eleven degrees each way across, seven up and down.
 *
 * Loose enough to look around a room and see what is beside the thing
 * you came for, tight enough that pointing at a corner of the screen
 * does not throw the subject off the other side. The skyline overrides
 * both, because looking about is the whole activity there.
 */
const LOOK_YAW = 0.2;
const LOOK_PITCH = 0.12;
const lerp = (a, b, t) => a + (b - a) * t;

// Turn, walk, settle. The aim is on the way in by PIVOT_IN and stays
// there until PIVOT_OUT; the feet do not start until PIVOT_HOLD.
const PIVOT_IN = 0.3;
const PIVOT_OUT = 0.74;
const PIVOT_HOLD = 0.28;
// The least time an approach may take, in seconds. Long enough that
// the turn, the walk and the look are three things you watch rather
// than one thing that happened.
const APPROACH_S = 2.4;
// The most wall time one frame may contribute to that.
const PACE_MAX_DT = 0.25;
// The longest a skip may hold the camera at its destination while
// it waits for the page to catch up.
const SKIP_CEILING = 4000;
// How close the page has to get to the destination before the hold
// lets go. A nav scroll settles a little short of the stop it aims
// at, so this cannot be zero.
const SKIP_ARRIVED = 0.25;

/**
 * Which side of the house a point on the walk is: before it, after
 * it, or inside.
 *
 * The house is entered on the way to Skills and left on the way to
 * Contact, so everything from Skills to just short of Contact is
 * indoors.
 */
const side = (v) => (v < STOP.skills ? -1 : v > STOP.contact - 0.2 ? 1 : 0);

/**
 * Whether a trip from a to b would pass through the house.
 *
 * Both ends outside it, on opposite sides. Going in is a walk worth
 * watching, and coming out of it is too - only passing through is
 * not, and that is the one this answers yes to.
 *
 * Sides rather than "near the start, near the end": the first cut
 * at this asked whether a was within a quarter stop of Experience,
 * which is true of somebody standing at that stop and false of
 * somebody half way up the garden path - and from the path, which
 * is still outside the house, clicking Contact walked them in
 * through it.
 */
const spansHouse = (a, b) => {
  const sa = side(a);
  const sb = side(b);
  return sa !== 0 && sb !== 0 && sa !== sb;
};
const span = (v, lo, hi) => Math.min(1, Math.max(0, (v - lo) / (hi - lo)));

const SHOT = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 };
// Scratch, like SHOT: the arrival runs this every frame and a fresh
// object a frame is litter for the collector to deal with later.
const RIDE = { y: 0, pitch: 0, roll: 0 };
const A = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 };
const B = { px: 0, py: 0, pz: 0, lx: 0, ly: 0, lz: 0 };

/**
 * Resolves one stop into a camera position and a point to look at.
 *
 * A `frame` stop is the interesting one: the object's own facing normal
 * gives the approach, and the push that clears the right half of the
 * viewport for the copy runs along the camera's right rather than the
 * world's X - so the shot holds whatever direction the thing happens to
 * face, and the offset is derived from how wide the camera actually
 * sees at that distance rather than guessed in world units.
 */
function resolve(stop, out, cam, pointer, t) {
  if (stop.free) {
    const [px, py, pz] = stop.free.pos;
    const [lx, ly, lz] = stop.free.look;
    out.px = px;
    out.py = py;
    out.pz = pz;
    out.lx = lx;
    out.ly = ly;
    out.lz = lz;
    return out;
  }

  if (stop.street) {
    // Standing in the middle of the arc. The aim is left alone here -
    // every stop gets the same look-around applied afterwards, so the
    // only thing special about this one is that it also slides a
    // little with the pointer, which is what gives the skyline its
    // parallax.
    // 0.7, which is what sin(0.62 * pointer) came to before the aim
    // and the slide were separated - the same parallax, just no longer
    // tangled up with the turn.
    out.px = pointer.x * 0.7;
    out.py = 1.8 + Math.sin(t * 0.09) * 0.06;
    out.pz = 3.6;
    out.lx = out.px;
    out.ly = out.py + Math.tan(0.17) * 14;
    out.lz = out.pz - 14;
    return out;
  }

  const { at, yaw, dist, centred, eye } = stop.frame;
  const nx = Math.sin(yaw);
  const nz = Math.cos(yaw);
  const rx = Math.cos(yaw);
  const rz = -Math.sin(yaw);
  // A centred stop puts the subject in the middle of the frame. Only
  // Experience still pushes its subject aside, because only Experience
  // has a panel of copy to make room for; every other stop carries its
  // words on a surface in the world.
  const halfW = centred ? 0 : Math.tan((cam.fov * DEG) / 2) * dist * cam.aspect;

  out.px = at[0] + nx * dist + rx * halfW * 0.46;
  out.pz = at[2] + nz * dist + rz * halfW * 0.46;
  // A stop says its own height, or takes the subject's. Most of them
  // say `eye` and stand on the ground, because a town seen from
  // standing height is a town you are walking through. The board is
  // the exception and asks for neither: it is the one surface on the
  // walk whose whole job is to be read, and read from underneath its
  // type keystones away towards the top.
  out.py = eye ?? at[1] + (centred ? 0 : 0.25);
  out.lx = at[0] + rx * halfW * 0.4;
  out.lz = at[2] + rz * halfW * 0.4;
  out.ly = at[1];
  return out;
}

const LOOK = { x: 0, y: 3, z: -2 };

/** `?perf=1` prints what a frame costs, once a second. */
const WATCH =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("perf");

function Perf() {
  // The scene itself, for the bench script. Behind `?perf` with the
  // rest of this, so nothing is exported in a normal page.
  const three = useThree();
  useEffect(() => {
    window.__three = three;
    return () => delete window.__three;
  }, [three]);
  const n = useRef(0);
  const t = useRef(0);
  const acc = useRef({ calls: 0, tris: 0 });
  const { gl } = useThree();
  useEffect(() => {
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);
  useFrame((state, delta) => {
    const r = state.gl.info.render;
    acc.current.calls += r.calls;
    acc.current.tris += r.triangles;
    state.gl.info.reset();
    n.current++;
    t.current += delta;
    if (t.current >= 1) {
      window.__perf = {
        fps: +(n.current / t.current).toFixed(1),
        calls: Math.round(acc.current.calls / n.current),
        tris: Math.round(acc.current.tris / n.current),
        geoms: state.gl.info.memory.geometries,
        tex: state.gl.info.memory.textures,
        dpr: state.gl.getPixelRatio(),
      };
      n.current = 0;
      t.current = 0;
      acc.current = { calls: 0, tris: 0 };
    }
  });
  return null;
}

/** Non-null when `?at=` is pinning the arrival to one moment. */
const HELD = frozenAt();

/**
 * The arrival runs on its own clock, shared with the car so the door
 * opens on the same beat the camera turns to look at it.
 */
/**
 * The field of view, so a narrow window stops cropping the shots.
 *
 * Every stop is composed as a picture - the arc of towers at
 * Experience is as wide as it is because that is what fits. A
 * perspective camera is given a vertical angle though, and what a
 * vertical angle shows horizontally depends on the shape of the
 * window: at 16:9 the arc fits, and at 1024x700 it does not. The
 * group labels ran off both sides of the screen.
 *
 * So below a reference shape the vertical angle opens until the
 * horizontal one is back where it was. A narrow window sees more sky
 * and more pavement rather than less town, which is the trade worth
 * making - nothing is composed against the top and bottom edges here
 * and the whole of Experience is composed against the sides.
 *
 * 16:10, not 16:9, because 16:10 is the narrowest shape the shots
 * were framed in. Anything that wide or wider is left exactly as it
 * was; this only ever gives width back, never takes it.
 */
const FOV = 52;
const REF_ASPECT = 16 / 10;

function Lens() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    const want =
      aspect >= REF_ASPECT
        ? FOV
        : (2 *
            Math.atan(Math.tan((FOV * Math.PI) / 360) * (REF_ASPECT / aspect)) *
            180) /
          Math.PI;
    if (Math.abs(camera.fov - want) < 0.01) return;
    camera.fov = want;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

function Rig({ target, narrow, clock }) {
  // Where the camera is along the walk, which is not always where
  // the scroll is. See the pacing below.
  const walked = useRef(null);
  const lastFrame = useRef(0);
  // Where a skip is holding the camera, and when it gives up. Null
  // when no skip is running.
  const skipTo = useRef(null);
  const skipUntil = useRef(0);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-2.6 * delta);
    const cam = state.camera;
    const halfFov = (cam.fov * DEG) / 2;
    const t = state.clock.elapsedTime;

    // Arriving by car. The sequence owns the camera outright until
    // it hands over, which it does by ending on the landing shot -
    // so there is nothing to blend and nothing to argue about.
    if (isArriving()) {
      // Wall time from the first frame of the sequence, not summed
      // deltas.
      //
      // R3F measures delta from when the Canvas was created, and
      // this scene spends a second or two building merged geometry
      // before its first frame, so the first delta was that whole
      // gap and the sequence jumped straight past itself. Clamping
      // the delta fixed that and introduced a worse bug: on a slow
      // machine every honest frame gets docked too, and the arrival
      // stretches to several times its length. Taking the baseline
      // on the first frame of the sequence costs nothing and is
      // right at any frame rate.
      if (!clock.current.start) clock.current.start = performance.now();
      clock.current.t =
        HELD ?? (performance.now() - clock.current.start) / 1000;
      arrivalShot(clock.current.t, SHOT);
      // Sitting in a car that is still moving. The eye takes the
      // body's vertical movement and not its pitch or roll, which
      // is roughly what a neck does, and the look target takes the
      // same offset so the shake is the cabin moving rather than
      // the camera nodding at it.
      ride(clock.current.t, RIDE);
      cam.position.set(SHOT.px, SHOT.py + RIDE.y, SHOT.pz);
      LOOK.x = SHOT.lx;
      LOOK.y = SHOT.ly + RIDE.y;
      LOOK.z = SHOT.lz;
      cam.lookAt(LOOK.x, LOOK.y, LOOK.z);
      if (HELD === null && clock.current.t >= ARRIVAL_END) endArrival();
      return;
    }

    if (!target) {
      // Scroll walks the camera from one stop to the next. Everything
      // between two stops is the same shot moving, which is the whole
      // point of one canvas spanning the page.
      // The scroll says where to be; a pivoting approach says how
      // fast it may be got to.
      //
      // Staging the approach inside its own segment is not enough,
      // because a hard flick does not stay in the segment: the
      // scroll lands past it within a frame or two, `i` moves on to
      // the next pair of stops, and the staging it was about to
      // play is simply not the code running any more.
      //
      // So the camera has its own position along the walk. It may
      // only advance at walking pace while it is inside an approach
      // that asked to be walked; everywhere else it is the scroll
      // exactly, and going backwards is never paced, because
      // leaving should answer at once.
      //
      // Wall time, not summed deltas, and capped at PACE_MAX_DT a
      // frame. The cap does two jobs: the canvas stops entirely
      // when it is not active, so the first frame after an idle
      // would otherwise arrive holding the whole idle and spend it
      // in one step, and a machine that drops a long frame would
      // skip the walk for the same reason. Capped, a slow machine
      // stretches the walk and never loses it.
      const nowMs = performance.now();
      const dt = Math.min((nowMs - lastFrame.current) / 1000, PACE_MAX_DT);
      lastFrame.current = nowMs;

      const want = Math.min(STOPS.length - 1.0001, Math.max(0, getJourney()));
      if (walked.current === null) walked.current = want;

      // A link from one side of the house to the other does not go
      // through the house.
      //
      // The walk is the point while you are scrolling; when you have
      // clicked Contact you have said where you want to be, and four
      // stops of somebody else's living room on the way is not
      // continuity, it is waiting. Worse, the room is built as the
      // camera passes through it and is still compiling when it
      // arrives, so what you got was two seconds of a black box you
      // did not ask to be in.
      //
      // Only when both ends are outside: clicking Skills from the
      // street still walks in through the door, because that is the
      // shot the walk was built for.
      // Held until the page itself arrives, not until the jump
      // window closes.
      //
      // Two things had to be got right here. The question cannot be
      // re-asked each frame, because the answer changes the thing
      // it is asked about - the first frame moves the camera to the
      // far end, so the second frame finds it is no longer on the
      // near side and switches the skip off. And the hold cannot
      // end with `isJumping`, which gives up as soon as the page is
      // found standing still: a smooth scroll that stalls for one
      // frame ends the jump early, the camera drops back to
      // wherever the scroll has got to, and if that is the middle
      // of the house then the middle of the house is where it goes.
      //
      // So a skip latches on the destination and holds the camera
      // there until the scroll is on the same side of the house,
      // with a ceiling so it can never stick.
      const dest = jumpTo();
      // A second link supersedes the first.
      //
      // The latch below holds the camera at wherever a link sent it
      // until the scroll catches up, with a four second ceiling.
      // Changing your mind mid-flight turns the scroll round at
      // once, and the latch did not turn with it: it went on
      // waiting for a destination nobody was travelling to any
      // more, so the page arrived home while the view sat at
      // Contact for the rest of those four seconds and only then
      // followed. From the chair that is clicking the name,
      // watching nothing happen, and then watching it happen.
      //
      // Dropping it here lets the clause underneath re-latch on
      // the new destination in the same frame, so the view leaves
      // for where you have just asked to go rather than finishing
      // a journey you cancelled.
      if (
        dest !== null &&
        skipTo.current !== null &&
        dest !== skipTo.current
      ) {
        skipTo.current = null;
      }
      if (
        dest !== null &&
        skipTo.current === null &&
        spansHouse(walked.current, dest)
      ) {
        skipTo.current = dest;
        skipUntil.current = nowMs + SKIP_CEILING;
      }
      // Released when the page has actually arrived, not when it has
      // merely come out the other side of the house.
      //
      // Testing the side was wrong in one direction. Going back from
      // Contact to About, the camera is held at About while the
      // scroll travels 6 to 1 - and it crosses onto About's side of
      // the house at 2.9, four fifths of the way through the trip.
      // The hold let go there, the camera dropped to 2.9, and then
      // walked down to 1 a second time. From the chair that is the
      // view arriving, flinching back and arriving again.
      if (
        skipTo.current !== null &&
        (Math.abs(want - skipTo.current) < SKIP_ARRIVED ||
          nowMs > skipUntil.current)
      ) {
        skipTo.current = null;
      }
      const skipping = skipTo.current !== null;
      const seg =
        STOPS[Math.min(STOPS.length - 1, Math.floor(walked.current) + 1)];
      // Only an approach that asked to be walked is paced, and only
      // forwards: leaving should answer at once.
      walked.current = skipping
        ? skipTo.current
        : want <= walked.current || !seg?.pivot
          ? want
          : Math.min(want, walked.current + dt / APPROACH_S);
      // Everything that shows or hides itself because of where the
      // camera is reads this, not the scroll.
      setSeen(walked.current);
      const j = walked.current;
      const i = Math.floor(j);
      const f = ease(j - i);
      const a = STOPS[i];
      const b = STOPS[Math.min(STOPS.length - 1, i + 1)];
      resolve(a, A, cam, state.pointer, t);
      resolve(b, B, cam, state.pointer, t);

      // How far the cursor can turn your head, blended between the two
      // stops like everything else.
      const sway = lerp(a.sway ?? LOOK_YAW, b.sway ?? LOOK_YAW, f);
      const rise = lerp(a.rise ?? LOOK_PITCH, b.rise ?? LOOK_PITCH, f);

      // A stop can name a point to go through on the way in. Without
      // it the camera takes the straight line, which for the house
      // means cutting the corner and phasing through a side wall
      // instead of walking up the path and through the door.
      const via = b.via;
      if (via) {
        // A pivoting stop holds still while it turns, so the position
        // curve starts late and the aim is already pointed where the
        // walk is going by the time the walk starts.
        const fa = f;
        const fp = b.pivot ? ease(span(fa, PIVOT_HOLD, 1)) : f;
        const u = 1 - fp;
        const q = (a0, v0, b0) => u * u * a0 + 2 * u * fp * v0 + fp * fp * b0;
        SHOT.px = q(A.px, via[0], B.px);
        SHOT.py = q(A.py, via[1], B.py);
        SHOT.pz = q(A.pz, via[2], B.pz);
        const vl = b.viaLook ?? via;
        if (!b.pivot) {
          SHOT.lx = q(A.lx, vl[0], B.lx);
          SHOT.ly = q(A.ly, vl[1], B.ly);
          SHOT.lz = q(A.lz, vl[2], B.lz);
        } else if (fa < PIVOT_IN) {
          // Turning on the spot.
          const g = ease(fa / PIVOT_IN);
          SHOT.lx = lerp(A.lx, vl[0], g);
          SHOT.ly = lerp(A.ly, vl[1], g);
          SHOT.lz = lerp(A.lz, vl[2], g);
        } else if (fa > PIVOT_OUT) {
          // Arrived, and turning to the thing the stop is about.
          const g = ease(span(fa, PIVOT_OUT, 1));
          SHOT.lx = lerp(vl[0], B.lx, g);
          SHOT.ly = lerp(vl[1], B.ly, g);
          SHOT.lz = lerp(vl[2], B.lz, g);
        } else {
          // Walking, with the aim held where it was pointed.
          SHOT.lx = vl[0];
          SHOT.ly = vl[1];
          SHOT.lz = vl[2];
        }
      } else {
        for (const key of ["px", "py", "pz", "lx", "ly", "lz"]) {
          SHOT[key] = lerp(A[key], B[key], f);
        }
      }
      // Look around. The same gesture everywhere: the aim swings about
      // the camera in both axes, so a nudge reads as turning your head
      // rather than sliding the whole shot. Only the amount differs -
      // the middle of the skyline is somewhere you are meant to look
      // about in, the rest are shots of one thing.
      //
      // Done in spherical terms rather than as a flat Y rotation,
      // which could only turn sideways and turned the wrong way at
      // that: pointing right looked left.
      {
        const dx = SHOT.lx - SHOT.px;
        const dy = SHOT.ly - SHOT.py;
        const dz = SHOT.lz - SHOT.pz;
        const flat = Math.hypot(dx, dz);
        const reach = Math.hypot(flat, dy) || 1;
        // Azimuth decreases to the right, because x = sin(az) and the
        // camera looks down -Z, where az is near PI.
        const az =
          Math.atan2(dx, dz) -
          state.pointer.x * sway -
          Math.sin(t * 0.07) * 0.02;
        const el = Math.max(
          -0.42,
          Math.min(
            0.52,
            Math.atan2(dy, flat) +
              state.pointer.y * rise +
              Math.sin(t * 0.05) * 0.008,
          ),
        );
        const out = Math.cos(el) * reach;
        SHOT.lx = SHOT.px + Math.sin(az) * out;
        SHOT.lz = SHOT.pz + Math.cos(az) * out;
        SHOT.ly = SHOT.py + Math.sin(el) * reach;
      }

      cam.position.x += (SHOT.px - cam.position.x) * k;
      cam.position.y += (SHOT.py - cam.position.y) * k;
      cam.position.z += (SHOT.pz - cam.position.z) * k;
      LOOK.x += (SHOT.lx - LOOK.x) * k;
      LOOK.y += (SHOT.ly - LOOK.y) * k;
      LOOK.z += (SHOT.lz - LOOK.z) * k;
      crane(state, cam);
      cam.lookAt(LOOK.x, LOOK.y, LOOK.z);
      return;
    }

    // Square on to the building, not to the world.
    //
    // Backing straight off along +Z was fine for the two towers in the
    // middle of the arc and wrong for everything else: the buildings at
    // either end stand turned by up to sixty degrees, so you flew in and
    // met them at a corner. The approach runs along the building's own
    // facing normal, which - since every building is turned to look at
    // the centre of the arc - points from it back at the viewer.
    const dist = narrow ? 22 : 13.5;
    const nx = -Math.sin(target.angle);
    const nz = Math.cos(target.angle);
    const rx = Math.cos(target.angle);
    const rz = Math.sin(target.angle);
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
    crane(state, cam);
    cam.lookAt(LOOK.x, LOOK.y, LOOK.z);
  });
  return null;
}

/**
 * Lifts off whatever shot the rig just worked out and backs away
 * until the whole town is in frame.
 *
 * Blended over the top rather than branched around, so it works from
 * any stop and from a focused building - and so the scroll rig keeps
 * running underneath and is already in the right place when the
 * crane comes back down.
 *
 * The fog has to open as it goes. At ninety units the exponential
 * falloff is a grey wall, and the shot the whole move exists to
 * arrive at would have nothing in it.
 */
function crane(state, cam) {
  const sw = getSwitch();
  const c = CRANE(sw);
  if (c <= 0) return;
  cam.position.x += (WIDE.px - cam.position.x) * c;
  cam.position.y += (WIDE.py - cam.position.y) * c;
  cam.position.z += (WIDE.pz - cam.position.z) * c;
  LOOK.x += (WIDE.lx - LOOK.x) * c;
  LOOK.y += (WIDE.ly - LOOK.y) * c;
  LOOK.z += (WIDE.lz - LOOK.z) * c;
  const fog = state.scene.fog;
  if (fog) fog.density = (FOG.near + (FOG.far - FOG.near) * c) * SCENE.fog;

  // Then the view travels to the second frame.
  //
  // By turning, not by sliding sideways. A turn moves everything on
  // screen by the same angle whatever depth it is at, so the town,
  // the wood and the stars all travel exactly as far as the frame
  // carrying them does. A lateral move would have slid each of them
  // by a different amount and torn the picture out of its frame.
  const slide = SLIDE(sw);
  if (slide <= 0) return;
  const yaw = slide * Math.atan(frameStep(cam) / FR.d);
  const dx = LOOK.x - cam.position.x;
  const dz = LOOK.z - cam.position.z;
  const cos = Math.cos(yaw);
  const sin = Math.sin(yaw);
  LOOK.x = cam.position.x + dx * cos - dz * sin;
  LOOK.z = cam.position.z + dx * sin + dz * cos;
}

/**
 * Four slabs that close in around the view like a bezel.
 *
 * Parented to the camera rather than placed in the world, so they
 * frame the screen from wherever the crane has got to. Their inner
 * edges start just outside the frustum at the distance they sit at
 * and travel inwards, which is a matte closing rather than a border
 * being drawn.
 *
 * Parented, not copied. Copying the camera's transform in here meant
 * reading it in one `useFrame` and writing it in another, and this
 * one is registered first - so the border wore the camera from the
 * frame before while the town inside it wore the current one. A
 * fixed lag would only have been an offset; what made it shake is
 * that the gap is a frame's worth of camera motion and frames are
 * not all the same length. Hanging the group off the camera means
 * three.js derives the matrix during the same traversal it draws
 * with, so there is no order to get wrong.
 */
const CLOSE = 0.42;

/**
 * Tells the switch when the town is actually ready to be looked at.
 *
 * `gl.compile` on the first frame rather than letting three compile
 * each material the first time it happens to draw it: the cost is
 * the same either way, and the question is only whether it is paid
 * while the page is sitting still or while the camera is moving.
 */
const WARM_FAST = 60;
const WARM_SETTLED = 2;
const WARM_FRAMES = 30;

function Warmup() {
  const frames = useRef(0);
  const calm = useRef(0);
  const done = useRef(false);
  useFrame((state, delta) => {
    if (done.current) return;
    frames.current += 1;
    if (frames.current === 1) {
      state.gl.compile(state.scene, state.camera);
      return;
    }
    // Settled, not counted. A fixed number of frames was wrong in
    // both directions: two was not enough to get the composer and
    // the first real draws out of the way, and any number large
    // enough for a slow machine is a wait a fast one does not need.
    // Cheap frames in a row are the actual signal that the building
    // is over, whatever it took to get there.
    calm.current = delta * 1000 < WARM_FAST ? calm.current + 1 : 0;
    if (calm.current >= WARM_SETTLED || frames.current >= WARM_FRAMES) {
      done.current = true;
      sceneReady();
      markReady();
    }
  });
  // The next canvas starts cold, so the indicator has to come back.
  useEffect(() => clearReady, []);
  return null;
}

function Frames() {
  const g = useRef();
  const parts = useRef([]);
  const camera = useThree((s) => s.camera);
  useFrame((state) => {
    const grp = g.current;
    const q = parts.current;
    if (!grp || !q[11]) return;
    const sw = getSwitch();
    const shut = SHUT(sw);
    grp.visible = shut > 0;
    if (shut <= 0) return;

    const cam = state.camera;
    const { h, w } = frameBox(cam);
    const step = frameStep(cam);
    const slide = SLIDE(sw);
    const open = OPEN(sw);
    const D = FR.d;

    // The first frame: the hole the town is seen through. It closes
    // in, then travels off to the left.
    const aw = w * (1 - FR.shut * shut);
    const ah = h * (1 - FR.shut * shut);
    const ax = -slide * step;

    const put = (m, x, y, sx, sy, z) => {
      m.position.set(x, y, z);
      m.scale.set(Math.max(0.001, sx), Math.max(0.001, sy), 1);
    };
    // Matte around it. Oversized, so it still covers the window once
    // the frame has travelled out of the middle of it.
    put(q[0], ax, ah + h * 1.5, w * 8, h * 3, -D);
    put(q[1], ax, -ah - h * 1.5, w * 8, h * 3, -D);
    put(q[2], ax - aw - w * 4, 0, w * 8, h * 8, -D);
    put(q[3], ax + aw + w * 4, 0, w * 8, h * 8, -D);

    const e = h * 0.006;
    const line = (i, x, y, sx, sy, o) => {
      put(q[i], x, y, sx, sy, -D + 0.02);
      q[i].material.opacity = o;
    };
    const fade = shut * (1 - open);
    line(4, ax, ah, aw * 2, e, fade);
    line(5, ax, -ah, aw * 2, e, fade);
    line(6, ax - aw, 0, e, ah * 2, fade);
    line(7, ax + aw, 0, e, ah * 2, fade);

    // The second frame: the page, put in its place by the DOM, with
    // its edge drawn here beside the first one's.
    //
    // Both edges come out of the same four planes, the same colour
    // and the same thickness, because an edge in CSS beside an edge
    // in the scene is two different edges however carefully the two
    // are matched - and they were not matched, so the frame holding
    // the page looked like the poor relation of the one holding the
    // town. Half a thickness outside the rect, so the backing behind
    // the page does not cover the inner half of it.
    const bw = aw + (w - aw) * open;
    const bh = ah + (h - ah) * open;
    const bx = (step - slide * step) * (1 - open);
    const edge = Math.min(1, slide * 1.8) * (1 - open);
    line(8, bx, bh + e / 2, (bw + e) * 2, e, edge);
    line(9, bx, -bh - e / 2, (bw + e) * 2, e, edge);
    line(10, bx - bw - e / 2, 0, e, (bh + e) * 2, edge);
    line(11, bx + bw + e / 2, 0, e, (bh + e) * 2, edge);
    // Only while the run is actually in flight. At either end the
    // resting values are the switch's to write, and the scene is
    // about to be torn down anyway.
    if (sw > 0 && sw < 1) {
      const vw = state.size.width;
      const vh = state.size.height;
      placePage(bw / w, (bx / w) * (vw / 2), ((1 - bh / h) / 2) * vh);
    }
  });

  const grab = (i) => (el) => {
    if (el) parts.current[i] = el;
  };

  return (
    <primitive object={camera}>
      <group ref={g} visible={false}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} ref={grab(i)}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={MAT.bezel} toneMapped={false} />
          </mesh>
        ))}
        {[4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <mesh key={i} ref={grab(i)}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color={ACCENT.blue}
              toneMapped={false}
              transparent
            />
          </mesh>
        ))}
      </group>
    </primitive>
  );
}

/**
 * True once the crane has lifted far enough to see the edges of the
 * map. Read in the frame loop and pushed into state only when the
 * answer changes, which is twice a switch.
 */
function useWide() {
  const [on, setOn] = useState(false);
  useFrame(() => {
    const want = getSwitch() > 0.04;
    if (want !== on) setOn(want);
  });
  return on;
}

/**
 * Keeps a boolean in step with where the camera is, without rendering
 * every frame. Visibility gates only have to flip a few times a page,
 * so they are read in the frame loop and pushed into state only when
 * the answer actually changes.
 */
function useNear(from, to) {
  const [on, setOn] = useState(() => {
    const j = getSeen();
    return j >= from && j <= to;
  });
  useFrame(() => {
    const j = getSeen();
    const want = j >= from && j <= to;
    if (want !== on) setOn(want);
  });
  return on;
}

/**
 * Street lighting around the arc.
 *
 * The towers were standing on a grid with nothing between them and
 * it, which is what made the block read as models on a table. A ring
 * of lamps at pavement height gives the ground something to catch
 * and the buildings something to be lit by.
 *
 * One merged pair for the lot: posts in the structure tone, heads in
 * amber.
 */
function makeLamps() {
  const base = [];
  const lit = [];
  for (let i = 0; i < 10; i++) {
    const a = (-96 + i * 21) * DEG;
    const r = ARC_R + 4.4;
    const x = Math.sin(a) * r;
    const z = -Math.cos(a) * r;
    // Inward, towards the middle of the arc and therefore towards
    // the buildings. The arm was already turned by the lamp's own
    // angle, but the head was hung at a fixed offset in world z -
    // so every lamp aimed south whatever side of the ring it was
    // standing on, and the ones out on the flanks lit the empty
    // ground behind them.
    const ix = -Math.sin(a);
    const iz = Math.cos(a);
    base.push(cyl(0.07, 0.11, 4.2, 7, [x, 2.1, z]));
    base.push(
      box(0.08, 0.08, 1.1, [x + ix * 0.4, 4.15, z + iz * 0.4], [0, -a, 0]),
    );
    lit.push(
      new THREE.SphereGeometry(0.15, 10, 8)
        .scale(1.4, 0.6, 1)
        .translate(x + ix * 0.85, 4.05, z + iz * 0.85),
    );
  }
  return {
    base: mergeGeometries(base, false),
    lit: mergeGeometries(lit, false),
  };
}

function Lamps() {
  const made = useMemo(makeLamps, []);
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
        {/* The columns, which are the same tone as the town's
            structure and were the one lit thing still written as a
            literal - dark poles against a pale sky. */}
        <meshStandardMaterial
          color={MAT.post}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      <mesh geometry={made.lit}>
        <meshBasicMaterial color={ACCENT.amber} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * WELCOME, drifting down onto the pavement.
 *
 * It falls the way a sheet of paper does rather than the way a brick
 * does: slowly, swinging side to side, tipping as it goes, and
 * losing its wobble as it settles. The sway and the tilt are both
 * scaled by how far it still has to fall, so they damp out on their
 * own rather than needing a second animation to stop them.
 *
 * The same extruded lettering the clusters use, so the landing
 * speaks the skyline's language before you have scrolled anywhere.
 * It fades out as the camera leaves.
 */
const WELCOME_H = 0.92;
// High enough to be seen falling, brief enough to be over before
// anyone wonders what they are waiting for.
const DROP_FROM = 15;
const DROP_FOR = 2.1;

/**
 * When the sign starts falling if you arrived by car.
 *
 * Timed so it finishes half a second before the sequence hands over,
 * which puts the whole fall in the part where you are already out of
 * the car and facing the town. Waiting for the handover meant
 * standing in front of an empty street while a sign you could not
 * see yet got ready to drop.
 */
const DROP_AT = ARRIVAL_END - DROP_FOR - 0.5;

function Welcome({ clock }) {
  const mats = useRef([]);
  const sheet = useRef();
  // It drops when you turn and see the town, not when the page
  // loads. During the arrival you are facing a headrest, and a sign
  // landing behind you is a sign nobody saw - so it waits, but only
  // until you are out of the car, not until the sequence is over.
  const arriving = useArriving();
  // Accumulated delta rather than a timestamp off the shared clock.
  // The clock belongs to the Canvas and has been running since it was
  // created, so subtracting a captured start from it made the fall
  // depend on exactly when this component happened to mount - and in
  // practice it was over before the scene was on screen.
  const age = useRef(0);
  const theme = useTheme();
  const made = useMemo(() => makeTextTexture("WELCOME", { theme }), [theme]);
  useEffect(() => () => made.tex.dispose(), [made]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!arriving || clock.current.t >= DROP_AT) {
      age.current = Math.min(DROP_FOR, age.current + delta);
      // The hint underneath waits on this rather than on a timer of
      // its own that happens to be about as long.
      if (age.current >= DROP_FOR) markLanded();
    }

    if (sheet.current) {
      // Eased, so it decelerates into the ground rather than landing
      // at full speed.
      const p = age.current / DROP_FOR;
      const left = Math.pow(1 - p, 1.7);
      sheet.current.position.y = DROP_FROM * left;
      sheet.current.position.x = Math.sin(t * 1.15) * left * 2.4;
      sheet.current.rotation.z = Math.sin(t * 1.5) * left * 0.42;
      sheet.current.rotation.x = Math.sin(t * 0.9 + 1) * left * 0.45;
    }

    const k = 1 - Math.exp(-5 * delta);
    const want = 1 - Math.min(1, Math.max(0, (getJourney() - 0.12) / 0.5));
    for (const m of mats.current) if (m) m.opacity += (want - m.opacity) * k;
  });

  mats.current.length = 0;
  return (
    // On the camera's own view axis at this depth, so it lands in
    // the middle of the frame rather than off to one side.
    <group position={[-1.2, 0, 15]} rotation={[0, 0.03, 0]}>
      <group ref={sheet}>
        <group position={[0, WELCOME_H * 0.62, 0]}>
          <ExtrudedText
            tex={made.tex}
            aspect={made.aspect}
            height={WELCOME_H}
            depth={0.22}
            layers={12}
            matRef={(el) => el && mats.current.push(el)}
          />
        </group>
      </group>
    </group>
  );
}

/**
 * The skyline. Only clickable while the camera is actually standing in
 * it - from outside the house the towers are still on screen, and
 * clicking one from there would fly you back across town unasked.
 */
function Towers({ layout, windows, frame, byUrl, focused, onFocus }) {
  const live = useNear(STOP.experience - 0.45, STOP.experience + 0.5);
  return layout.map((tower) => (
    <Building
      key={tower.role.id}
      tower={tower}
      windows={windows}
      frame={frame}
      logo={tower.role.logo ? byUrl[tower.role.logo] : null}
      focused={tower.role.id === focused}
      dimmed={Boolean(focused) && tower.role.id !== focused}
      onFocus={onFocus}
      live={live}
    />
  ));
}

/**
 * Mirrored, non-interactive copies of the towers, foreshortened. A
 * full-length mirror reads as a second skyline hanging downward.
 *
 * Drawn wherever the towers are, which is everywhere. Gating this on
 * how close the camera was saved a few draw calls and cost something
 * worse: the whole pavement came alive as you walked towards it, so
 * the reflection read as an effect switching on rather than as what
 * the street is made of. The towers themselves are never gated, and
 * frustum culling already drops the ones behind you.
 */
function Reflections({ layout, windows, frame, byUrl, focused }) {
  return (
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
  );
}

/**
 * The outdoor lighting, and how much of it reaches inside.
 *
 * Indoors it falls to almost nothing. Out in the town a surface has
 * the sky to catch; in the room the only light is a desk lamp and a
 * rack of servers, and the walls have to fall away for either of them
 * to read as a light source at all.
 */
function Sky() {
  const amb = useRef();
  const hemi = useRef();
  const dir = useRef();
  const inside = useNear(STOP.experience + 0.6, STOP.contact - 0.4);

  // Read from the palette every frame rather than captured, so a
  // change of time of day eases in on the same spring the walk
  // indoors already uses instead of snapping.
  useFrame((_, delta) => {
    const k = 1 - Math.exp(-3 * delta);
    const t = inside ? 0 : 1;
    const [a0, a1] = SCENE.ambient;
    const [, , h0, h1] = SCENE.hemi;
    const [d0, d1] = SCENE.dir;
    if (amb.current)
      amb.current.intensity += (a0 + t * a1 - amb.current.intensity) * k;
    if (hemi.current) {
      hemi.current.intensity += (h0 + t * h1 - hemi.current.intensity) * k;
      hemi.current.color.set(SCENE.hemi[0]);
      hemi.current.groundColor.set(SCENE.hemi[1]);
    }
    if (dir.current)
      dir.current.intensity += (d0 + t * d1 - dir.current.intensity) * k;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.3} />
      <hemisphereLight ref={hemi} args={["#8d9ccb", "#0a0a14", 1.15]} />
      <directionalLight ref={dir} position={[14, 18, 22]} intensity={0.85} />
    </>
  );
}

/**
 * The colour behind everything, and the fog that reaches it.
 *
 * Both have to be the same or the horizon becomes a seam, so they
 * are set together from one place and in a frame callback rather
 * than as props - the fog's density is already animated per frame
 * by the walk indoors, and two owners of one object is how they
 * end up fighting.
 */
function Air() {
  const scene = useThree((s) => s.scene);
  // The colour last written, as the string the palette holds.
  // Comparing against `getHexString()` meant three string
  // allocations a frame - two `slice`s and the hex itself - to
  // answer a question that only changes when somebody clicks.
  const on = useRef(null);
  useFrame(() => {
    if (on.current === SCENE.sky) return;
    on.current = SCENE.sky;
    scene.background?.set(SCENE.sky);
    scene.fog?.color.set(SCENE.sky);
  });
  return null;
}

/**
 * Everything that is not a tower, with its visibility tied to where the
 * camera is. A group that is `visible={false}` is never submitted, so
 * the inside of the house costs nothing until you walk into it.
 *
 * The landmarks stay on throughout, because the establishing shot has
 * to show the whole town at once - that is what it is for.
 */
function Town({
  town,
  screen,
  skills,
  chrome,
  hint,
  onOpen,
  board,
  boardFace,
  marks,
}) {
  // Craned out far enough to see the edges of the map.
  const wide = useWide();
  // The door starts opening as the camera leaves the city, so arriving
  // and the door swinging are one motion rather than two that have to
  // agree with each other.
  const open = useNear(STOP.experience + 0.45, STOP.contact + 0.4);
  const inside = useNear(STOP.experience + 0.45, STOP.contact - 0.25);
  // The room has to exist before you reach the door, so `inside`
  // starts early and ends late. The ground cannot share that gate:
  // the same margin that builds the room in good time also took the
  // street out from under you half way along the path to the house,
  // and put it back while you were still in the doorway on the way
  // out. This one turns over within a few hundredths of the stop at
  // either end, by which point the walls are all you can see anyway.
  const walled = useNear(STOP.skills - 0.05, STOP.projects + 0.08);
  // Clicking them is still gated on being there - you should not be
  // able to open a link on a mailbox from across the town - but they
  // are part of the garden, and a garden that assembles itself as you
  // approach is a garden you have caught in the act.
  const mailLive = useNear(STOP.contact - 0.35, STOPS.length);
  // The boxes stand there from the first shot, because a town with
  // nothing down the far end is a town that stops. The thanks is a
  // goodbye and does not: it stays off for the whole walk up to the
  // house, so it is not read on the way in.
  //
  // It comes on just inside Skills rather than on the way out. By
  // then there are four walls between it and the camera, so the
  // moment it switches on is a moment nobody can see - and when you
  // do come out of that door it has been standing there the whole
  // time. Switching it on as you left meant switching it on in
  // shot.
  const mailGreet = useNear(STOP.skills + 0.3, STOPS.length);

  return (
    <>
      {/* The floor lives here so it can see the same gates the rest of
          the town does - though not the same one as the room. */}
      <Ground grid={!walled} />
      <Dressing mats={town} visible wide={wide} />
      <Billboard mats={town} visible board={board} face={boardFace} />
      <House mats={town} visible open={open} />
      <Interior
        mats={town}
        visible={inside}
        screen={screen}
        skills={skills}
        chrome={chrome}
        hint={hint}
        onOpen={onOpen}
        live={inside}
      />
      <Mailboxes
        mats={town}
        visible
        labels={marks}
        live={mailLive}
        greet={mailGreet}
      />
    </>
  );
}

export default function TownScene({
  focused,
  onFocus,
  active,
  narrow,
  screen,
  skills,
  chrome,
  hint,
  onOpen,
  board,
  boardFace,
  marks,
}) {
  const layout = useLayout();
  // The two settings that are props on an element rather than
  // values a frame callback can write: the bloom pass is
  // reconfigured by re-rendering it, not by poking at it.
  useTheme();
  const { bloom, bloomFloor, motes } = SCENE;
  const town = useTownMaterials();
  // Shared between the rig and the car, so the door opens on the
  // same beat the camera turns to look at it.
  const clock = useRef({ start: 0, t: 0 });
  const arriving = useArriving();
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
      // Fixed, not measured.
      //
      // This used to step down on its own when frames came in slow,
      // and stepping down calls setPixelRatio, which reallocates the
      // drawing buffer and hands back one blank frame. That was the
      // flicker to black after the car: the arrival is the heaviest
      // thing the scene ever does, so the measurement always tripped
      // right at the end of it. A ratio that never changes cannot
      // blank anything, and 1.25 keeps most of what the measuring
      // was buying on a high-density screen anyway.
      dpr={[1, 1.25]}
      // No antialias on the canvas itself. The composer renders the
      // scene into its own buffer and the canvas only ever receives
      // one full-screen quad off the back of it - a quad with no
      // edges inside the frame, so there is nothing there for
      // multisampling to smooth. Asking for it anyway allocated a
      // second multisampled buffer and resolved it every frame to
      // produce a pixel-identical picture.
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ position: STOPS[0].free.pos, fov: FOV }}
      onPointerMissed={() => onFocus(null)}
      style={{ position: "absolute", inset: 0 }}
      // The stage owns where this sits on the page.
    >
      <color attach="background" args={["#000000"]} />
      {/* No fog.
          It was exponential, matched to the background, and it did
          two jobs: it hid the far edge of the ground and it put
          distance between the camera and the city. The second one
          costs more than it pays - the far half of the town was
          being read through a haze, and in daylight a pale haze
          over a pale sky left everything at the same value. The
          ground is 150 across and the road runs to 92, so there is
          nothing within sight of the walk for a fog to hide. */}
      {/* Sky and ground fill. One directional light leaves whichever
          side of a building the camera happens to be on in the dark,
          and the camera visits all of them.
          Indoors they all drop away: a room lit by the sky has no
          shadows for a desk lamp to cut, and the lamp is the point. */}
      <Sky />

      <Air />
      <Lens />
      <Warmup />
      <Frames />
      {WATCH && <Perf />}
      <Rig target={target} narrow={narrow} clock={clock} />
      {arriving && <Car clock={clock} />}
      <Distant />
      {motes && <Motes />}
      <Lamps />
      <Welcome clock={clock} />
      <Town
        town={town}
        screen={screen}
        skills={skills}
        chrome={chrome}
        hint={hint}
        onOpen={onOpen}
        board={board}
        boardFace={boardFace}
        marks={marks}
      />
      <ClusterSigns hidden={Boolean(focused)} />

      <Reflections
        layout={layout}
        windows={windows}
        frame={frame}
        byUrl={byUrl}
        focused={focused}
      />

      <Towers
        layout={layout}
        windows={windows}
        frame={frame}
        byUrl={byUrl}
        focused={focused}
        onFocus={onFocus}
      />

      {/* Thresholded at 0.9 so bloom only catches the crowns and masts,
          which are the only things pushed past 1.0 - hence their
          toneMapped={false}. */}
      {/* 4 samples, not the 8 this defaults to. The whole picture is
          hairlines, so the samples are doing visible work and cannot
          go away - but they are the most expensive thing in the
          frame, and 8 of them at this resolution is bandwidth the
          line art cannot show the benefit of. */}
      <EffectComposer enableNormalPass={false} multisampling={4}>
        {/* Glow is a thing that happens to a bright object against
            a dark one. In daylight the threshold goes to 1 and the
            intensity to almost nothing, which leaves the pass in
            place - taking it out would rebuild the composer - and
            leaves it with nothing to find. */}
        <Bloom
          mipmapBlur
          intensity={bloom}
          luminanceThreshold={bloomFloor}
          luminanceSmoothing={0.3}
        />
      </EffectComposer>
    </Canvas>
  );
}
