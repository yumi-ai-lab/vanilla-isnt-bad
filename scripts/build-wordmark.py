"""Generate the two outlined wordmarks from the bundled, unmodified Inter font.

This is an optional design tool; the website build uses the committed SVG files.
Dependencies: fonttools 4.65.0, brotli 1.2.0, and Pillow.
"""

from pathlib import Path
from xml.sax.saxutils import escape

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from PIL import ImageFont


ROOT = Path(__file__).resolve().parents[1]
FONT = ROOT / "assets/fonts/inter/inter-latin-standard-normal.woff2"
LABEL = "VANILLA ISN’T BAD."
INK = "#282826"
WEIGHT = 600
# Optical corrections, in em, added to Inter's own pair kerning.
# Open the diagonal VA slightly; tighten the open spaces around L and punctuation.
PAIRS = {"VA": .008, "AN": -.004, "NI": -.008, "IL": -.004,
         "LL": -.018, "LA": -.022, "IS": -.004, "SN": -.006,
         "N’": -.024, "’T": -.012, "BA": -.008, "AD": -.006, "D.": -.026}
VARIANTS = {"display": {"opsz": 28, "tracking": .042},
            "small": {"opsz": 14, "tracking": .052}}


def wordmark_layout(variant):
    settings = VARIANTS[variant]
    font = TTFont(FONT)
    units = font["head"].unitsPerEm
    glyphs = font.getGlyphSet(location={"wght": WEIGHT, "opsz": settings["opsz"]})
    cmap = font.getBestCmap()
    metrics = ImageFont.truetype(str(FONT), units)
    metrics.set_variation_by_axes([
        WEIGHT if axis["name"] == b"Weight" else settings["opsz"]
        for axis in metrics.get_variation_axes()
    ])
    positions = []
    cursor = 0
    previous = ""
    for char in LABEL:
        if previous:
            pair = previous + char
            cursor += metrics.getlength(pair) - metrics.getlength(previous) - metrics.getlength(char)
            # The word space is already a full advance; do not track its two sides.
            if " " not in pair:
                cursor += units * (settings["tracking"] + PAIRS.get(pair, 0))
        positions.append((char, cursor, cmap[ord(char)]))
        cursor += metrics.getlength(char)
        previous = char
    return font, glyphs, units, positions


def build(variant):
    font, glyphs, units, positions = wordmark_layout(variant)
    bounds = BoundsPen(glyphs)
    for _, x, name in positions:
        glyphs[name].draw(TransformPen(bounds, (1, 0, 0, 1, x, 0)))
    left, bottom, right, top = bounds.bounds
    # A little room for antialiasing, without carrying font sidebearings into layout.
    inset = units * .012
    width, height = right - left + 2 * inset, top - bottom + 2 * inset
    paths = []
    for char, x, name in positions:
        pen = SVGPathPen(glyphs, ntos=lambda n: f"{n:.2f}".rstrip("0").rstrip("."))
        glyphs[name].draw(TransformPen(pen, (1, 0, 0, -1, x - left + inset, top + inset)))
        if pen.getCommands():
            paths.append(f'  <path d="{pen.getCommands()}"/>')
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.2f} {height:.2f}" '
        f'role="img" aria-label="{escape(LABEL)}" fill="{INK}">\n'
        f'  <title>{escape(LABEL)}</title>\n'
        f'  <!-- Inter 600, opsz {VARIANTS[variant]["opsz"]}; optically spaced wordmark. -->\n'
        + "\n".join(paths) + "\n</svg>\n"
    )
    destination = ROOT / f"assets/wordmark-{variant}.svg"
    destination.write_text(svg, encoding="utf-8", newline="\n")
    font.close()
    print(f"{destination.name}: {width / height:.3f}:1, {len(svg.encode('utf-8'))} bytes")


if __name__ == "__main__":
    for name in VARIANTS:
        build(name)
