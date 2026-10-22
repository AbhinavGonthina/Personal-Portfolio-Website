import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { getTheme, onTheme, useTheme } from "./theme";

/**
 * One palette for the whole town, twice over.
 *
 * Night is four accents and nothing else: amber for anything with a
 * filament in it, cyan for glass and status, violet for the things
 * that are decoration, and a cool off-white for structure that
 * catches light. Every lit surface picks one, which is what makes
 * the sections read as one world rather than four rooms lit by
 * different people.
 *
 * Day is not that palette inverted. Half of these colours are on
 * `MeshBasicMaterial`, which ignores light entirely - they are the
 * line art, and a pale line drawn on a pale sky is nothing at all.
 * So the accents come down in lightness until they are lines again,
 * the structure tones go up until they are paper, and the things
 * that only exist because it is dark stop pretending: the lamps
 * stop glowing, the bloom comes off, and the dust in the air goes
 * away.
 */
const ACCENT_NIGHT = {
  amber: "#ffc07a",
  cyan: "#6fe3f5",
  blue: "#8fa8ff",
  violet: "#b48bff",
};

const ACCENT_DAY = {
  amber: "#a8661a",
  cyan: "#0e7f94",
  blue: "#3b55b8",
  violet: "#6a3fbd",
};

/**
 * Read all over the scene, and mutated in place rather than
 * replaced.
 *
 * Nineteen call sites read `ACCENT.blue` and friends, most of them
 * inside a frame callback or a `useMemo`. Swapping the binding
 * would leave every one of them holding the old object; writing
 * over the properties means the next read is simply correct, which
 * is the same trick `lib/reel` and `lib/skillHover` already use for
 * state the frame loop owns.
 */
export const ACCENT = { ...ACCENT_NIGHT };

/** The parts of the scene that are not materials. */
const SCENE_NIGHT = {
  sky: "#000000",
  // Dust, stars, lamp pools and a bloom pass: all of them are ways
  // of saying "this is dark", and none of them survives daylight.
  bloom: 1.15,
  bloomFloor: 0.9,
  motes: true,
  // Dense enough that the far end of the road is a haze of
  // lights rather than a row of boxes.
  fog: 1,
  ambient: [0.07, 0.25],
  hemi: ["#8d9ccb", "#0a0a14", 0.18, 1],
  dir: [0.08, 0.78],
};

const SCENE_DAY = {
  sky: "#dbe4f1",
  bloom: 0.08,
  bloomFloor: 1,
  motes: false,
  // Daylight is clear. At the night density a pale fog does not
  // read as distance, it reads as everything being the same colour
  // as the sky - which is what the first day render looked like.
  fog: 0.2,
  // The first number is indoors, the second is what the outdoors
  // adds on top. Indoors is lamp-lit and the night values leave it
  // almost unlit on purpose, so the one lamp reads as a light
  // source - but a light room at those levels is a dark room with
  // light paint, so day lifts the floor and adds less.
  ambient: [0.62, 0.1],
  hemi: ["#eaf2ff", "#b5b0a4", 0.55, 0.3],
  dir: [0.42, 1.1],
};

export const SCENE = { ...SCENE_NIGHT };

const MAT_NIGHT = {
  shell: "#3c3c48",
  post: "#56566a",
  void: "#06060b",
  room: "#23232c",
  boards: "#3a2f26",
  road: "#0d0e12",
  paint: "#c9ccc4",
  paintGlow: "#41433e",
  door: "#6b5440",
  far: "#04040a",
  farLine: "#5f6ea8",
  // Wet asphalt. Dark, and polished enough to carry the lamps and
  // the neon back up at you, which is most of what makes the
  // street read as a street at night.
  ground: "#05050a",
  groundMetal: 0.92,
  groundRough: 0.16,
  gridA: "#343438",
  gridB: "#1e1e22",
};

