/**
 * The section title in the corner of the screen.
 *
 * Nothing in the scene says which stop you are at, and a town with no
 * signposts is a nice place to be lost in. This is the one piece of
 * chrome every section keeps: the name and the same short rule the
 * plain layout uses, in the same place every time.
 */
export default function Marker({ children }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto w-full max-w-6xl px-6 pt-20">
      <h2 className="text-3xl font-semibold tracking-tight">{children}</h2>
      <div className="mt-3 h-px w-16 bg-fg" />
    </div>
  );
}
