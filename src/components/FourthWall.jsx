import { DESK, GONE, LIFT, MON, REACH, useWall } from "../lib/fourthWall";

/**
 * The room the town turns out to be in.
 *
 * Drawn rather than modelled, and in the same hand as the rest of the
 * site: outlines, one weight of line, nothing filled that is not
 * nearly black. A figure built out of boxes would have had to stand
 * next to eight buildings that are not, and a person is the one
 * thing that cannot be made that way without looking like it was.
 *
 * So there is no face and no head - a pair of forearms on the desk,
 * the top of a chair, and the line of a pair of shoulders. Hands on
 * a keyboard say someone is sitting here; a head seen from behind at
 * this distance only ever says cartoon.
 *
 * Everything is a percentage of the viewport, which is also how the
 * canvas behind it is scaled, so the picture lands inside the bezel
 * instead of near it. The figure is drawn in a 100x100 viewBox with
 * no aspect correction for the same reason: its coordinates are
 * viewport percentages too, and a forearm can take the stretch.
 */

const LINE = "rgba(190,196,214,0.55)";
const FAINT = "rgba(190,196,214,0.24)";

/** The opening the town sits in, in viewport percentages. */
const W = MON.scale * 100;
const X = 50 - W / 2;
const Y = MON.mid * 100 - W / 2;

export default function FourthWall() {
  const p = useWall();
  // Nothing of the room survives the end of the run. Left mounted,
  // the tablet is a black sheet over the page it just delivered.
  if (p <= 0 || p >= 1) return null;

  const desk = DESK(p);
  const reach = REACH(p);
  const lift = LIFT(p);
  const mix = (a, b) => a + (b - a) * lift;

  // The tablet goes from face up on the desk to filling the screen.
  // Interpolated as a rectangle rather than scaled, so its bezel
  // keeps the same thickness the whole way.
  const t = {
    x: mix(75.5, 0),
    y: mix(80, 0),
    w: mix(15, 100),
    h: mix(13.5, 100),
    r: mix(0.9, 0),
    tilt: -7 * (1 - lift),
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ opacity: 1 - GONE(p) }}
    >
      <div className="absolute inset-0" style={{ opacity: desk }}>
        {/* The bezel around the town, and what holds it up. */}
        <div
          className="absolute rounded-[0.4vh] border"
          style={{
            left: `${X - 1}%`,
            top: `${Y - 1.5}%`,
            width: `${W + 2}%`,
            height: `${W + 3}%`,
            borderColor: FAINT,
            boxShadow: "0 0 0 2vh rgba(6,7,11,0.94)",
          }}
        />
        <div
          className="absolute border-x"
          style={{
            left: "47.6%",
            top: `${Y + W + 1.5}%`,
            width: "4.8%",
            height: "6%",
            borderColor: FAINT,
          }}
        />
        <div
          className="absolute rounded-[0.3vh] border"
          style={{
            left: "39%",
            top: `${Y + W + 7.3}%`,
            width: "22%",
            height: "1.2%",
            borderColor: FAINT,
          }}
        />

        {/* The desk. An edge is all you see of a surface you are
            sitting at. */}
        <div
          className="absolute inset-x-0"
          style={{
            top: "77%",
            height: "1px",
            background: `linear-gradient(to right, transparent, ${LINE} 14%, ${LINE} 86%, transparent)`,
          }}
        />

        {/* Keyboard and mouse, laid back a little. */}
        <div
          className="absolute rounded-[0.5vh] border"
          style={{
            left: "33%",
            top: "80%",
            width: "34%",
            height: "9%",
            borderColor: LINE,
            transform: "perspective(60vh) rotateX(34deg)",
            transformOrigin: "center top",
          }}
        />
        <div
          className="absolute border"
          style={{
            left: "69.5%",
            top: "81%",
            width: "3.6%",
            height: "5.4%",
            borderRadius: "50% 50% 44% 44%",
            borderColor: LINE,
            opacity: 1 - reach * 0.55,
          }}
        />

        {/* Whoever is sitting here, from behind and cropped at the
            shoulders. Coordinates are viewport percentages. */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          fill="rgba(5,6,10,0.96)"
          stroke={LINE}
          strokeWidth="0.17"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ overflow: "visible" }}
        >
          {/* Filled, not drawn: these are the nearest things to you
              in the room and they have to take a bite out of the
              desk behind them, which an outline does not. */}
          <path
            d="M24 100 L24 97.4 Q24 96.1 26 96.1 L74 96.1 Q76 96.1 76 97.4 L76 100 Z"
            stroke={FAINT}
          />
          <path d="M11 100 Q26 94.6 50 94.1 Q74 94.6 89 100 Z" />
          <path d="M34 100 Q36.5 92.6 39 87.9 Q39.6 86.5 41.3 86.4 Q43.2 86.4 43.6 87.7 Q42.4 93.1 41.7 100 Z" />
          <g transform={`rotate(${reach * 11} 66 100)`}>
            <path d="M64.9 100 Q67.6 92.6 70 86.7 Q70.6 85.3 72.2 85.3 Q74.1 85.3 74.4 86.6 Q72.7 93.1 71.7 100 Z" />
          </g>
        </svg>
      </div>

      {/* The tablet. Face up on the desk, then in front of you. It
          outlasts the rest of the room, because by the end it is the
          only thing left on the screen. */}
      <div
        className="absolute border"
        style={{
          left: `${t.x}%`,
          top: `${t.y}%`,
          width: `${t.w}%`,
          height: `${t.h}%`,
          borderRadius: `${t.r}vh`,
          borderColor: lift > 0.94 ? "transparent" : LINE,
          background: `rgba(5,6,10,${0.45 + 0.55 * lift})`,
          transform: `rotate(${t.tilt}deg)`,
          opacity: Math.max(desk, lift),
        }}
      />
    </div>
  );
}