const MAT_DAY = {
  shell: "#b9bfcf",
  post: "#9aa0b2",
  // The hole in a thing you are meant to read as open. At night the
  // eye calls the darkest patch a hole; in daylight it calls the
  // darkest patch a shadow, which is the same reading.
  void: "#6e7382",
  room: "#e4e5ec",
  boards: "#c3ad96",
  road: "#aeb2bc",
  paint: "#5d6168",
  paintGlow: "#000000",
  door: "#9a7555",
  // The skyline behind the town. A silhouette at night, and in
  // daylight a shape a little darker than the air it stands in.
  far: "#c2cadb",
  farLine: "#6b7490",
  // Dry, in daylight. A mirror with a bright sky over it reflects
  // the whole sky, and the street came out as one pale sheet with
  // the bottom of the town dissolved into it - which is what the
  // first two day renders were actually showing.
  ground: "#b4b9c4",
  groundMetal: 0.04,
  groundRough: 0.9,
  gridA: "#949aa8",
  gridB: "#a7adb9",
};

export const MAT = { ...MAT_NIGHT };

/** Writes the named palette over the three objects above. */
export function tintTown(theme = getTheme()) {
  const light = theme === "light";
  Object.assign(ACCENT, light ? ACCENT_DAY : ACCENT_NIGHT);
  Object.assign(SCENE, light ? SCENE_DAY : SCENE_NIGHT);
  Object.assign(MAT, light ? MAT_DAY : MAT_NIGHT);
}

tintTown();
// Before any component renders, so nothing ever reads a stale one.
onTheme(() => tintTown());

export function useTownMaterials() {
  const theme = useTheme();
  const mats = useMemo(() => {
    // Written before the materials are built out of it, so the
    // dependency below is a real one rather than a nudge to the
    // linter. The listener above has usually done this already;
    // doing it again costs three object copies.
    tintTown(theme);
    const lit = (color) =>
      new THREE.MeshBasicMaterial({ color, toneMapped: false });
    return {
      // Structure. Light enough to catch the key light - at near-black
      // a whole house read as a hole in the page.
      shell: new THREE.MeshStandardMaterial({
        color: MAT.shell,
        roughness: 0.78,
        metalness: 0.12,
      }),
      // Anything standing on its own in the dark, where the structure
      // tone would disappear: mailboxes, posts, lamp columns.
      post: new THREE.MeshStandardMaterial({
        color: MAT.post,
        roughness: 0.6,
        metalness: 0.25,
      }),
      // Anything whose colour is carried in the geometry rather than
      // in the material. One material, one draw call per buffer, and
      // as many colours as the buffer has vertices - which is how a
      // wood gets to be six greens without being six draw calls.
      painted: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.82,
        metalness: 0.06,
      }),
      // The inside of something you are meant to read as open. Unlit
      // on purpose: every other surface here takes the sky, and the
      // one that does not is the one the eye calls a hole.
      void: new THREE.MeshBasicMaterial({
        color: MAT.void,
        toneMapped: false,
      }),
      // Interior walls, a good deal darker than the outside shells.
      // Outdoors a surface has the sky to catch; in here the only
      // light is a desk lamp and a rack, and the walls have to fall
      // away for either of them to read as a light source at all.
      room: new THREE.MeshStandardMaterial({
        color: MAT.room,
        roughness: 0.92,
        metalness: 0.02,
      }),
      // Floorboards: matte, warm, and nothing like the grid outside.
      boards: new THREE.MeshStandardMaterial({
        color: MAT.boards,
        roughness: 0.95,
        metalness: 0,
      }),
      // Tarmac, and the paint on it. The lines are given a little
      // emissive so they still read as white at the far end of a road
      // lit by six lamps.
      road: new THREE.MeshStandardMaterial({
        color: MAT.road,
        roughness: 0.96,
        metalness: 0.04,
      }),
      paint: new THREE.MeshStandardMaterial({
        color: MAT.paint,
        roughness: 0.85,
        metalness: 0,
        emissive: MAT.paintGlow,
      }),
      door: new THREE.MeshStandardMaterial({
        color: MAT.door,
        roughness: 0.75,
        metalness: 0.05,
      }),
      warm: lit(ACCENT.amber),
      cool: lit(ACCENT.blue),
      cyan: lit(ACCENT.cyan),
      violet: lit(ACCENT.violet),
    };
  }, [theme]);

  useEffect(
    () => () => Object.values(mats).forEach((m) => m.dispose()),
    [mats],
  );
  return mats;
}
