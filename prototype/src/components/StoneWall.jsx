import { useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { makeRng } from "../lib/rng";
import { palette } from "../theme";

/**
 * Brick outlines radiating out from the portrait, so it reads as set into the
 * page itself rather than pasted on top of it.
 *
 * Everything is line work over the page's own background — no fills, no mortar
 * bed — and the courses fade out with distance, so the masonry dissolves into
 * the cream instead of ending on a hard edge.
 *
 * The component's root box IS the portrait. The SVG is `spread`x that size and
 * centred on it, which is what lets the brickwork overflow past the photo.
 * Generation is seeded, so a given `seed` always lays the same wall.
 *
 * Hidden in here: click the portrait, or press "d", and a dart thuds into the
 * wall. See the Easter egg block below.
 */

const VB = 1000;

// The palette's camel rather than a neutral ink, so the courses read as part
// of the warm scheme instead of pencil lines dropped onto the cream.
const LINE = palette.accent;
const RIM = palette.accentDark;

// Nail centre, measured up from the frame's top edge. The wire and the nail
// both derive from this, so they cannot drift apart.
const NAIL_UP = 46;
// How far the wire runs past the frame edge before the mount hides it.
const WIRE_TUCK = 8;

/* ------------------------------------------------------- the dart ------- */

/**
 * The dart's tip lands dead on the nail head — the exact point the picture
 * hangs from. The shaft then runs off to the right above the wire's right
 * leg, which at that x has already dropped well below it.
 */
const DART_X = "50%";
const DART_Y = -NAIL_UP;
const DART_W = 64;
const DART_H = 16;

/**
 * The throw is expressed as transform offsets from the resting place, never
 * as `left`/`top` — animating those would run layout on every frame. `z: 0`
 * keeps each target on a 3D transform, so the compositor owns it end to end.
 * The hero section clips, so x: 1400 starts the dart off-screen.
 */
const FLY_FROM = { x: 1400, y: -40, rotate: 4, z: 0 };
// A few degrees of droop, the way a dart sits once it is in the wall.
const DART_REST = { x: 0, y: 0, rotate: 6, z: 0, opacity: 1 };

/**
 * The portrait arrives *with* the dart on first load — same offsets, same
 * duration, same easing — so the two read as one thrown object rather than
 * two things that happen to land together. The picture carries a little tumble
 * that the dart does not; a rigid pair would look pasted together.
 */
const FLIGHT = { duration: 0.44, ease: "linear" };
const ARRIVE_FROM = { x: 1400, y: -40, rotate: -9, z: 0, opacity: 1 };
const ARRIVE_REST = { x: 0, y: 0, rotate: 0, z: 0, opacity: 1 };
// Just enough for the first line of hero copy to be up, so the throw has
// something to land next to rather than arriving on a blank page.
const ARRIVE_DELAY = 180;

/**
 * Samples a damped sine, A·e^(−λt)·sin(2πt/period), into a dense keyframe list.
 *
 * Everything below used to be a short list of hand-picked peaks eased with
 * "easeOut", and that is what read as blocky. Motion applies the easing curve
 * to *each segment between keyframes*, and easeOut is fastest at the start of
 * a segment — so the frame tore away from every extreme and crawled into the
 * next one. Velocity jumped at each peak, which is the exact opposite of a
 * pendulum, where velocity is zero at the extremes and greatest through the
 * middle.
 *
 * Sampling the real curve finely and interpolating linearly leaves no
 * per-segment easing to get wrong: the keyframes *are* the motion, so velocity
 * is continuous the whole way down and the decay is a true exponential rather
 * than a guessed ratio.
 */
const damped = ({ amp, period, decay, duration, steps = 90 }) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    // The tail is already within a hundredth of a degree of zero; pinning the
    // last sample makes sure it comes to rest exactly level.
    if (i === steps) return 0;
    const t = (i / steps) * duration;
    const v = amp * Math.exp(-decay * t) * Math.sin((2 * Math.PI * t) / period);
    return Number(v.toFixed(3));
  });

// A hard jolt through the whole wall, over in about six-tenths of a second.
const JOLT_T = 0.62;
const JOLT_WAVE = { decay: 7.5, duration: JOLT_T, steps: 60 };
const JOLT = {
  x: damped({ amp: -9, period: 0.17, ...JOLT_WAVE }),
  y: damped({ amp: 4, period: 0.15, ...JOLT_WAVE }),
  rotate: damped({ amp: 0.6, period: 0.18, ...JOLT_WAVE }),
  z: 0,
  transition: { duration: JOLT_T, ease: "linear" },
};

