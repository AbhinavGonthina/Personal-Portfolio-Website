import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  BOARD,
  BOARD_PHOTO,
  DESK,
  DESK_SCREEN,
  HOUSE,
  MAIL_BODY,
  MAIL_GAP,
  RACKS,
  TOWN,
  WALL_PANEL,
  billboard,
  doorLeaf,
  dressing,
  house,
  interior,
  mailbox,
  mailflag,
  maillid,
  mailrail,
} from "../lib/townGeometry";
import { profile, socials } from "../data/profile";

/**
 * The buildings of the town that are not towers.
 *
 * Every one is a pair of merged buffers built in townGeometry, so a
 * house with forty boxes draws twice. What they add here is materials,
 * the handful of parts that move, and the visibility gates - a group
 * that is `visible={false}` is not submitted at all, which is the
 * difference between a town you can scroll through and one you cannot.
 *
 * None of them puts anything in the DOM. Everything these sections
 * have to say is painted on a surface in the world.
 */

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

const Shell = ({ geo, mat }) =>
  geo ? <mesh geometry={geo} material={mat} /> : null;

/* ---------------------------------------------------------------- */

/**
 * The hoarding: posts, a lit frame, the portrait on the left of the
 * board and everything the About section says painted on the right.
 */
export function Billboard({ mats, visible, board }) {
  const built = useBuilt(billboard);
  const photo = useLoader(THREE.TextureLoader, profile.photo);
  const gap = BOARD.pad;
  const textW = BOARD.w - BOARD_PHOTO - gap * 3;

  return (
    <group
      visible={visible}
      position={posOf(TOWN.billboard)}
      rotation={yawOf(TOWN.billboard)}
    >
      <Shell geo={built.base} mat={mats.shell} />
      <Shell geo={built.lit} mat={mats.cool} />
      <mesh position={[-BOARD.w / 2 + gap + BOARD_PHOTO / 2, built.mid, 0.06]}>
        <planeGeometry args={[BOARD_PHOTO, BOARD_PHOTO]} />
        <meshBasicMaterial map={photo} toneMapped={false} />
      </mesh>
      <mesh position={[BOARD.w / 2 - gap - textW / 2, built.mid, 0.06]}>
        <planeGeometry args={[textW, BOARD.h - gap * 2]} />
        <meshBasicMaterial map={board} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------------------------------------------------------- */

/**
 * The house. The door swings open as the camera comes up the path, on
 * the same value that drives the camera, so arriving and the door
 * opening are the same motion rather than two that have to agree.
 */
export function House({ mats, visible, open }) {
  const built = useBuilt(house);
  const leaf = useBuilt(doorLeaf);
  const hinge = useRef();

  useFrame((_, delta) => {
    if (!hinge.current) return;
    const k = 1 - Math.exp(-4 * delta);
    const want = open ? -2.0 : 0;
    hinge.current.rotation.y += (want - hinge.current.rotation.y) * k;
  });

  return (
    <group
      visible={visible}
      position={posOf(TOWN.house)}
      rotation={yawOf(TOWN.house)}
    >
      <Shell geo={built.base} mat={mats.shell} />
      <Shell geo={built.lit} mat={mats.warm} />
      <group ref={hinge} position={[-HOUSE.door / 2, 0, HOUSE.d / 2 + 0.06]}>
        <Shell geo={leaf} mat={mats.door} />
      </group>
    </group>
  );
}

/**
 * The room inside: servers down the left wall with a board of skills
 * over them, a desk and monitor on the right, a bed and a plant so it
 * reads as somewhere someone lives.
 */
export function Interior({ mats, visible, screen, skills }) {
  const built = useBuilt(interior);
  return (
    <group
      visible={visible}
      position={posOf(TOWN.house)}
      rotation={yawOf(TOWN.house)}
    >
      <Shell geo={built.base} mat={mats.shell} />
      <Shell geo={built.lit} mat={mats.warm} />

      {/* The skills board, on the back wall. */}
      <mesh position={[WALL_PANEL.x, WALL_PANEL.y, -HOUSE.d / 2 + 0.2]}>
        <planeGeometry args={[WALL_PANEL.w, WALL_PANEL.h]} />
        <meshBasicMaterial map={skills} toneMapped={false} />
      </mesh>

      <mesh
        position={[DESK.x - 0.055, DESK.y, DESK.z]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[DESK_SCREEN.w, DESK_SCREEN.h]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Dressing({ mats, visible }) {
  const built = useBuilt(dressing);
  return (
    <group visible={visible}>
      <Shell geo={built.base} mat={mats.shell} />
      <Shell geo={built.lit} mat={mats.warm} />
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
function Mailbox({ x, link, mats, label, live }) {
  const body = useBuilt(mailbox);
  const lid = useBuilt(maillid);
  const flag = useBuilt(mailflag);
  const lidRef = useRef();
  const flagRef = useRef();
  const [over, setOver] = useState(false);
  const on = over && live;

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-9 * delta);
    if (lidRef.current) {
      const want = on ? LID_OPEN : 0;
      lidRef.current.rotation.x += (want - lidRef.current.rotation.x) * k;
    }
    if (flagRef.current) {
      const want = on ? 0 : -1.3;
      flagRef.current.rotation.x += (want - flagRef.current.rotation.x) * k;
    }
  });

  useEffect(() => {
    if (!live && over) setOver(false);
  }, [live, over]);

  return (
    <group position={[x, 1.12, 0]}>
      <mesh
        geometry={body}
        material={mats.post}
        onPointerOver={(e) => {
          if (!live) return;
          e.stopPropagation();
          setOver(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setOver(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          if (!live) return;
          e.stopPropagation();
          window.open(link, "_blank", "noopener,noreferrer");
        }}
      />
      <group ref={lidRef} position={[0, MAIL_BODY.h * 0.55, -MAIL_BODY.d / 2]}>
        <mesh
          geometry={lid}
          material={mats.post}
          position={[0, -MAIL_BODY.h * 0.55, MAIL_BODY.d / 2]}
        />
      </group>
      <group
        ref={flagRef}
        position={[MAIL_BODY.w / 2 + 0.04, MAIL_BODY.h * 0.3, -0.1]}
      >
        <mesh geometry={flag} material={on ? mats.warm : mats.cool} />
      </group>
      <mesh position={[0, MAIL_BODY.h * 0.32, MAIL_BODY.d / 2 + 0.01]}>
        <planeGeometry args={[MAIL_BODY.w * 0.84, MAIL_BODY.w * 0.84]} />
        <meshBasicMaterial map={label} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Mailboxes({ mats, visible, labels, live }) {
  const rail = useBuilt(() => mailrail(socials.length));
  const span = (socials.length - 1) * MAIL_GAP;

  return (
    <group
      visible={visible}
      position={posOf(TOWN.mail)}
      rotation={yawOf(TOWN.mail)}
    >
      <Shell geo={rail.base} mat={mats.post} />
      {visible &&
        socials.map((s, i) => (
          <Mailbox
            key={s.name}
            x={-span / 2 + i * MAIL_GAP}
            link={s.href}
            label={labels[i]}
            mats={mats}
            live={live}
          />
        ))}
    </group>
  );
}
