import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  BOARD,
  BOARD_PHOTO,
  BOARD_TEXT,
  DESK,
  DESK_SCREEN,
  HOUSE,
  MAIL_BODY,
  MAIL_TOP,
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
  maildoor,
  mailshell,
  mailrail,
} from "../lib/townGeometry";
import { profile, socials } from "../data/profile";
import { ACCENT } from "../lib/townMaterials";
import { makeTextTexture } from "../lib/canvasText";
import { SCREEN_VIEW, SKILL_PANE } from "../lib/paint";
import { ExtrudedText } from "./street";

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

const clamp01 = (v) => Math.min(1, Math.max(0, v));

const yawOf = (b) => [0, b.yaw, 0];
const posOf = (b) => [b.x, 0, b.z];

const Shell = ({ geo, mat }) =>
  geo ? <mesh geometry={geo} material={mat} /> : null;

/**
 * A hairline along a thing's edges, which is what the towers in the
 * city already wear.
 *
 * Without it the house and the boxes are shaded volumes on a black
 * page and read as a 3D render; the city reads as drawn because
 * every edge in it is a lit line. One `EdgesGeometry` over the whole
 * merged buffer, so the whole building costs one more draw call
 * rather than one per box in it.
 *
 * Eighteen degrees, the same threshold the towers use: enough that
 * a box keeps all twelve of its edges and a drum draws its two
 * rings instead of twenty-eight verticals.
 */
const EDGE = 0.34;

