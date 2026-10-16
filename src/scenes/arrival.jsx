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
import { paintHeadrest } from "../lib/paint";
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
 * component owns is the door.
 *
 * Every material is double-sided. The camera spends the first four
 * seconds inside a closed box, and a single-sided shell seen from the
 * inside is a shell you are not in.
 */

const DOOR_OPEN = 1.15;

export default function Car({ clock }) {
  const built = useMemo(car, []);
  const door = useMemo(carDoor, []);
  const bezel = useMemo(headrestScreen, []);
  const hinge = useRef();
  const [arrived, setArrived] = useState(false);

  // Two textures, swapped once. Repainting the bar every frame would
  // mean a canvas upload every frame for a four-second progress bar.
  //
  // Nothing here is disposed. The car is built once per session and
  // thrown away when the sequence ends, and a cleanup that runs on
  // unmount also runs on StrictMode's rehearsal of one - which would
  // dispose the buffers out from under the mount that keeps.
  const screens = useMemo(
    () => [
      paintHeadrest("Loading", "En route", 0.35),
      paintHeadrest("You have arrived", "Destination", 1),
    ],
    [],
  );

  useFrame((_, delta) => {
    const t = clock.current.t;
    if (!arrived && t > ARRIVED_AT) setArrived(true);
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
