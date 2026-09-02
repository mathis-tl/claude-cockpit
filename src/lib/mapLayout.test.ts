import { describe, expect, it } from "vitest";
import { guideData } from "../content/loadContent";
import {
  BAND_FOCUS_CONTEXT,
  BAND_FOCUS_GAP,
  WORLD,
  bandFocusRect,
  bandFocusTarget,
  buildGraph,
  centerOf,
  expandedRect,
  fitScale,
  focusCamera,
  layoutNodes,
  overviewCamera,
  pointsToPath,
  stepFocus,
  type MapNode,
  type Rect,
} from "./mapLayout";

const graph = buildGraph(guideData.categories);
const bands = graph.nodes.filter((n) => n.role === "band");
const others = (band: MapNode) => graph.nodes.filter((n) => n.id !== band.id);

function intersects(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
  );
}

describe("layoutNodes", () => {
  it("places every category inside the world", () => {
    for (const node of layoutNodes(guideData.categories)) {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.x + node.width).toBeLessThanOrEqual(WORLD.width);
      expect(node.y + node.height).toBeLessThanOrEqual(WORLD.height);
    }
  });

  it("centres a node on its declared position", () => {
    const build = layoutNodes(guideData.categories).find((n) => n.id === "build")!;
    expect(centerOf(build)).toEqual({ x: 700, y: 380 });
  });

  it("stretches bands across the world", () => {
    const session = layoutNodes(guideData.categories).find((n) => n.id === "session")!;
    expect(session.width).toBeGreaterThan(WORLD.width * 0.9);
  });

  it("grows an expanded station down and right from its anchor", () => {
    const start = layoutNodes(guideData.categories).find((n) => n.id === "start")!;
    const expanded = expandedRect(start, 3);
    expect(expanded.x).toBe(start.x);
    expect(expanded.y).toBe(start.y);
    expect(expanded.width).toBeGreaterThan(start.width);
    expect(expanded.height).toBeGreaterThan(start.height);
  });
});

describe("bandFocusRect", () => {
  it("derives its height from the child count", () => {
    const [band] = bands;
    const heights = [2, 3, 5].map((n) => bandFocusRect(band, n, others(band)).height);
    expect(heights[1] - heights[0]).toBeGreaterThan(0);
    // Constant per row: nothing is sized around today's three workflows.
    expect(heights[2] - heights[1]).toBe((heights[1] - heights[0]) * 2);
  });

  it("gives every band a placement that touches no other node", () => {
    for (const band of bands) {
      for (const count of [1, 3, 5]) {
        const rect = bandFocusRect(band, count, others(band));
        for (const other of others(band)) {
          expect([band.id, count, other.id, intersects(rect, other)]).toEqual([
            band.id,
            count,
            other.id,
            false,
          ]);
        }
      }
    }
  });

  it("stays attached to its own band and leaves the band itself in place", () => {
    for (const band of bands) {
      const rect = bandFocusRect(band, 3, others(band));
      const gap = rect.y > band.y ? rect.y - (band.y + band.height) : band.y - (rect.y + rect.height);
      expect(gap).toBe(BAND_FOCUS_GAP);
      expect(rect.x).toBeGreaterThanOrEqual(band.x);
      expect(rect.x + rect.width).toBeLessThanOrEqual(band.x + band.width);
    }
  });

  it("opens the two bands away from each other", () => {
    const [session, stack] = bands;
    const above = bandFocusRect(session, 3, others(session));
    const below = bandFocusRect(stack, 3, others(stack));
    expect(above.y).toBeLessThan(session.y);
    expect(below.y).toBeGreaterThan(stack.y);
  });
});

