import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { experience, EXPERIENCE_GROUPS } from "../data/experience";

/**
 * The roles as buildings on an arc that curves around the viewer: startups
 * off to the left, the two industry roles straight ahead, Northeastern to
 * the right. Clicking one flies the camera in and frames it on the left of
 * the viewport, leaving the right half for the written detail.
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
const ARC = [
  { id: "startup", centre: -52, step: 16 },
  { id: "work", centre: 0, step: 19 },
  { id: "northeastern", centre: 52, step: 12 },
];

/**
 * Per-group form. `h` is the height band a role is mapped into, so duration
 * still varies a building but never enough to make a teaching assistantship
 * out-tower a two-year role.
 */
const KIND = {
  work: { h: [6.6, 8.8], w: 1.05, d: 1.05 },
  startup: { h: [3.0, 4.1], w: 2.1, d: 1.7 },
  northeastern: { h: [2.3, 3.4], w: 1.25, d: 1.25 },
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
        out.push({
          role,
          kind: id,
          angle,
          x: Math.sin(angle) * ARC_R,
          z: -Math.cos(angle) * ARC_R,
          // Faces the centre of the arc, which is where the viewer stands.
          rotY: -angle,
          height: kind.h[0] + (kind.h[1] - kind.h[0]) * t,
          w: kind.w + (i % 2) * 0.14,
          d: kind.d + (i % 3) * 0.1,
          // The two industry towers are deliberately not twins: one steps
          // back near the top, the other runs straight up to a mast.
          variant: id === "work" ? (i === 0 ? "setback" : "mast") : null,
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

function Building({
  tower,
  windows,
  logo,
  focused,
  dimmed,
  onFocus,
  mirrored,
}) {
  const body = useRef();
  const crown = useRef();
  const light = useRef();
  const [hovered, setHovered] = useState(false);
  const { role, x, z, rotY, height, w, d, variant } = tower;
  const on = focused || hovered;
  const logoAspect = logo ? logo.image.width / logo.image.height : 3;

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
    if (body.current) {
      const m = body.current.material;
      m.emissiveIntensity += (target * 0.5 - m.emissiveIntensity) * k;
    }
    if (crown.current) {
      const m = crown.current.material;
      m.emissiveIntensity += (target * 5 - m.emissiveIntensity) * k;
    }
    if (light.current) {
      light.current.intensity += (target * 9 - light.current.intensity) * k;
    }
  });

  const shaft = variant === "setback" ? height * 0.78 : height;

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh
        ref={body}
        position={[0, shaft / 2, 0]}
        raycast={mirrored ? null : undefined}
        onPointerOver={(e) => {
          if (mirrored) return;
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          if (mirrored) return;
          e.stopPropagation();
          onFocus(role.id);
        }}
      >
        <boxGeometry args={[w, shaft, d]} />
        <meshStandardMaterial
          color="#09090b"
          emissive={role.accent}
          emissiveMap={map}
          emissiveIntensity={IDLE * 0.5}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* A narrower upper stage, so one of the two industry towers reads
          differently from the other at a glance. */}
      {variant === "setback" && (
        <mesh position={[0, shaft + (height - shaft) / 2, 0]}>
          <boxGeometry args={[w * 0.62, height - shaft, d * 0.62]} />
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
        <boxGeometry
          args={[
            (variant === "setback" ? w * 0.62 : w) + 0.11,
            0.26,
            (variant === "setback" ? d * 0.62 : d) + 0.11,
          ]}
        />
        <meshStandardMaterial
          color="#000000"
          emissive={role.accent}
          emissiveIntensity={IDLE * 5}
          toneMapped={false}
        />
      </mesh>

      {variant === "mast" && (
        <mesh position={[0, height + 0.85, 0]}>
          <cylinderGeometry args={[0.02, 0.05, 1.7, 6]} />
          <meshStandardMaterial
            color="#000000"
            emissive={role.accent}
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* The company's own mark, on the face toward the viewer. */}
      {logo && (
        <mesh position={[0, height * 0.72, d / 2 + 0.02]}>
          <planeGeometry args={[w * 0.92, (w * 0.92) / logoAspect]} />
          <meshBasicMaterial map={logo} toneMapped={false} transparent />
        </mesh>
      )}

      <pointLight
        ref={light}
        position={[0, height - 0.2, 0.9]}
        color={role.accent}
        intensity={0}
        distance={9}
        decay={2}
      />
    </group>
  );
}

/**
 * Labels, projected by hand into a plain DOM layer outside the canvas.
 *
 * drei's <Html> was the obvious choice and it dropped one of six on mount.
 * This is deterministic instead, and writing `style.transform` directly
 * means a 60fps camera does not cause 60 React renders a second.
 */
function Labels({ host, layout, hidden }) {
  const spans = useRef([]);
  const v = useRef(new THREE.Vector3());

  useEffect(() => {
    const parent = host?.current;
    if (!parent) return;
    const made = layout.map((t) => {
      const el = document.createElement("div");
      el.textContent = t.role.company;
      el.className =
        "absolute left-0 top-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted transition-opacity duration-300";
      parent.appendChild(el);
      return el;
    });
    spans.current = made;
    return () => made.forEach((el) => el.remove());
  }, [host, layout]);

  useFrame((state) => {
    const { width, height } = state.size;
    layout.forEach((t, i) => {
      const el = spans.current[i];
      if (!el) return;
      v.current.set(t.x, t.height + 0.9, t.z).project(state.camera);
      const px = (v.current.x * 0.5 + 0.5) * width;
      const py = (-v.current.y * 0.5 + 0.5) * height;
      const off = v.current.z > 1 || px < -90 || px > width + 90;
      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -100%)`;
      el.style.opacity = hidden || off ? "0" : "1";
    });
  });

  return null;
}

const LOOK = { x: 0, y: 3, z: -2 };
// Half the width and height the overview has to contain, in world units.
const ARC_HALF_W = 12.5;
const ARC_HALF_H = 7.6;

function Rig({ target, narrow }) {
  useFrame((state, delta) => {
    const k = 1 - Math.exp(-2.6 * delta);
    const p = state.pointer;
    const halfFov = (state.camera.fov * DEG) / 2;
    // How far back the camera must sit for a given world half-width to fit.
    const distFor = (halfW) =>
      halfW / (Math.tan(halfFov) * state.camera.aspect);

    let px, py, pz, lx, ly, lz;
    if (target) {
      pz = target.z + 13.5;
      py = target.height * 0.58;
      ly = target.height * 0.5;
      lz = target.z;
      // Sideways offset derived from how wide the camera actually sees at
      // this distance. A fixed world offset puts the building a third of
      // the way across a laptop and dead centre on an ultrawide.
      const halfW = Math.tan(halfFov) * 13.5 * state.camera.aspect;
      px = target.x + halfW * 0.5;
      lx = target.x + halfW * 0.42;
      if (narrow) {
        px = target.x;
        lx = target.x;
        py = target.height * 0.5 + 1.2;
        pz = target.z + 22;
        ly = -1.2;
      }
    } else {
      // Pulled back by whatever the aspect ratio demands, rather than a
      // fixed distance - otherwise the ends of the arc fall off the sides
      // of a narrow window and float in the middle of a wide one.
      const t = state.clock.elapsedTime;
      // Far enough back for *both* dimensions. Width alone was not enough:
      // the two industry towers are nearly 10 units tall with their masts
      // and were being clipped off the top of the frame.
      const forWidth = distFor(ARC_HALF_W);
      const forHeight = ARC_HALF_H / Math.tan(halfFov);
      pz = Math.max(14, Math.max(forWidth, forHeight) - 4);
      px = p.x * 1.2 + Math.sin(t * 0.11) * 1.1;
      py = 7 + p.y * 0.5 + Math.sin(t * 0.077) * 0.5;
      lx = Math.sin(t * 0.063) * 0.5;
      ly = 4.6;
      lz = -2;
    }

    state.camera.position.x += (px - state.camera.position.x) * k;
    state.camera.position.y += (py - state.camera.position.y) * k;
    state.camera.position.z += (pz - state.camera.position.z) * k;
    LOOK.x += (lx - LOOK.x) * k;
    LOOK.y += (ly - LOOK.y) * k;
    LOOK.z += (lz - LOOK.z) * k;
    state.camera.lookAt(LOOK.x, LOOK.y, LOOK.z);
  });
  return null;
}

export default function TowersScene({
  focused,
  onFocus,
  active,
  labelHost,
  narrow,
}) {
  const layout = useLayout();
  const windows = useMemo(makeWindowTexture, []);
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
      camera={{ position: [0, 6, 20], fov: 34 }}
      onPointerMissed={() => onFocus(null)}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 26, 70]} />
      <ambientLight intensity={0.16} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} />

      <Rig target={target} narrow={narrow} />
      <Labels host={labelHost} layout={layout} hidden={Boolean(focused)} />

      {/* Mirrored, non-interactive copies, foreshortened. A full-length
          mirror reads as a second skyline hanging downward. */}
      <group scale={[1, -0.45, 1]}>
        {layout.map((tower) => (
          <Building
            key={`r-${tower.role.id}`}
            tower={tower}
            windows={windows}
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
          logo={tower.role.logo ? byUrl[tower.role.logo] : null}
          focused={tower.role.id === focused}
          dimmed={Boolean(focused) && tower.role.id !== focused}
          onFocus={onFocus}
        />
      ))}

      {/* Above the floor sheet, not below it: the sheet is transparent, so
          it draws after everything opaque and would paint the grid out. */}
      <gridHelper
        args={[140, 110, "#3e3e3e", "#242424"]}
        position={[0, 0.02, 0]}
      />

      {/* The floor. A sheet of near-black over the mirrored copies rather
          than a reflective material - MeshReflectorMaterial renders the
          whole scene a second time into a texture, and at eight boxes the
          mirrored geometry is far cheaper for the same read. Below ground,
          because at y=0.01 it intersected and sliced every base. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[140, 140]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>

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
