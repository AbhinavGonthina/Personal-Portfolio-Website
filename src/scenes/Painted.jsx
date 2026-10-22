import { useEffect, useMemo } from "react";
import TownScene from "./TownScene";
import {
  paintBoard,
  paintBoardFace,
  paintBrowserChrome,
  paintDragHint,
  paintMark,
  paintProjectDetail,
  paintProjectsGrid,
  paintSkills,
} from "../lib/paint";
import { BOARD_LAMPS as LAMPS_AT } from "../lib/townGeometry";
import { projects } from "../data/projects";
import { profile, socials } from "../data/profile";
import { education } from "../data/about";
import { skillGroups } from "../data/skills";
import { useTheme } from "../lib/theme";

/**
 * Everything the town has to say, painted into canvas textures.
 *
 * This used to live in `TownStage`, one component up, and it was in
 * the wrong place for a reason that has nothing to do with the
 * painting: `lib/paint` imports three, for `CanvasTexture` and two
 * constants, and `lib/townGeometry` imports it through `lib/geo`.
 * `TownStage` is mounted by `App` on every visit, so those two
 * imports put the whole of three.js on the entry's static import
 * graph - which is why the built `index.html` carried a
 * `modulepreload` for a 193 kB gzip chunk that a reader on the
 * plain read never has a use for.
 *
 * Down here it is behind the same `lazy()` boundary as the scene,
 * so three arrives when the town does and not before. Nothing about
 * what is painted, or when, has changed: this component is mounted
 * exactly where `TownScene` was, so the textures are still built at
 * the moment the scene is, and still thrown away when it goes.
 *
 * No `off` guard on any of these, which the versions upstairs all
 * carried. `TownStage` returns null when the town is off, so this
 * is unmounted rather than rendered with nothing to do, and a
 * guard here could only ever be false.
 */
export default function Painted({
  live,
  focused,
  onFocus,
  onOpen,
  opened,
  stills,
}) {
  const theme = useTheme();

  const marks = useMemo(
    () => socials.map((s) => paintMark(s.icon, s.name, theme)),
    [theme],
  );
  const board = useMemo(() => paintBoard(profile, education, theme), [theme]);
  // Where the two lamps hang, as a fraction across the board, so the
  // pools they cast land under them rather than near them.
  const boardFace = useMemo(() => paintBoardFace(LAMPS_AT, theme), [theme]);
  const skills = useMemo(() => paintSkills(skillGroups, theme), [theme]);

  // The grid is painted once onto a canvas taller than the monitor
  // and scrolled by moving the texture, so it is not repainted as
  // the page moves. Only opening a project repaints anything.
  const grid = useMemo(() => paintProjectsGrid(projects, theme), [theme]);
  const hint = useMemo(() => paintDragHint(theme), [theme]);
  const chrome = useMemo(() => paintBrowserChrome(theme), [theme]);
  const detail = useMemo(() => {
    if (!opened) return null;
    const p = projects.find((x) => x.id === opened);
    return p ? paintProjectDetail(p, stills[p.id], theme) : null;
  }, [opened, stills, theme]);
  const screen = detail ?? grid;

  useEffect(() => () => marks.forEach((m) => m.dispose()), [marks]);
  useEffect(() => () => board?.dispose(), [board]);
  useEffect(() => () => boardFace?.dispose(), [boardFace]);
  useEffect(() => () => skills?.tex?.dispose(), [skills]);
  useEffect(() => () => grid?.tex?.dispose(), [grid]);
  useEffect(() => () => hint?.dispose(), [hint]);
  useEffect(() => () => chrome?.dispose(), [chrome]);
  useEffect(() => () => detail?.tex?.dispose(), [detail]);

  return (
    <TownScene
      active={live}
      focused={focused}
      onFocus={onFocus}
      narrow={false}
      screen={screen}
      skills={skills}
      chrome={chrome}
      hint={hint}
      onOpen={onOpen}
      board={board}
      boardFace={boardFace}
      marks={marks}
    />
  );
}
