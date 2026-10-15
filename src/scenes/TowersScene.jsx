import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { experience, EXPERIENCE_GROUPS } from "../data/experience";

/**
 * A skyline of the roles: one tower each, lit in that role's colour, grouped
 * into the three clusters the data already describes. Clicking a tower flies
 * the camera in and frames it on the left of the viewport, leaving the right
 * half for the written detail.
 *
 * Still entirely procedural - boxes, a canvas-drawn window texture, a grid,
 * two lights and one bloom pass. No models, no downloaded textures, no asset
 * pipeline.
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
const toMonths = (s) => {
  const [m, y] = s.split(" ");
  return Number(y) * 12 + Math.max(0, MONTHS.indexOf(m));
};

const SPACING = 2.5;
const CLUSTER_GAP = 2.2;
const IDLE = 0.3;

/** Heights compress hard: a 14-month role is not 14x a one-month one. */
const heightOf = (role) =>
  2.4 +
  Math.sqrt(Math.max(1, toMonths(role.end) - toMonths(role.start))) * 1.05;

/**
 * Windows, drawn once into a canvas rather than loaded as an image.
 *
 * It is a greyscale mask used as `emissiveMap`, so each tower multiplies it
 * by its own emissive colour and gets windows in its own light from one
 * shared texture. Rows are deliberately uneven - a perfectly regular grid of
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
      // Most windows are dark. The lit ones vary, which is what stops the
      // facade looking printed on.
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
 * Laid out left to right in the data's own grouping, so the three clusters
 * read as three districts, then centred on the origin.
 */
function useLayout() {
  return useMemo(() => {
    const out = [];
    let x = 0;
    EXPERIENCE_GROUPS.forEach((group, gi) => {
      if (gi > 0) x += CLUSTER_GAP;
      experience
        .filter((r) => r.category === group.id)
        .forEach((role) => {
          out.push({ role, x, height: heightOf(role) });
          x += SPACING;
        });
    });
    const span = x - SPACING;
    out.forEach((t) => (t.x -= span / 2));
    return out;
  }, []);
}

function Tower({ tower, windows, focused, dimmed, onFocus, mirrored }) {
  const body = useRef();
  const crown = useRef();
  const light = useRef();
  const [hovered, setHovered] = useState(false);
  const { role, x, height } = tower;
  const on = focused || hovered;

  // Its own copy of the shared texture: a clone keeps the one bitmap but
  // gets its own repeat and offset, so towers of different heights keep
  // square windows and no two facades line up.
  const map = useMemo(() => {
    const m = windows.clone();
    m.needsUpdate = true;
    m.repeat.set(2, Math.max(2, Math.round(height / 1.1)));
    m.offset.set(Math.random(), Math.random());
    return m;
  }, [windows, height]);

  useFrame((state, delta) => {
    const k = 1 - Math.exp(-6 * delta);
    // `dimmed` is "something else is focused" - the rest drop away so the
    // chosen one is unmistakably the subject.
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

  return (
    <group position={[x, 0, 0]}>
      <mesh
        ref={body}
        position={[0, height / 2, 0]}
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
          e.stopPropagation();
          onFocus(role.id);
        }}
      >
        <boxGeometry args={[1.25, height, 1.25]} />
        <meshStandardMaterial
          color="#09090b"
          emissive={role.accent}
          emissiveMap={map}
          emissiveIntensity={IDLE * 0.5}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* A bright band at the top. One cheap detail is the difference between
          reading as a building and reading as a bar on a chart. */}
      <mesh ref={crown} position={[0, height - 0.3, 0]}>
        <boxGeometry args={[1.36, 0.3, 1.36]} />
        <meshStandardMaterial
          color="#000000"
          emissive={role.accent}
          emissiveIntensity={IDLE * 5}
          toneMapped={false}
        />
      </mesh>

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
 * Labels, projected by hand into a plain DOM layer that lives outside the
 * canvas.
 *
 * drei's <Html> was the obvious choice and it dropped one of the six on
 * mount - six portals, five contents. This is deterministic instead: one
 * span per tower, created once, and every frame its screen position is
 * written straight to `style.transform`. Nothing here goes through React
 * state, so a 60fps camera does not cause 60 renders a second.
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
      v.current.set(t.x, t.height + 0.8, 0).project(state.camera);
      const x = (v.current.x * 0.5 + 0.5) * width;
      const y = (-v.current.y * 0.5 + 0.5) * height;
      // Behind the camera, or off the sides - hide rather than wrap round.
      const off = v.current.z > 1 || x < -80 || x > width + 80;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
      el.style.opacity = hidden || off ? "0" : "1";
    });
  });

  return null;
}

