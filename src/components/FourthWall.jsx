import { DESK, LOOK, MON, PULL, useWall } from "../lib/fourthWall";

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
 * Nothing in here is ever animated either. The room fades up, holds,
 * and then the whole view tilts off the top of it. A drawing that
 * holds still reads as a drawing; the moment it tries to act, it
 * reads as a bad one - so the last beat is a look, which is a move
 * the camera makes and the figure does not.
 *
 * Everything is a percentage of the viewport, which is also how the
 * canvas behind it is scaled, so the picture lands inside the bezel
 * instead of near it. The figure is drawn in a 100x100 viewBox with
 * no aspect correction for the same reason: its coordinates are
 * viewport percentages too, and a forearm can take the stretch.
 */

const LINE = "rgba(190,196,214,0.55)";
const FAINT = "rgba(190,196,214,0.24)";

/** The opening the town ends up in, in viewport percentages. */
const W = MON.scale * 100;
const X = 50 - W / 2;
const Y = MON.mid * 100 - W / 2;

export default function FourthWall() {
  const p = useWall();
  if (p <= 0 || p >= 1) return null;

  const pull = PULL(p);
  const desk = DESK(p);
  const look = LOOK(p);
  const mix = (a, b) => a + (b - a) * pull;

  // The bezel travels in from the edges of the window along with the
  // picture inside it. Drawn at its final size and faded up instead,
  // a monitor assembled itself around a screen that had already
  // shrunk away from it.
  const f = {
    x: mix(-1.2, X - 1),
    y: mix(-1.8, Y - 1.5),
    w: mix(102.4, W + 2),
    h: mix(103.6, W + 3),
  };

  return (
    <>
      {/* Under the screen and over the page: the room is solid, and
          the wall waiting above the desk must not read through the
          slot between the picture and the inside of its frame. A
          sibling rather than a child, because the room sits in its
          own stacking context and nothing inside it can get below
          the canvas. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[15]"
        style={{
          transform: `translateY(${look * 100}vh)`,
          background: `rgba(5,6,10,${desk})`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      >
        {/* One group, so the tilt takes the whole room with it. */}
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${look * 100}vh)` }}
        >
          <div
            className="absolute rounded-[0.4vh] border"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: `${f.w}%`,
              height: `${f.h}%`,
              borderColor: FAINT,
              // A wall of dark around the frame, so the room is a room
              // and not the town with a rectangle drawn on it.
              // Opaque once the room is up, so the page waiting above
              // the desk does not show through the walls of it.
              boxShadow: `0 0 0 100vmax rgba(6,7,11,${desk})`,
            }}
          />

          <div className="absolute inset-0" style={{ opacity: desk }}>
            {/* The neck and foot of the stand. */}
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

            {/* Keyboard, laid back a little. */}
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

            {/* The mouse: a tall oval that comes to a point at the far
                end, split down the top for the two buttons and with a
                wheel between them. A plain circle read as a coin. */}
            <div
              className="absolute"
              style={{ left: "69.4%", top: "80.6%", width: "4%", height: "7%" }}
            >
              <div
                className="absolute inset-0 border"
                style={{
                  borderColor: LINE,
                  borderRadius: "46% 46% 50% 50% / 62% 62% 38% 38%",
                }}
              />
              <div
                className="absolute"
                style={{
                  left: "50%",
                  top: "6%",
                  width: "1px",
                  height: "34%",
                  background: FAINT,
                }}
              />
              <div
                className="absolute border"
                style={{
                  left: "41%",
                  top: "15%",
                  width: "18%",
                  height: "13%",
                  borderRadius: "1vh",
                  borderColor: FAINT,
                }}
              />
            </div>

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
              <path d="M64.9 100 Q67.6 92.6 70 86.7 Q70.6 85.3 72.2 85.3 Q74.1 85.3 74.4 86.6 Q72.7 93.1 71.7 100 Z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
