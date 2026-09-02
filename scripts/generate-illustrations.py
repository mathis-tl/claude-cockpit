"""Generates the isometric illustration set into public/illustrations.

Art direction (DESIGN_SPEC §11): technical editorial, black linework, white and
light-gray objects, cyan only inside the artwork, one coherent isometric family.
No text is ever baked into an asset.

Run from the repository root: `python3 scripts/generate-illustrations.py`.
Nothing in the app depends on this script — the SVGs it writes are the assets,
and any of them can be replaced by hand or by a better source without touching
a component. Image paths live in content/guide-content.json.
"""

import math
import os

W, H, V = 24.0, 13.85, 27.0  # iso unit: half-width, half-height, height

INK = "#1D1D1F"
TOP = "#FFFFFF"
RIGHT = "#E6E6EB"
LEFT = "#CDCDD5"
CY_TOP = "#BDEDF6"
CY_RIGHT = "#8ED9E9"
CY_LEFT = "#63C2D8"
CY_LINE = "#1B94AC"
SHADOW = "#1D1D1F"
STROKE = 2.2


def P(x, y, z=0.0):
    return ((x - y) * W, (x + y) * H - z * V)


def pts(points):
    return " ".join(f"{px:.2f},{py:.2f}" for px, py in points)


class Scene:
    def __init__(self):
        self.parts = []
        self.points = []

    def poly(self, points, fill, stroke=INK, width=STROKE, opacity=None):
        self.points.extend(points)
        attrs = f'fill="{fill}"'
        if stroke:
            attrs += f' stroke="{stroke}" stroke-width="{width}"'
        else:
            attrs += ' stroke="none"'
        if opacity is not None:
            attrs += f' opacity="{opacity}"'
        self.parts.append(f'<polygon points="{pts(points)}" {attrs}/>')

    def line(self, points, stroke=INK, width=STROKE, cap="round"):
        self.points.extend(points)
        self.parts.append(
            f'<polyline points="{pts(points)}" fill="none" stroke="{stroke}"'
            f' stroke-width="{width}" stroke-linecap="{cap}" stroke-linejoin="round"/>'
        )

    def circle(self, cx, cy, r, fill="none", stroke=INK, width=STROKE):
        self.points.extend([(cx - r, cy - r), (cx + r, cy + r)])
        self.parts.append(
            f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}"'
            f' stroke="{stroke}" stroke-width="{width}"/>'
        )

    # --- primitives -------------------------------------------------------

    def shadow(self, x, y, sx, sy, dx=0.34, dy=0.34):
        """Hard cast shadow: the footprint, offset on the ground plane."""
        x, y = x + dx, y + dy
        self.poly(
            [P(x, y), P(x + sx, y), P(x + sx, y + sy), P(x, y + sy)],
            SHADOW,
            stroke=None,
            opacity=0.13,
        )

    def box(self, x, y, z, sx, sy, sz, cyan=False):
        x1, y1, z1 = x + sx, y + sy, z + sz
        top = TOP if not cyan else CY_TOP
        right = RIGHT if not cyan else CY_RIGHT
        left = LEFT if not cyan else CY_LEFT
        self.poly([P(x1, y, z), P(x1, y1, z), P(x1, y1, z1), P(x1, y, z1)], right)
        self.poly([P(x, y1, z), P(x1, y1, z), P(x1, y1, z1), P(x, y1, z1)], left)
        self.poly([P(x, y, z1), P(x1, y, z1), P(x1, y1, z1), P(x, y1, z1)], top)

    def plate(self, x, y, z, sx, sy, cyan=False, thickness=0.16):
        self.box(x, y, z, sx, sy, thickness, cyan=cyan)

    def render(self, path):
        xs = [p[0] for p in self.points]
        ys = [p[1] for p in self.points]
        pad = 10
        minx, maxx = min(xs) - pad, max(xs) + pad
        miny, maxy = min(ys) - pad, max(ys) + pad
        body = "\n  ".join(self.parts)
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx:.1f} {miny:.1f}'
            f' {maxx - minx:.1f} {maxy - miny:.1f}" role="img" aria-hidden="true">\n'
            f'  <g stroke-linejoin="round">\n  {body}\n  </g>\n</svg>\n'
        )
        with open(path, "w") as f:
            f.write(svg)


# --- scenes ---------------------------------------------------------------


def start():
    """Drafting table with a blueprint sheet: opening or resuming a session."""
    s = Scene()
    s.shadow(0, 0, 3.2, 2.4)
    s.box(0, 0, 0, 3.2, 2.4, 0.85)
    z = 0.85
    s.plate(0.4, 0.35, z, 2.4, 1.7, thickness=0.12)  # sheet, lifted off the top
    z += 0.12
    s.poly(
        [P(0.6, 0.6, z), P(1.75, 0.6, z), P(1.75, 1.4, z), P(0.6, 1.4, z)],
        CY_TOP,
        stroke=CY_LINE,
        width=1.6,
    )
    s.line([P(0.6, 1.75, z), P(2.6, 1.75, z)], width=1.5)
    s.line([P(2.05, 0.6, z), P(2.6, 0.6, z)], width=1.5)
    s.line([P(2.05, 0.95, z), P(2.6, 0.95, z)], width=1.5)
    s.line([P(2.05, 1.3, z), P(2.6, 1.3, z)], width=1.5)
    return s


def session():
    """Cascading panels: several contexts held open at once."""
    s = Scene()
    s.shadow(0, 0, 3.7, 1.8)
    for i in range(3):
        x, z = i * 0.95, i * 0.5
        s.plate(x, 0, z, 1.8, 1.8, cyan=(i == 1), thickness=0.18)
        top = z + 0.18
        s.line(
            [P(x + 0.25, 0.35, top), P(x + 1.55, 0.35, top)],
            stroke=CY_LINE if i == 1 else INK,
            width=1.6,
        )
        s.line(
            [P(x + 0.25, 0.7, top), P(x + 1.1, 0.7, top)],
            stroke=CY_LINE if i == 1 else INK,
            width=1.6,
        )
    return s


