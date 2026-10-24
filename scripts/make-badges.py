"""Turn a square-ish source logo into a 256px badge for the skyline.

The badges sit flush on the face of a building, so a hard edge reads as a
sticker. Centre-crop to square, resize, then multiply a blurred rounded
rectangle into the alpha channel - the blur is what makes the edge melt
into the concrete instead of sitting on top of it.

    python scripts/make-badges.py philips pawtograder
    python scripts/make-badges.py            # every source
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

# The sources live beside this script rather than under `public/`.
# They were in `public/logos/usedlogos`, which meant eight logos that
# exist only so this script can read them were being uploaded to the
# web server and served to anybody who guessed the path. Nothing in
# the site has ever referenced them.
SRC = Path(__file__).parent / "badge-sources"
OUT = Path("public/logos/badges")
SIZE = 256
RADIUS = 56
BLUR = 7


def mask():
    m = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(m).rounded_rectangle(
        (4, 4, SIZE - 5, SIZE - 5), radius=RADIUS, fill=255
    )
    return m.filter(ImageFilter.GaussianBlur(BLUR))


def badge(path):
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    side = min(w, h)
    im = im.crop(
        ((w - side) // 2, (h - side) // 2, (w + side) // 2, (h + side) // 2)
    ).resize((SIZE, SIZE), Image.LANCZOS)

    # A JPEG has no alpha and a PNG may be transparent around the ink; flatten
    # onto the logo's own corner colour so the crop keeps its background
    # rather than gaining a black halo where the source was see-through.
    flat = Image.new("RGBA", (SIZE, SIZE), im.getpixel((1, 1))[:3] + (255,))
    flat.alpha_composite(im)

    flat.putalpha(mask())
    return flat


names = sys.argv[1:]
sources = (
    [p for p in sorted(SRC.iterdir()) if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
    if not names
    else [next(p for p in SRC.iterdir() if p.stem == n) for n in names]
)

OUT.mkdir(parents=True, exist_ok=True)
for p in sources:
    # WebP, losslessly. The badges were PNGs and came to 318KB across
    # the eight of them; the same pixels as lossless WebP are 195KB.
    #
    # Note that re-running this does not reproduce the committed
    # badges byte for byte - the crop, resize and blur come out a
    # shade different on a different Pillow - so only regenerate the
    # one you are actually changing, and look at it afterwards.
    out = OUT / f"{p.stem}.webp"
    badge(p).save(out, "WEBP", lossless=True, quality=100, method=6)
    print(f"{p.name} -> {out}")
