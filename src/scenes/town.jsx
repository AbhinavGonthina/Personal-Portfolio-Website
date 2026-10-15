import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  BILLBOARD_W,
  BILLBOARD_H,
  MAIL_BODY,
  MAIL_GAP,
  SCREEN,
  TOWN,
  billboard,
  dressing,
  house,
  mailbox,
  mailflag,
  maillid,
  mailrail,
  study,
  workshop,
} from "../lib/townGeometry";
import { profile, socials } from "../data/profile";

/**
 * The buildings of the town that are not towers.
 *
 * Every one of them is a pair of merged buffers built in townGeometry,
 * so a house with forty boxes draws twice. What they add here is the
 * materials, the handful of parts that move, and the visibility gates -
 * a group that is `visible={false}` is not submitted at all, which is
 * the difference between a town you can scroll through and one you
 * cannot.
 */

/** Disposes merged buffers with the component that built them. */
function useBuilt(build) {
  const made = useMemo(build, [build]);
  useEffect(
    () => () => {
      if (!made) return;
      // Some builders return a bare geometry and some return a bag of
      // them; walking the properties of a geometry calls dispose on its
      // attributes, which is not a thing.
      if (typeof made.dispose === "function") {
        made.dispose();
        return;
      }
      for (const g of Object.values(made)) g?.dispose?.();
    },
    [made],
  );
  return made;
}

const yawOf = (b) => [0, b.yaw, 0];
const posOf = (b) => [b.x, 0, b.z];

/* ---------------------------------------------------------------- */

export function Billboard({ mats, visible }) {
  const built = useBuilt(billboard);
  const photo = useLoader(THREE.TextureLoader, profile.photo);

  return (
    <group
      visible={visible}
      position={posOf(TOWN.billboard)}
      rotation={yawOf(TOWN.billboard)}
    >
      {built.base && <mesh geometry={built.base} material={mats.shell} />}
      {built.lit && <mesh geometry={built.lit} material={mats.cool} />}
      <mesh position={[0, built.mid, 0.07]}>
        <planeGeometry args={[BILLBOARD_W, BILLBOARD_H]} />
        <meshBasicMaterial map={photo} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function House({ mats, visible }) {
  const built = useBuilt(house);
  return (
    <group
      visible={visible}
      position={posOf(TOWN.house)}
      rotation={yawOf(TOWN.house)}
    >
      {built.base && <mesh geometry={built.base} material={mats.shell} />}
      {built.lit && <mesh geometry={built.lit} material={mats.warm} />}
    </group>
  );
}

export function Workshop({ mats, visible }) {
  const built = useBuilt(workshop);
  return (
    <group
      visible={visible}
      position={posOf(TOWN.garage)}
      rotation={yawOf(TOWN.garage)}
    >
      {built.base && <mesh geometry={built.base} material={mats.shell} />}
      {built.lit && <mesh geometry={built.lit} material={mats.cool} />}
    </group>
  );
}

export function Dressing({ mats, visible }) {
  const built = useBuilt(dressing);
  return (
    <group visible={visible}>
      {built.base && <mesh geometry={built.base} material={mats.shell} />}
      {built.lit && <mesh geometry={built.lit} material={mats.warm} />}
    </group>
  );
}

/* ---------------------------------------------------------------- */

/**
 * The study, and the monitor standing in it.
 *
 * Only mounted while the camera is on its way in or already there. It
 * is inside a closed house, so at every other stop it would be geometry
 * submitted to be hidden behind a wall.
 */
export function Study({ mats, visible, screen }) {
  const built = useBuilt(study);
  return (
    <group
      visible={visible}
      position={posOf(TOWN.house)}
      rotation={yawOf(TOWN.house)}
    >
      {built.base && <mesh geometry={built.base} material={mats.shell} />}
      {built.lit && <mesh geometry={built.lit} material={mats.warm} />}
      <mesh position={[0, SCREEN.y, SCREEN.z + 0.055]}>
        <planeGeometry args={[SCREEN.w, SCREEN.h]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */

const LID_OPEN = -1.15;

/**
 * One mailbox. The lid swings open and the flag goes up when you point
 * at it; clicking opens the link.
 *
 * The lid is hinged at the back of the body, so the pivot is the group
 * and the geometry is built forward of it - rotating a lid modelled
 * around its own centre makes it sink through the box.
 */
function Mailbox({ x, link, mats, label, onHover }) {
  const body = useBuilt(mailbox);
  const lid = useBuilt(maillid);
  const flag = useBuilt(mailflag);
  const lidRef = useRef();
  const flagRef = useRef();
  const [over, setOver] = useState(false);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-9 * delta);
    if (lidRef.current) {
      const want = over ? LID_OPEN : 0;
      lidRef.current.rotation.x += (want - lidRef.current.rotation.x) * k;
    }
    if (flagRef.current) {
      const want = over ? 0 : -1.3;
      flagRef.current.rotation.x += (want - flagRef.current.rotation.x) * k;
    }
  });

  const enter = (e) => {
    e.stopPropagation();
    setOver(true);
    onHover(true);
  };
  const leave = () => {
    setOver(false);
    onHover(false);
  };

  return (
    <group position={[x, 1.16, 0]}>
      <mesh
        geometry={body}
        material={mats.post}
        onPointerOver={enter}
        onPointerOut={leave}
        onClick={(e) => {
          e.stopPropagation();
          window.open(link, "_blank", "noopener,noreferrer");
        }}
      />
      <group ref={lidRef} position={[0, MAIL_BODY.h * 0.55, -MAIL_BODY.d / 2]}>
        <mesh
          geometry={lid}
          material={mats.shell}
          position={[0, -MAIL_BODY.h * 0.55, MAIL_BODY.d / 2]}
        />
      </group>
      <group
        ref={flagRef}
        position={[MAIL_BODY.w / 2 + 0.04, MAIL_BODY.h * 0.3, -0.1]}
      >
        <mesh geometry={flag} material={over ? mats.warm : mats.cool} />
      </group>
      {/* The mark, on the side facing the path. */}
      <mesh position={[0, MAIL_BODY.h * 0.3, MAIL_BODY.d / 2 + 0.01]}>
        <planeGeometry args={[MAIL_BODY.w * 0.82, MAIL_BODY.w * 0.82]} />
        <meshBasicMaterial map={label} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Mailboxes({ mats, visible, labels }) {
  const rail = useBuilt(() => mailrail(socials.length));
  const span = (socials.length - 1) * MAIL_GAP;

  const hover = (on) => {
    document.body.style.cursor = on ? "pointer" : "";
  };

  return (
    <group
      visible={visible}
      position={posOf(TOWN.mail)}
      rotation={yawOf(TOWN.mail)}
    >
      {rail.base && <mesh geometry={rail.base} material={mats.post} />}
      {visible &&
        socials.map((s, i) => (
          <Mailbox
            key={s.name}
            x={-span / 2 + i * MAIL_GAP}
            link={s.href}
            label={labels[i]}
            mats={mats}
            onHover={hover}
          />
        ))}
    </group>
  );
}