def build():
    """Modular machine: assembled blocks with one active module."""
    s = Scene()
    s.shadow(0, 0, 3.0, 3.0)
    s.box(0, 0, 0, 3.0, 3.0, 0.3)
    # back to front, so the taller modules never cut into the ones in front
    s.box(0.15, 0.15, 0.3, 1.3, 1.3, 1.6, cyan=True)
    s.box(1.55, 0.15, 0.3, 1.3, 1.3, 1.0)
    s.box(0.15, 1.55, 0.3, 1.3, 1.3, 1.0)
    s.box(1.55, 1.55, 0.3, 1.3, 1.3, 0.6)
    return s


def debug():
    """System inspection: a screen read through a magnifier."""
    s = Scene()
    s.shadow(0, 0, 2.6, 1.4)
    s.box(0, 0, 0, 2.6, 1.4, 0.25)          # base
    s.box(0.35, 0.5, 0.25, 1.9, 0.3, 1.5)   # upright screen
    y = 0.8                                  # the face turned toward the viewer
    s.poly(
        [P(0.5, y, 0.45), P(2.1, y, 0.45), P(2.1, y, 1.6), P(0.5, y, 1.6)],
        CY_TOP,
        stroke=INK,
        width=1.8,
    )
    for i, row in enumerate((1.4, 1.15, 0.9, 0.65)):
        end = 1.95 if i != 2 else 1.45
        s.line([P(0.68, y, row), P(end, y, row)], stroke=CY_LINE, width=1.6)
    # magnifier over the lower right of the screen
    cx, cy = P(1.8, y, 0.9)
    s.circle(cx, cy, 16, fill="#FFFFFF", width=2.6)
    a = math.radians(48)
    s.line(
        [(cx + 16 * math.cos(a), cy + 16 * math.sin(a)),
         (cx + 31 * math.cos(a), cy + 31 * math.sin(a))],
        width=3.4,
    )
    # the anomaly, magnified
    s.circle(cx - 1, cy - 1, 5, fill=CY_LEFT, stroke=CY_LINE, width=2.0)
    return s


def research():
    """Branching options: three routes leave one decision point, one is taken."""
    s = Scene()
    s.shadow(0, 0, 3.6, 3.4)
    s.box(0, 0, 0, 3.6, 3.4, 0.22)
    z = 0.22
    origin = (0.6, 1.7)
    pads = [
        ((2.5, 0.35), 1.15, True),
        ((2.9, 1.5), 0.55, False),
        ((2.5, 2.65), 0.55, False),
    ]
    for (px, py), _, cyan in pads:
        s.line(
            [P(*origin, z), P(px + 0.35, py + 0.35, z)],
            stroke=CY_LINE if cyan else INK,
            width=5.0,
        )
    s.box(0.25, 1.35, z, 0.7, 0.7, 0.6)
    for (px, py), height, cyan in sorted(pads, key=lambda p: p[0][0] + p[0][1]):
        s.box(px, py, z, 0.7, 0.7, height, cyan=cyan)
    return s


def quality():
    """Checklist on a raised tablet: verification before hand-off."""
    s = Scene()
    s.shadow(0, 0, 2.4, 2.4)
    s.box(0.5, 0.5, 0, 1.4, 1.4, 0.5)   # stand
    s.plate(0, 0, 0.5, 2.4, 2.4, thickness=0.2)
    z = 0.7
    for row, cyan in ((0.45, False), (1.15, False), (1.85, True)):
        ink = CY_LINE if cyan else INK
        s.poly(
            [P(0.3, row - 0.26, z), P(0.82, row - 0.26, z),
             P(0.82, row + 0.26, z), P(0.3, row + 0.26, z)],
            CY_TOP if cyan else TOP,
            stroke=ink,
            width=1.8,
        )
        # a tick that reads correctly once projected: down, then up to the right
        s.line(
            [P(0.42, row - 0.02, z), P(0.55, row + 0.11, z), P(0.55, row - 0.3, z)],
            stroke=ink,
            width=2.4,
        )
        s.line([P(1.05, row, z), P(2.1, row, z)], width=1.6)
    return s


def final():
    """Terminal marker: the stepped plinth at the end of the spine."""
    s = Scene()
    s.shadow(0, 0, 2.4, 2.4)
    s.box(0, 0, 0, 2.4, 2.4, 0.4)
    s.box(0.45, 0.45, 0.4, 1.5, 1.5, 0.45)
    s.box(1.0, 1.0, 0.85, 0.16, 0.16, 2.2)  # pole
    top = P(1.08, 1.08, 3.05)
    s.poly(
        [top, (top[0] + 62, top[1] + 14), (top[0] + 62, top[1] + 40),
         (top[0], top[1] + 26)],
        CY_TOP,
        stroke=INK,
    )
    return s


def stack():
    """Layered plates: the infrastructure the whole map runs on."""
    s = Scene()
    s.shadow(0, 0, 2.6, 2.0)
    for i in range(4):
        s.plate(0, 0, i * 0.46, 2.6, 2.0, cyan=(i == 2), thickness=0.24)
    return s


SCENES = {
    "start": start,
    "session": session,
    "build": build,
    "debug": debug,
    "research": research,
    "quality": quality,
    "final": final,
    "stack": stack,
}

out = "public/illustrations"
os.makedirs(out, exist_ok=True)
for name, fn in SCENES.items():
    fn().render(os.path.join(out, f"{name}.svg"))
    print("wrote", name)