function Outline({ geo, color = ACCENT.blue, opacity = EDGE, angle = 18 }) {
  const edges = useMemo(
    () => (geo ? new THREE.EdgesGeometry(geo, angle) : null),
    [geo, angle],
  );
  useEffect(() => () => edges?.dispose(), [edges]);
  if (!edges) return null;
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        // Hidden behind whatever is in front of it, but writing no
        // depth of its own - a hairline punching a hole in the wall
        // behind it looks worse than the overlap does.
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

/* ---------------------------------------------------------------- */

/**
 * The hoarding: posts, a lit frame, the portrait on the left of the
 * board and everything the About section says painted on the right.
 */
export function Billboard({ mats, visible, board, face }) {
  const built = useBuilt(billboard);
  const photo = useLoader(THREE.TextureLoader, profile.photo);
  const gap = BOARD.pad;
  const textW = BOARD_TEXT;

  return (
    <group
      visible={visible}
      position={posOf(TOWN.billboard)}
      rotation={yawOf(TOWN.billboard)}
    >
      <Shell geo={built.base} mat={mats.shell} />
      <Shell geo={built.lit} mat={mats.cool} />
      {/* The face, edge to edge, before anything is put on it. The
          painted half is black and the structure behind it is the
          grey everything in this town is built from, so without this
          the type sat in a darker rectangle than the board around it
          and read as a card propped against a hoarding rather than
          as the hoarding. Black to the frame, and the only thing on
          it that is not black is the one thing that should be. */}
      <mesh position={[0, built.mid, 0.05]}>
        <planeGeometry args={[BOARD.w, BOARD.h]} />
        <meshBasicMaterial map={face} color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[-BOARD.w / 2 + gap + BOARD_PHOTO / 2, built.mid, 0.06]}>
        <planeGeometry args={[BOARD_PHOTO, BOARD_PHOTO]} />
        <meshBasicMaterial map={photo} toneMapped={false} />
      </mesh>
      {/* Ink only. The grid, the scanlines and the lamplight are on
          the face behind this, so the panel has to let them through
          rather than paint its own rectangle of them. */}
      <mesh position={[BOARD.w / 2 - gap - textW / 2, built.mid, 0.06]}>
        <planeGeometry args={[textW, BOARD.h - gap * 2]} />
        <meshBasicMaterial map={board} transparent toneMapped={false} />
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
      <Shell geo={built.base} mat={mats.painted} />
      <Outline geo={built.base} />
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
/**
 * The monitor on the desk: a profile page of pinned repositories,
 * and one of them opened.
 *
 * The grid is taller than the screen, so the plane shows a window
 * onto it and scrolling moves the window rather than repainting
 * anything. `reel` is where the page has got to through the
 * Projects section, 0 at the top of the list and 1 at the bottom.
 *
 * Clicks arrive as a UV, which has to be put back into canvas
 * pixels - including the scroll - before the hit boxes mean
 * anything. UV counts up from the bottom and the canvas counts
 * down from the top, which is the one place this is easy to get
 * backwards.
 */
function Monitor({ screen, reel, onOpen, live }) {
  const { tex, hits } = screen ?? {};
  const tall = screen?.height ?? SCREEN_VIEW.h;
  const span = Math.max(0.0001, SCREEN_VIEW.h / tall);

  useEffect(() => {
    if (!tex) return;
    tex.repeat.set(1, Math.min(1, span));
    tex.offset.set(0, Math.max(0, 1 - span) * (1 - clamp01(reel ?? 0)));
    tex.needsUpdate = true;
  }, [tex, span, reel]);

  const pick = (e) => {
    if (!live || !e.uv || !hits) return;
    e.stopPropagation();
    const v = Math.max(0, 1 - span) * (1 - clamp01(reel ?? 0)) + e.uv.y * span;
    const cx = e.uv.x * SCREEN_VIEW.w;
    const cy = (1 - v) * tall;
    const hit = hits.find(
      (h) => cx >= h.x0 && cx <= h.x1 && cy >= h.y0 && cy <= h.y1,
    );
    if (!hit) return;
    if (hit.id === "__back") onOpen(null);
    else if (hit.id === "__live" || hit.id === "__github") {
      window.open(hit.href, "_blank", "noopener,noreferrer");
    } else onOpen(hit.id);
  };

  return (
    <mesh
      position={[DESK.x - 0.055, DESK.y, DESK.z]}
      rotation={[0, -Math.PI / 2, 0]}
      onClick={pick}
      onPointerOver={() => {
        if (live) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <planeGeometry args={[DESK_SCREEN.w, DESK_SCREEN.h]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

export function Interior({
  mats,
  visible,
  screen,
  skills,
  preview,
  onHover,
  reel,
  onOpen,
  live,
}) {
  const built = useBuilt(interior);
  const leds = useRef();

  // The indicators breathe rather than blink. A hard flicker on a
  // merged buffer would switch every light in the room at once, which
  // reads as a fault rather than as a machine working.
  useFrame((state) => {
    if (!leds.current) return;
    const t = state.clock.elapsedTime;
    leds.current.opacity =
      0.62 + Math.sin(t * 2.4) * 0.18 + Math.sin(t * 7.3) * 0.08;
  });

  return (
    <group
      visible={visible}
      position={posOf(TOWN.house)}
      rotation={yawOf(TOWN.house)}
    >
      <Shell geo={built.base} mat={mats.room} />
      <Shell geo={built.floor} mat={mats.boards} />
      <Shell geo={built.lit} mat={mats.warm} />
      {built.led && (
        <mesh geometry={built.led}>
          <meshBasicMaterial
            ref={leds}
            color={ACCENT.cyan}
            transparent
            opacity={0.7}
            toneMapped={false}
          />
        </mesh>
      )}

      {/* The two lights in the room. The lamp is what makes the desk
          a place to work; the rim behind the racks lifts the skills
          board off the wall it is hanging on. */}
      <pointLight
        position={[DESK.x - 0.24, 1.18, DESK.z - 1]}
        color={ACCENT.amber}
        intensity={visible ? 5 : 0}
        distance={4.5}
        decay={2}
      />
      <pointLight
        position={[RACKS.x + 0.5, 1.5, -0.4]}
        color={ACCENT.cyan}
        intensity={visible ? 3.4 : 0}
        distance={5}
        decay={2}
      />

      {/* The skills board, on the back wall.
          
          Pointer events read a UV off the plane and the painter says
          which tag is where, so the whole grid is one mesh and one
          draw call rather than forty little ones. */}
      <mesh
        position={[WALL_PANEL.x, WALL_PANEL.y, -HOUSE.d / 2 + 0.2]}
        onPointerMove={(e) => {
          if (!live || !e.uv) return;
          e.stopPropagation();
          // UV runs from the bottom, the hit boxes from the top.
          const u = e.uv.x;
          const v = 1 - e.uv.y;
          const found = skills?.hits?.find(
            (h) => u >= h.x0 && u <= h.x1 && v >= h.y0 && v <= h.y1,
          );
          onHover(found ?? null);
        }}
        onPointerOut={() => live && onHover(null)}
      >
        <planeGeometry args={[WALL_PANEL.w, WALL_PANEL.h]} />
        <meshBasicMaterial map={skills?.tex} toneMapped={false} />
      </mesh>

      {/* The screen inside it. Its own plane because it repaints on
          every change of pointer and the board behind it does not -
          one is a 540 by 1000 upload, the other is 1600 by 805. */}
      <mesh
        position={[
          WALL_PANEL.x +
            WALL_PANEL.w * ((SKILL_PANE.x0 + SKILL_PANE.x1) / 2 - 0.5),
          WALL_PANEL.y -
            WALL_PANEL.h * ((SKILL_PANE.y0 + SKILL_PANE.y1) / 2 - 0.5),
          -HOUSE.d / 2 + 0.205,
        ]}
      >
        <planeGeometry
          args={[
            WALL_PANEL.w * (SKILL_PANE.x1 - SKILL_PANE.x0),
            WALL_PANEL.h * (SKILL_PANE.y1 - SKILL_PANE.y0),
          ]}
        />
        <meshBasicMaterial map={preview} toneMapped={false} />
      </mesh>

      <Monitor screen={screen} reel={reel} onOpen={onOpen} live={live} />
    </group>
  );
}

export function Dressing({ mats, visible, wide }) {
  const built = useBuilt(dressing);
  return (
    <group visible={visible}>
      <Shell geo={built.road} mat={mats.road} />
      <Shell geo={built.paint} mat={mats.paint} />
      <Shell geo={built.base} mat={mats.shell} />
      {built.woods?.map((geo, i) => (
        <Shell key={i} geo={geo} mat={mats.painted} />
      ))}
      {/* The outskirts, only while the camera is up where it can
          see them. On the ground they are behind the wood or
          behind the city either way. */}
      {wide &&
        built.far?.map((geo, i) => (
          <Shell key={"far" + i} geo={geo} mat={mats.painted} />
        ))}
      <Shell geo={built.lit} mat={mats.warm} />
    </group>
  );
}

/* ---------------------------------------------------------------- */

// Down, and far enough to be out of the way. Positive, because the
// hinge is at the foot of the door: this drops the top of it
// forwards until the panel is nearly level and the opening behind
// it is open to look into.
const LID_OPEN = 1.1;
// The mark is square and the top of the box is a semicircle, so the
// limit is not the width of the box - it is how far up the arc the
// square's top corners can go before they are outside it. Solved
// rather than guessed: at 0.72 of the width the corners stood proud
// of the arc and the logo looked cropped by a box it was drawn on.
const MARK_W = MAIL_BODY.w * 0.64;
const MARK_H = MARK_W * (342 / 256);
const MARK_TOP =
  MAIL_BODY.h * 0.55 + Math.sqrt((MAIL_BODY.w / 2) ** 2 - (MARK_W / 2) ** 2);
// Centre, from that top. The name ends up a little clear of the
// handle on the door below it, which is where it should sit.
// Centred on the face. The arc is still the limit - if the mark
// ever grows enough that centring would push its corners outside
// the curve, it sits as high as the curve allows instead.
// Low on the face rather than halfway up it. Dead centre is where
// the block of mark and name balances, but the mark is a big square
// and the name is one small line under it, so the weight is all at
// the top and centring the box reads as hanging high.
const MARK_Y = Math.min(MAIL_TOP * 0.44, MARK_TOP - MARK_H / 2);

/**
 * One mailbox. The lid swings open and the flag goes up when you point
 * at it; clicking opens the link.
 *
 * The lid is hinged at the back of the body, so the pivot is the group
 * and the geometry is built forward of it - rotating a lid modelled
 * around its own centre makes it sink through the box.
 */
function Mailbox({ x, link, mats, label, live, visible = true }) {
  const body = useBuilt(mailbox);
  const door = useBuilt(maildoor);
  const shell = useBuilt(mailshell);
  const flag = useBuilt(mailflag);
  const lidRef = useRef();
  const flagRef = useRef();
  const markRef = useRef();
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
    // The box does not move. It used to lift a little so that the one
    // you were pointing at was obvious from the corner of the eye,
    // and a mailbox that rises off its own post to greet you is not
    // what that reads as. The door opening says it well enough, and
    // the mark brightening says the rest.
    if (markRef.current) {
      const want = on ? 1 : 0.72;
      markRef.current.opacity += (want - markRef.current.opacity) * k;
    }
  });

  useEffect(() => {
    if (!live && over) setOver(false);
  }, [live, over]);

  return (
    <group position={[x, 1.12, 0]} visible={visible}>
      <mesh
        geometry={body}
        material={mats.painted}
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
      {/* Traced off the silhouette, not off the real box - see
          `mailshell`. 30 degrees, so the fourteen sided arch draws
          its two rings and not its fourteen verticals. */}
      <Outline geo={shell} angle={30} />
      {/* The door, and the mark riding on it. The mark is a child
            of the hinge rather than a sibling of it, so there is no
            second animation to keep in step with the first. */}
      <group ref={lidRef} position={[0, 0, MAIL_BODY.d / 2]}>
        <mesh geometry={door} material={mats.painted} />
        <Outline geo={door} angle={30} />
        {/* Clear of the panel, not in it. The door is built from
              its hinge and so is 0.05 thick forward of this group;
              at 0.045 the mark sat five millimetres inside its own
              door and the door drew over it. */}
        <mesh position={[0, MARK_Y, 0.058]}>
          <planeGeometry args={[MARK_W, MARK_H]} />
          <meshBasicMaterial
            ref={markRef}
            map={label}
            transparent
            opacity={0.72}
            toneMapped={false}
          />
        </mesh>
      </group>
      <group
        ref={flagRef}
        position={[MAIL_BODY.w / 2 + 0.04, MAIL_BODY.h * 0.3, -0.1]}
      >
        <mesh geometry={flag} material={on ? mats.warm : mats.cool} />
      </group>
    </group>
  );
}

export function Mailboxes({ mats, visible, labels, live, greet }) {
  const rail = useBuilt(() => mailrail(socials.length));
  const span = (socials.length - 1) * MAIL_GAP;
  // The last thing in the town, standing in front of the wall the
  // boxes are on. Extruded rather than painted, like the word that
  // falls at the other end of the walk - the two ends of the site
  // say their piece the same way.
  const thanks = useMemo(() => makeTextTexture("THANK YOU"), []);
  useEffect(() => () => thanks.tex.dispose(), [thanks]);

  return (
    <group
      visible={visible}
      position={posOf(TOWN.mail)}
      rotation={yawOf(TOWN.mail)}
    >
      <Shell geo={rail.base} mat={mats.painted} />
      <Outline geo={rail.base} />
      {/* Clear of the ground rather than half sunk in it: the letters
          are centred on their own origin, so putting the group at
          zero buries the bottom half of every one of them. */}
      {/* Hidden, not absent. Mounting this when the gate opens means
          building the letters and compiling them at the moment they
          are first meant to be read, so you watch them arrive - and
          on a link straight to Contact the gate opens in the same
          frame the camera does. Built with the rest of the town and
          switched on when it is time to say it. */}
      <group visible={greet} position={[0, 0.62, 0.66]}>
        <ExtrudedText
          tex={thanks.tex}
          aspect={thanks.aspect}
          height={0.46}
          depth={0.12}
          layers={8}
        />
      </group>
      {socials.map((s, i) => (
        <Mailbox
          key={s.name}
          x={-span / 2 + i * MAIL_GAP}
          link={s.href}
          label={labels[i]}
          mats={mats}
          live={live}
          visible={visible}
        />
      ))}
    </group>
  );
}