/**
 * The frame keeps swinging long after the wall has stopped — that lag is what
 * sells the weight of it. A longer period than the old version too: half a
 * second a swing was a buzz, not the swing of something hanging on a wire.
 *
 * `amp` overshoots the 9.5° first peak on purpose, because the envelope has
 * already decayed by the time the curve reaches its first quarter-period.
 */
const SWING_T = 2.6;
const SWING = {
  rotate: damped({ amp: -12.6, period: 0.72, decay: 1.6, duration: SWING_T }),
  transition: { duration: SWING_T, ease: "linear" },
};

// The shaft ringing around its embedded tip, offset onto the dart's resting
// droop so it rings about where it sits rather than about level.
const QUIVER_T = 0.85;
const QUIVER = {
  rotate: damped({
    amp: -3.4,
    period: 0.21,
    decay: 4.6,
    duration: QUIVER_T,
    steps: 60,
  }).map((v) => Number((v + DART_REST.rotate).toFixed(3))),
  z: 0,
  transition: { duration: QUIVER_T, ease: "linear" },
};

const BURST = {
  scale: [0.35, 1.5],
  opacity: [0.85, 0],
  transition: { duration: 0.42, ease: "easeOut" },
};

const BURST_R = 17;

export default function StoneFrame({ children, seed = 7, spread = 2 }) {
  const still = useReducedMotion();

  const wall = useAnimationControls();
  const arrive = useAnimationControls();
  const frame = useAnimationControls();
  const dart = useAnimationControls();
  const burst = useAnimationControls();
  // A ref, not state: re-entrancy has to be blocked synchronously, and a
  // throw should never cost a render.
  const throwing = useRef(false);

  const { bricks, cracks } = useMemo(() => {
    const rng = makeRng(seed);
    const COURSE = 62;

    // --- Courses in running bond, drawn as outlines only ---------------
    const bricks = [];
    let row = 0;
    for (let y = -COURSE; y < VB + COURSE; y += COURSE) {
      let x = -COURSE - (row % 2 ? 70 : 0) - rng() * 40;
      while (x < VB + COURSE) {
        const w = 92 + rng() * 74;
        // Wobble the corners so the courses aren't machine-perfect.
        const j = () => (rng() - 0.5) * 5;
        const x0 = x + j();
        const y0 = y + j();
        const x1 = x + w + j();
        const y1 = y + COURSE - 6 + j();

        // The courses run right across the middle. They used to be skipped
        // where the portrait covers them, which was free until the picture
        // started moving: it flies in on load and swings on impact, and both
        // uncover a bare rectangle in the wall where the bricks should be.
        bricks.push(
          `M ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${(y0 + j()).toFixed(1)} ` +
            `L ${(x1 + j()).toFixed(1)} ${y1.toFixed(1)} L ${x0.toFixed(1)} ${(y1 + j()).toFixed(1)} Z`,
        );
        x += w;
      }
      row++;
    }

    // --- Weathering running across the courses -------------------------
    // Short hairlines only, ringed around the portrait rather than scattered
    // over the whole canvas: the middle is behind the picture and everything
    // past ~0.8 of the radius is masked away, so a uniform scatter spent most
    // of its cracks where nothing could see them. Generated after the bricks,
    // so the courses are unchanged for a given seed.
    const cracks = [];
    for (let i = 0; i < 24; i++) {
      const steps = 2 + Math.floor(rng() * 3);
      const seg = 12 + rng() * 22;

      const ring = rng() * Math.PI * 2;
      const rad = 190 + rng() * 250;
      let cx = VB / 2 + Math.cos(ring) * rad;
      let cy = VB / 2 + Math.sin(ring) * rad;
      const bias = rng() * Math.PI * 2;
      let d = `M ${cx.toFixed(1)} ${cy.toFixed(1)}`;

      for (let k = 0; k < steps; k++) {
        const a = bias + (rng() - 0.5) * 1.9;
        const l = seg * (1 - k / (steps * 1.6));
        cx += Math.cos(a) * l;
        cy += Math.sin(a) * l;
        d += ` L ${cx.toFixed(1)} ${cy.toFixed(1)}`;
      }
      cracks.push({ d, w: 1.05, o: 0.26 });
    }

    return { bricks, cracks };
  }, [seed]);

  /**
   * `withPicture` is the page-load throw: the dart drags the framed portrait
   * on with it. A later click or keypress re-throws the dart alone, at a
   * picture that is already hanging.
   */
  const fire = useCallback(
    async (withPicture = false) => {
      if (throwing.current) return;
      throwing.current = true;

      // Reduced motion gets the punchline without the flight or the shaking.
      if (still) {
        dart.set(DART_REST);
        arrive.set(ARRIVE_REST);
        throwing.current = false;
        return;
      }

      dart.set({ ...FLY_FROM, opacity: 1 });
      burst.set({ scale: 0.35, opacity: 0 });
      if (withPicture) arrive.set(ARRIVE_FROM);

      // Awaited together, so neither can land first.
      await Promise.all([
        dart.start({ ...DART_REST, transition: FLIGHT }),
        withPicture
          ? arrive.start({ ...ARRIVE_REST, transition: FLIGHT })
          : Promise.resolve(),
      ]);

      // Impact. The wall jolt and the frame swing start together and are
      // deliberately not awaited — the jolt is over in half a second while
      // the frame is still swinging, which is what makes the two read as
      // different masses rather than one animation.
      burst.start(BURST);
      wall.start(JOLT);

      // Both awaited: the swing starts from level, so a second throw must not
      // land while the frame is still mid-arc or it would snap back to 0.
      await Promise.all([frame.start(SWING), dart.start(QUIVER)]);
      throwing.current = false;
    },
    [arrive, burst, dart, frame, still, wall],
  );

  // The entrance. Runs once; the portrait has no fade-in of its own, so this
  // throw is how it gets onto the page at all.
  useEffect(() => {
    const t = setTimeout(() => fire(true), ARRIVE_DELAY);
    return () => clearTimeout(t);
    // Deliberately once on mount: `fire` guards its own re-entrancy, but a
    // re-run here would throw the picture a second time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A plain keydown listener, not a scroll or pointermove one, so there is
  // nothing here to throttle — it fires once per key, not once per frame.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "d" && e.key !== "D") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t?.isContentEditable ||
        (t?.tagName && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
      ) {
        return;
      }
      fire();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fire]);

  const svgPct = `${spread * 100}%`;

  return (
    // The whole wall takes the jolt, and the frame swings on top of it —
    // nested transforms, so the picture inherits the shake and adds its own.
    <motion.div
      animate={wall}
      onClick={() => fire()}
      style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}
    >
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        aria-hidden="true"
        focusable="false"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: svgPct,
          height: svgPct,
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Courses dissolve into the page rather than stopping on an edge. */}
          <radialGradient id="sw-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="46%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="72%" stopColor="#fff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="sw-mask">
            <rect width={VB} height={VB} fill="url(#sw-fade)" />
          </mask>
        </defs>

        <g mask="url(#sw-mask)">
          {bricks.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={LINE}
              strokeWidth={2.4}
              strokeOpacity={0.62}
              strokeLinejoin="round"
            />
          ))}
          {cracks.map((c, i) => (
            <path
              key={`c${i}`}
              d={c.d}
              fill="none"
              stroke={LINE}
              strokeWidth={c.w}
              strokeOpacity={c.o}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      </svg>

      {/* Two nested transforms, because they pivot differently: the outer one
          flies the picture in from off-screen and tumbles about its own
          centre, the inner one is the pendulum about the nail head. Trying to
          do both on one element would mean one origin for two motions. */}
      <motion.div
        style={{ position: "absolute", inset: 0 }}
        initial={{ ...ARRIVE_FROM, opacity: 0 }}
        animate={arrive}
      >
        {/* Everything below the nail swings as one piece, pivoting about the
          nail head rather than the frame's own centre — that offset origin is
          what makes it read as a pendulum instead of a spinning card. The
          only thing that ever drives it is a dart landing — it hangs level and
          still the rest of the time. */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `50% ${-NAIL_UP}px`,
          }}
          initial={{ rotate: 0 }}
          animate={frame}
        >
          {/* Hanging wire. Its apex is pinned to exactly the nail centre and
            its ends run 8px past the frame's top edge, so the V hangs off the
            nail and tucks behind the mount instead of floating near both. The
            stroke is non-scaling, so it keeps an even weight despite the SVG
            being stretched to the frame's width. */}
          <svg
            viewBox={`0 0 100 ${NAIL_UP + WIRE_TUCK}`}
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
            style={{
              position: "absolute",
              left: 0,
              top: -NAIL_UP,
              width: "100%",
              height: NAIL_UP + WIRE_TUCK,
              overflow: "visible",
            }}
          >
            <path
              d={`M 50 0 L 8 ${NAIL_UP + WIRE_TUCK} M 50 0 L 92 ${NAIL_UP + WIRE_TUCK}`}
              fill="none"
              stroke={RIM}
              strokeWidth={1.2}
              strokeOpacity={0.6}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* The frame. Everything else on this page is thin line work on
            cream, so the moulding is a flat rule and a paper mount rather than
            a shaded 3D bevel — a gallery mat, not a picture-frame render. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: 13,
              boxSizing: "border-box",
              background: palette.bg,
              border: `1.5px solid ${RIM}`,
              // A single soft shadow is enough to lift it off the wall; the
              // inset highlight and shade that gave it relief are gone.
              boxShadow: "0 8px 20px rgba(46,38,32,0.12)",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                // Hairline between mount and photo, same weight as the bricks.
                boxShadow: `inset 0 0 0 1px ${LINE}`,
              }}
            >
              {children}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* The nail. Centred on the wire's apex via a -50% translate, and drawn
          as a ringed head so it reads as hardware at 11px rather than a dot. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: -NAIL_UP,
          width: 11,
          height: 11,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          border: `1.5px solid ${RIM}`,
          background: palette.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 3.5,
            height: 3.5,
            borderRadius: "50%",
            background: RIM,
          }}
        />
      </div>

      {/* Dust kicked out of the mortar at the point of impact. */}
      <motion.div
        aria-hidden
        initial={{ scale: 0.35, opacity: 0 }}
        animate={burst}
        style={{
          position: "absolute",
          left: DART_X,
          top: DART_Y,
          width: BURST_R * 2,
          height: BURST_R * 2,
          marginLeft: -BURST_R,
          marginTop: -BURST_R,
          pointerEvents: "none",
          zIndex: 4,
        }}
      >
        <svg
          viewBox={`${-BURST_R} ${-BURST_R} ${BURST_R * 2} ${BURST_R * 2}`}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {[0, 52, 104, 156, 208, 260, 312].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={Math.cos(a) * 6}
                y1={Math.sin(a) * 6}
                x2={Math.cos(a) * 15}
                y2={Math.sin(a) * 15}
                stroke={RIM}
                strokeWidth={1.4}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      </motion.div>

      {/* The dart itself. Always mounted at opacity 0, so the first throw is
          an animation rather than a mount — and so the controls are always
          bound. Same line-art vocabulary as the frame: cream fill, camel
          outline, no shading. */}
      <motion.div
        aria-hidden
        initial={{ ...FLY_FROM, opacity: 0 }}
        animate={dart}
        style={{
          position: "absolute",
          left: DART_X,
          top: DART_Y,
          width: DART_W,
          height: DART_H,
          marginTop: -DART_H / 2,
          // Pivots about the tip, so the quiver reads as the shaft ringing
          // around a fixed embedded point rather than the whole dart sliding.
          transformOrigin: "0% 50%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <svg
          viewBox={`0 0 ${DART_W} ${DART_H}`}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {/* Needle, tapering to the tip at x=0 — the point that stays put */}
          <path d="M 0 8 L 23 5.9 L 23 10.1 Z" fill={RIM} />
          <rect
            x="22"
            y="4.4"
            width="23"
            height="7.2"
            rx="3.6"
            fill={palette.bg}
            stroke={RIM}
            strokeWidth="1.4"
          />
          {/* Knurling on the barrel */}
          {[28, 32.5, 37, 41.5].map((x) => (
            <line
              key={x}
              x1={x}
              y1="6"
              x2={x}
              y2="10"
              stroke={RIM}
              strokeWidth="0.9"
              strokeOpacity="0.5"
            />
          ))}
          <path
            d="M 45 8 L 63 0.8 L 58.5 8 L 63 15.2 Z"
            fill={palette.bg}
            stroke={RIM}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