describe("buildGraph", () => {
  it("draws the progression spine as directional edges", () => {
    const progression = graph.edges
      .filter((e) => e.kind === "progression")
      .map((e) => `${e.from}->${e.to}`);
    expect(progression).toEqual(["start->build", "build->quality", "quality->final"]);
  });

  it("never draws the same pair twice", () => {
    const keys = graph.edges.map((e) => [e.from, e.to].sort().join("|"));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("prefers progression over relation for a pair present in both", () => {
    const buildQuality = graph.edges.filter(
      (e) => [e.from, e.to].sort().join("|") === "build|quality",
    );
    expect(buildQuality).toHaveLength(1);
    expect(buildQuality[0].kind).toBe("progression");
  });

  it("attaches support bands with ticks instead of long connectors", () => {
    expect(graph.edges.some((e) => e.from === "session" || e.to === "session")).toBe(false);
    expect(graph.bandTicks.map((t) => `${t.bandId}:${t.nodeId}`).sort()).toEqual([
      "session:quality",
      "session:start",
      "stack:research",
    ]);
  });

  it("keeps adjacency symmetric for keyboard traversal", () => {
    for (const [id, list] of Object.entries(graph.neighbours)) {
      for (const other of list) {
        expect(graph.neighbours[other]).toContain(id);
      }
    }
  });

  it("routes every connector orthogonally", () => {
    for (const edge of graph.edges) {
      expect(edge.path).toMatch(/^M [\d.-]+ [\d.-]+/);
      expect(edge.path).not.toContain("NaN");
    }
  });

  it("takes the outside lane rather than cutting across the spine", () => {
    const crossing = graph.edges.find(
      (e) => [e.from, e.to].sort().join("|") === "debug|research",
    );
    expect(crossing).toBeDefined();
    // The lane runs left of every node, so the path reaches a very small x.
    const xs = [...crossing!.path.matchAll(/[ML] ([\d.-]+) /g)].map((m) => Number(m[1]));
    expect(Math.min(...xs)).toBeLessThan(60);
  });
});

describe("stepFocus", () => {
  const step = (from: string, direction: "left" | "right" | "up" | "down") =>
    stepFocus(graph.nodes, graph.neighbours, from, direction);

  it("walks the spine with left and right", () => {
    expect(step("start", "right")).toBe("build");
    expect(step("build", "right")).toBe("quality");
    expect(step("quality", "right")).toBe("final");
    expect(step("build", "left")).toBe("start");
  });

  it("reaches the branches above and below the spine", () => {
    expect(step("build", "down")).toBe("debug");
    expect(step("quality", "up")).toBe("research");
    // The lower branch sits between two spine stations; leaving it upward
    // lands on the nearer one rather than on the hub.
    expect(step("debug", "up")).toBe("start");
  });

  it("reaches the support bands going down", () => {
    expect(step("debug", "down")).toBe("session");
    expect(step("session", "down")).toBe("stack");
  });

  it("returns null at the edge of the map", () => {
    expect(step("final", "right")).toBeNull();
    expect(step("research", "up")).toBeNull();
  });

  it("ignores an unknown origin", () => {
    expect(step("nope", "left")).toBeNull();
  });
});

describe("pointsToPath", () => {
  it("returns an empty path for a degenerate run", () => {
    expect(pointsToPath([{ x: 0, y: 0 }])).toBe("");
  });

  it("rounds corners without overshooting the segment", () => {
    const path = pointsToPath(
      [
        { x: 0, y: 0 },
        { x: 0, y: 20 },
        { x: 40, y: 20 },
      ],
      16,
    );
    expect(path).toContain("Q");
    expect(path).not.toContain("NaN");
  });
});

describe("camera", () => {
  const wide = { width: 1400, height: 900 };
  // Tall enough that 1.5x still leaves the required context margin.
  const tall = { width: 900, height: 1200 };

  it("fits the whole world in overview", () => {
    const camera = overviewCamera(wide);
    expect(WORLD.width * camera.k).toBeLessThanOrEqual(wide.width);
    expect(WORLD.height * camera.k).toBeLessThanOrEqual(wide.height);
  });

  it("reaches the full focus factor when the viewport allows it", () => {
    const target = graph.nodes.find((n) => n.id === "build")!;
    expect(focusCamera(tall, target).k).toBeCloseTo(fitScale(tall) * 1.5, 6);
  });

  it("reduces the focus scale instead of losing context on a short viewport", () => {
    const target = graph.nodes.find((n) => n.id === "build")!;
    const camera = focusCamera(wide, target);
    expect(camera.k).toBeLessThan(fitScale(wide) * 1.5);
    expect(camera.k).toBeGreaterThan(fitScale(wide));
  });

  it("never zooms below the overview scale, even for a full-width band", () => {
    const band = graph.nodes.find((n) => n.id === "session")!;
    expect(focusCamera(wide, band).k).toBeGreaterThanOrEqual(fitScale(wide));
  });

  it("keeps an edge node's surroundings on screen", () => {
    const final = graph.nodes.find((n) => n.id === "final")!;
    const camera = focusCamera(wide, final);
    // The right edge of the world must not drift far inside the viewport.
    const worldRight = camera.x + WORLD.width * camera.k;
    expect(worldRight).toBeGreaterThan(wide.width - 200);
  });

  it("frames a focused band's surface without clipping it, at any usable size", () => {
    // Wide desktop, laptop, side-by-side with an editor, and the narrowest
    // window that still shows the map rather than the list fallback.
    const viewports = [
      { width: 1600, height: 900 },
      { width: 1400, height: 700 },
      { width: 900, height: 760 },
      { width: 700, height: 620 },
    ];
    for (const viewport of viewports) {
      for (const band of bands) {
        const rect = bandFocusRect(band, 3, others(band));
        const camera = focusCamera(viewport, bandFocusTarget(band, rect), BAND_FOCUS_CONTEXT);
        const left = camera.x + rect.x * camera.k;
        const top = camera.y + rect.y * camera.k;
        const seen = [
          left >= 0,
          top >= 0,
          left + rect.width * camera.k <= viewport.width,
          top + rect.height * camera.k <= viewport.height,
        ];
        expect([viewport.width, band.id, seen]).toEqual([
          viewport.width,
          band.id,
          [true, true, true, true],
        ]);
      }
    }
  });

  it("degrades to a centred world when the viewport has no size", () => {
    const camera = overviewCamera({ width: 0, height: 0 });
    expect(Number.isFinite(camera.x)).toBe(true);
    expect(Number.isFinite(camera.y)).toBe(true);
  });
});
