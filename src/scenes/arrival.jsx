import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  CAR,
  HINGE,
  SCREEN,
  SCREEN_AT,
  car,
  carDoor,
  headrestScreen,
} from "../lib/carGeometry";
import { HEADREST_BAR, paintHeadrest } from "../lib/paint";
import { ACCENT } from "../lib/townMaterials";
import { ARRIVED_AT, CAR_PARK, DOOR_AT } from "../lib/arrivalPath";

/**
 * Arriving by car.
 *
 * You start in the back-right seat looking at the headrest in front
 * of you, it tells you it is loading, then it tells you that you have
 * arrived, the right-hand door opens and you step out onto the street
 * the rest of the site is standing on. It runs once per session.
 *
 * The camera is never animated here. The sequence is a list of
 * keyframes in car-local space that the rig reads, so the rig stays
 * the one thing that writes to the camera and the handover at the end
 * is an interpolation rather than a fight over who owns it. All this
 * component owns is the door and the progress bar.
 *
 * Every material is double-sided. The camera spends the first four
 * seconds inside a closed box, and a single-sided shell seen from the
 * inside is a shell you are not in.
 */

const DOOR_OPEN = 1.15;

/**
 * How full the bar is, second by second.
 *
 * A table rather than a curve because loading bars do not move
 * smoothly - they stall, jump, stall again - and the whole job of
 * this one is to make three seconds of nothing look like three
 * seconds of something. Interpolating between fixed points keeps it
 * lurching without ever letting it run backwards.
 */
const STEPS = [
  [0, 0.04],
  [0.4, 0.17],
  [0.85, 0.23],
  [1.45, 0.51],
  [1.9, 0.56],
  [2.35, 0.77],
  [2.8, 0.87],
  [3.1, 0.93],
  [ARRIVED_AT, 1],
];

function filled(t) {
  if (t >= ARRIVED_AT) return 1;
  let i = 0;
  while (i < STEPS.length - 2 && t > STEPS[i + 1][0]) i++;
  const [ta, pa] = STEPS[i];
  const [tb, pb] = STEPS[i + 1];
  const f = Math.min(1, Math.max(0, (t - ta) / (tb - ta)));
  return pa + (pb - pa) * (f * f * (3 - 2 * f));
}

export default function Car({ clock }) {
  const built = useMemo(car, []);
  const door = useMemo(carDoor, []);
  const bezel = useMemo(headrestScreen, []);
  const hinge = useRef();
  const bar = useRef();
  const [arrived, setArrived] = useState(false);

  // Two textures, swapped once. The bar that moves between them is
  // geometry, so neither of these is ever redrawn.
  //
  // Nothing here is disposed. The car is built once per session and
  // thrown away when the sequence ends, and a cleanup that runs on
  // unmount also runs on StrictMode's rehearsal of one - which would
  // dispose the buffers out from under the mount that keeps.
  const screens = useMemo(
    () => [
      paintHeadrest("Loading", "En route"),
      paintHeadrest("You have arrived", "Destination"),
    ],
    [],
  );

  useFrame((_, delta) => {
    const t = clock.current.t;
    if (!arrived && t > ARRIVED_AT) setArrived(true);
    if (bar.current) bar.current.scale.x = Math.max(0.001, filled(t));
    if (hinge.current) {
      const k = 1 - Math.exp(-3.4 * delta);
      const want = t > DOOR_AT ? DOOR_OPEN : 0;
      hinge.current.rotation.y += (want - hinge.current.rotation.y) * k;
    }
  });

  const paint = (
    <meshStandardMaterial
      color="#2a2d3c"
      roughness={0.5}
      metalness={0.45}
      side={THREE.DoubleSide}
    />
  );
  const cloth = (
    <meshStandardMaterial
      color="#15161d"
      roughness={0.98}
      metalness={0}
      side={THREE.DoubleSide}
    />
  );

  // The bar track, in the plane's own coordinates. Anchored at its
  // left end so scaling the group runs it rightward.
  const bw = SCREEN.w * HEADREST_BAR.w;
  const bh = SCREEN.h * HEADREST_BAR.h;
  const bx = -SCREEN.w / 2 + HEADREST_BAR.x * SCREEN.w;
  const by = SCREEN.h / 2 - (HEADREST_BAR.y + HEADREST_BAR.h / 2) * SCREEN.h;

  return (
    <group
      position={[CAR_PARK.x, 0, CAR_PARK.z]}
      rotation={[0, CAR_PARK.yaw, 0]}
    >
      <mesh geometry={built.base}>{paint}</mesh>
      <mesh geometry={built.trim}>{cloth}</mesh>
      <mesh geometry={built.lit}>
        <meshBasicMaterial color={ACCENT.amber} toneMapped={false} />
      </mesh>
      <mesh geometry={built.glass}>
        <meshStandardMaterial
          color="#0a0d16"
          roughness={0.12}
          metalness={0.6}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* The windscreen and the two front windows, which are nearly
          opaque. Through clear glass the only thing ahead of a car
          that is supposed to be arriving somewhere is a town standing
          perfectly still. */}
      <mesh geometry={built.tint}>
        <meshStandardMaterial
          color="#05070c"
          roughness={0.18}
          metalness={0.55}
          transparent
          opacity={0.96}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={hinge} position={HINGE}>
        <mesh geometry={door.base}>{paint}</mesh>
        <mesh geometry={door.trim}>{cloth}</mesh>
        <mesh geometry={door.glass}>
          <meshStandardMaterial
            color="#0a0d16"
            roughness={0.12}
            metalness={0.6}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* The screen, on the back of the headrest in front of you. It
          faces +Z, which is where you are sitting. */}
      <group position={SCREEN_AT}>
        <mesh geometry={bezel}>
          <meshStandardMaterial
            color="#0b0d16"
            roughness={0.6}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial
            map={screens[arrived ? 1 : 0]}
            toneMapped={false}
          />
        </mesh>
        <group ref={bar} position={[bx, by, 0.024]}>
          <mesh position={[bw / 2, 0, 0]}>
            <planeGeometry args={[bw, bh]} />
            <meshBasicMaterial color={ACCENT.cyan} toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* A reading light, so the inside of the car is not a black box.
          Two of them: one over the back seat and one over the front,
          because a single lamp at the camera's own position lights
          nothing it can see. */}
      <pointLight
        position={[0, CAR.roof - 0.08, 1.15]}
        color={ACCENT.amber}
        intensity={1.4}
        distance={3.2}
        decay={2}
      />
      <pointLight
        position={[0, CAR.roof - 0.12, -1.0]}
        color={ACCENT.amber}
        intensity={0.7}
        distance={3}
        decay={2}
      />
    </group>
  );
}