// Module-level so the look-at target survives between frames without
// allocating a vector every tick.
const LOOK = { x: 0, y: 3, z: 0 };

function Rig({ target, narrow }) {
  useFrame((state, delta) => {
    const k = 1 - Math.exp(-2.6 * delta);
    const p = state.pointer;

    let px, py, pz, lx, ly, lz;
    if (target) {
      // Sits close and to the *right* of its tower and looks past it, which
      // is what pushes the tower into the left of the frame and leaves the
      // right half clear for the text.
      const h = target.height;
      if (narrow) {
        // No room for a column beside it on a phone, so the detail becomes a
        // bottom sheet and the building is pushed into the top of the frame
        // instead - achieved by looking at its base rather than its middle.
        // The sheet takes the bottom ~62%, so the building has to fit the
        // top third. Far enough back for the whole thing to be in frame,
        // looking *below* ground so it sits high rather than centred.
        px = target.x;
        py = h * 0.5 + 1.2;
        pz = 27;
        lx = target.x;
        ly = -0.4;
        lz = 0;
      } else {
        px = target.x + 4.3;
        py = h * 0.58;
        pz = 13.5;
        lx = target.x + 3.4;
        ly = h * 0.5;
        lz = 0;
      }
    } else {
      // The overview drifts with the pointer; the focused shot does not,
      // because a moving camera makes text beside it hard to read.
      // Idle drift on top of the pointer parallax. Two slow sines on
      // different periods so the loop never obviously repeats - without it
      // the scene is frozen for anyone on a touch device or sitting still.
      const t = state.clock.elapsedTime;
      px = p.x * 1.2 + Math.sin(t * 0.11) * 1.1;
      py = 6 + p.y * 0.5 + Math.sin(t * 0.077) * 0.5;
      pz = narrow ? 46 : 30;
      lx = Math.sin(t * 0.063) * 0.5;
      ly = 3;
      lz = 0;
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

  return (
    <Canvas
      // Stopped the moment the section leaves the viewport; an idle canvas
      // still burns a render loop otherwise.
      frameloop={active ? "always" : "never"}
      // Capped rather than devicePixelRatio: a 3x screen would otherwise
      // render nine times the pixels for no visible gain.
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 6, 30], fov: 32 }}
      // Clicking past the towers returns to the overview.
      onPointerMissed={() => onFocus(null)}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 26, 62]} />
      <ambientLight intensity={0.16} />
      <directionalLight position={[5, 10, 7]} intensity={0.5} />

      <Rig target={target} narrow={narrow} />
      <Labels host={labelHost} layout={layout} hidden={Boolean(focused)} />

      {/* Mirrored, non-interactive copies. scale-y of -1 flips them under
          the ground; `raycast={null}` keeps them from stealing clicks. */}
      <group scale={[1, -0.45, 1]}>
        {layout.map((tower) => (
          <Tower
            key={`r-${tower.role.id}`}
            tower={tower}
            windows={windows}
            focused={tower.role.id === focused}
            dimmed={Boolean(focused) && tower.role.id !== focused}
            onFocus={() => {}}
            mirrored
          />
        ))}
      </group>

      {layout.map((tower) => (
        <Tower
          key={tower.role.id}
          tower={tower}
          windows={windows}
          focused={tower.role.id === focused}
          dimmed={Boolean(focused) && tower.role.id !== focused}
          onFocus={onFocus}
        />
      ))}

      <gridHelper args={[90, 90, "#2a2a2a", "#161616"]} />

      {/* The floor. A sheet of near-black over the mirrored towers rather
          than a true reflective material: MeshReflectorMaterial renders the
          whole scene a second time into a texture, and at six boxes the
          mirrored geometry is far cheaper for the same read. Fog does the
          fading, so the reflection dies out with distance on its own. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[90, 90]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>

      {/* Bloom is what separates "lit box" from "neon". The threshold keeps
          it off everything except the crowns, which are the only things
          pushed past 1.0 - that is why they are toneMapped={false}. */}
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
