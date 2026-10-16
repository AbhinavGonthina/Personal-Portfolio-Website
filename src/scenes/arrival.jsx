import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CAR,
  DOORWAY,
  HEADREST,
  SCREEN,
  SEAT,
  car,
  carDoor,
  headrestScreen,
} from "../lib/carGeometry";
import { paintHeadrest } from "../lib/paint";
import { ACCENT } from "../lib/townMaterials";
import { CAR_PARK } from "../lib/arrivalPath";

/**
 * Arriving by car.
 *
 * You start in the back-right seat looking at the headrest in front
 * of you, it tells you it is loading, then it tells you that you have
 * arrived, the door opens and you step out onto the street the rest
 * of the site is standing on. It runs once per session.
 *
 * The whole thing is a short list of camera keyframes in car-local
 * space, smoothstepped between and handed to the rig as a finished
 * shot. Doing it that way rather than animating the camera object
 * means the rig stays the one thing that writes to the camera, and
 * the handover at the end is a crossfade between two positions rather
 * than a fight over who owns it.
 */

/* ---------------------------------------------------------------- */

const DOOR_OPEN = -1.25;

export default function Car({ clock }) {
  const built = useMemo(car, []);
  const door = useMemo(carDoor, []);
  const panel = useMemo(headrestScreen, []);
  const hinge = useRef();
  const [arrived, setArrived] = useState(false);

  // Two textures, swapped once. Repainting the bar every frame would
  // mean a canvas upload every frame for a four-second progress bar.
  const screens = useMemo(
    () => [
      paintHeadrest("Loading", "En route", 0.35),
      paintHeadrest("You have arrived", "Destination", 1),
    ],
    [],
  );
  useEffect(() => {
    const all = [built, door.geo && { geo: door.geo }, { geo: panel }];
    return () => {
      screens.forEach((s) => s.dispose());
      for (const g of Object.values(built)) g?.dispose?.();
      door.geo?.dispose?.();
      panel?.dispose?.();
      void all;
    };
  }, [built, door, panel, screens]);

  useFrame((_, delta) => {
    const t = clock.current.t;
    if (!arrived && t > 3.3) setArrived(true);
    if (hinge.current) {
      const k = 1 - Math.exp(-4 * delta);
      const want = t > 3.9 ? DOOR_OPEN : 0;
      hinge.current.rotation.y += (want - hinge.current.rotation.y) * k;
    }
  });

  return (
    <group
      position={[CAR_PARK.x, 0, CAR_PARK.z]}
      rotation={[0, CAR_PARK.yaw, 0]}
    >
      <mesh geometry={built.base}>
        <meshStandardMaterial
          color="#1b1d28"
          roughness={0.55}
          metalness={0.4}
        />
      </mesh>
      <mesh geometry={built.lit}>
        <meshBasicMaterial color={ACCENT.amber} toneMapped={false} />
      </mesh>
      <mesh geometry={built.glass}>
        <meshStandardMaterial
          color="#070910"
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.72}
        />
      </mesh>

      <group ref={hinge} position={door.hinge}>
        <mesh
          geometry={door.geo}
          position={[CAR.wide / 2 - 0.02, 0, -(CAR.len / 2 - 0.78)]}
        >
          <meshStandardMaterial
            color="#1b1d28"
            roughness={0.55}
            metalness={0.4}
          />
        </mesh>
      </group>

      {/* The screen, on the back of the headrest in front of you. */}
      <group
        position={[HEADREST[0], HEADREST[1], HEADREST[2]]}
        rotation={[0, Math.PI, 0]}
      >
        <mesh geometry={panel}>
          <meshStandardMaterial
            color="#0b0d16"
            roughness={0.6}
            metalness={0.2}
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

      {/* A reading light, so the inside of the car is not a black box. */}
      <pointLight
        position={[0, CAR.cabinY, -0.4]}
        color={ACCENT.amber}
        intensity={2.6}
        distance={3.4}
        decay={2}
      />
    </group>
  );
}
