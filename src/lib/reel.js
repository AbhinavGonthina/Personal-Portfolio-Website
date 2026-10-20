/**
 * Where the monitor on the desk is scrolled to.
 *
 * Deliberately not React state. The grid used to be scrolled by the
 * page: every tick set a number in `TownStage`, which re-ran the
 * whole stage, the scene, the room and the monitor to move a texture
 * offset by a few pixels. That is a full React render per pointer
 * move on the one screen in the site that also happens to be
 * carrying a megapixel of canvas, and it is why the list felt like
 * it was being dragged through mud.
 *
 * The list is dragged now rather than scrolled. Taking the wheel
 * meant taking it away from the page, and a stop that swallows the
 * gesture you were using to walk through the town is a stop you can
 * get stuck at.
 *
 * So this is a plain object that the wheel handler writes and the
 * monitor's frame callback reads. Nothing subscribes, nothing
 * renders, and the only work a wheel tick does is add to a float.
 *
 * `cur` chases `target` so the list glides to a stop instead of
 * stepping. A drag writes both at once, because a dragged surface
 * has to stay under the finger.
 */
export const reel = {
  /** Where the list is now, in canvas pixels from the top. */
  cur: 0,
  /** Where the wheel has asked it to go. */
  target: 0,
  /** The furthest it can go: canvas height minus the visible window. */
  max: 0,
  /**
   * Whether the list has ever been dragged. The hint over the
   * bottom of the screen goes as soon as it has.
   */
  touched: false,
};

/** Back to the top, for opening a project or walking away from one. */
export function rewind() {
  reel.cur = 0;
  reel.target = 0;
}

/**
 * Jump the list to one end without animating, for the moment the
 * camera arrives at the desk.
 *
 * Which end depends on which way you came. Walking in from the city
 * you should be looking at the top of the list; coming back up from
 * the mailboxes you should be looking at the bottom, because that is
 * the edge you were last at. Always snapping to the top means
 * scrolling up out of the room and back in rewinds the list under
 * you, which no scrolling box anywhere does.
 */
export function seek(end) {
  const to = end === "bottom" ? reel.max : 0;
  reel.cur = to;
  reel.target = to;
}
