/**
 * Which tag on the skills board the pointer is on.
 *
 * A plain object for the same reason the monitor's scroll is one:
 * this changes on pointer movement, and routing pointer movement
 * through React state re-runs the stage, the scene, the room and
 * everything in it to repaint one panel on one wall.
 *
 * It got worse when the board got its look-around back. The wall
 * now drifts under the cursor as the camera leans, so the tag
 * underneath changes when the camera moves and not only when the
 * hand does - which turned a render of the whole room into
 * something that could happen on any frame rather than on any
 * gesture.
 *
 * Nothing subscribes. The screen reads it in a frame callback and
 * repaints only when it finds a different tag than the one already
 * on the glass.
 */
export const skillHover = { hit: null };
