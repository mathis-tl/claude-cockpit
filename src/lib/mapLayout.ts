import type { Category, MapRole } from "../content/types";

/**
 * Fixed world-space geometry for the workflow map.
 *
 * Every node lives at a known coordinate inside a constant world, so the whole
 * map can be moved with a single `translate()/scale()` on one wrapper element.
 * Nothing here reads the DOM: connector geometry stays valid at any zoom level,
 * which measured (getBoundingClientRect) coordinates could not do.
 */

export const WORLD = { width: 1800, height: 1150 } as const;

/** Horizontal inset of the transversal support bands. */
const BAND_INSET = 60;

/** Node footprint per visual weight, in world units. */
const NODE_SIZE: Record<Exclude<MapRole, "band">, { width: number; height: number }> = {
  hub: { width: 320, height: 190 },
  station: { width: 240, height: 140 },
  terminal: { width: 190, height: 120 },
};

const BAND_HEIGHT = 88;

/** Width of a focused station once its child workflows are revealed. */
export const EXPANDED_WIDTH = 400;
/** Fixed chrome inside an expanded station: header, padding, separator. */
const EXPANDED_HEADER = 128;
/**
 * Height reserved per child workflow.
 *
 * A row is title + summary + badge on one line each, so its height does not
 * depend on wording or on the viewport — WorkflowMap.css clamps both lines.
 * The value is deliberately above the rendered 58 (56 + gap): the model must
 * over-reserve, never under-reserve.
 */
const EXPANDED_ROW = 62;
const EXPANDED_PADDING = 22;
/** Chrome above the rows on a band focus surface: icon, label, description. */
const BAND_FOCUS_HEADER = 96;
/** Gap between a band and its focus surface, matching the tick length. */
export const BAND_FOCUS_GAP = 18;
/** Clearance kept between the focus surface and any other node. */
const BAND_FOCUS_CLEARANCE = 24;

/** Outside lane used when a connector would otherwise cut across the spine. */
const GUTTER_LEFT = 26;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const WORLD_RECT: Rect = { x: 0, y: 0, width: WORLD.width, height: WORLD.height };

export interface MapNode extends Rect {
  id: string;
  role: MapRole;
  category: Category;
}

export interface Point {
  x: number;
  y: number;
}

export type EdgeKind = "progression" | "relation";

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  path: string;
}

/** A support band's attachment marks, at the x of each station it serves. */
export interface BandTick {
  bandId: string;
  nodeId: string;
  x: number;
}

export function centerOf(rect: Rect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/**
 * World box of every category. `position` in data is the node centre, so node
 * sizes can change without rewriting content.
 */
export function layoutNodes(categories: Category[]): MapNode[] {
  return categories.map((category) => {
    const { x, y } = category.position;
    if (category.mapRole === "band") {
      return {
        id: category.id,
        role: category.mapRole,
        category,
        x: BAND_INSET,
        y: y - BAND_HEIGHT / 2,
        width: WORLD.width - BAND_INSET * 2,
        height: BAND_HEIGHT,
      };
    }
    const size = NODE_SIZE[category.mapRole];
    return {
      id: category.id,
      role: category.mapRole,
      category,
      x: x - size.width / 2,
      y: y - size.height / 2,
      width: size.width,
      height: size.height,
    };
  });
}

/** Footprint of a station once expanded. Grows down-right from the anchor. */
export function expandedRect(node: MapNode, childCount: number): Rect {
  if (node.role === "band") return node;
  return {
    x: node.x,
    y: node.y,
    width: Math.max(node.width, EXPANDED_WIDTH),
    height: Math.max(
      node.height,
      EXPANDED_HEADER + childCount * EXPANDED_ROW + EXPANDED_PADDING,
    ),
  };
}

export function unionRect(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}

function overlaps(a: Rect, b: Rect, margin = 0): boolean {
  return (
    a.x - margin < b.x + b.width &&
    b.x < a.x + a.width + margin &&
    a.y - margin < b.y + b.height &&
    b.y < a.y + a.height + margin
  );
}

/**
 * Where a focused band shows its child workflows.
 *
 * A band is a full-width strip: it cannot grow in place without covering the
 * map, so its children get their own surface anchored to the strip instead.
 * The height comes from the child count, and the placement is the first
 * candidate that clears every other node — no per-band coordinates, so adding
 * a band or a workflow needs no change here.
 */
export function bandFocusRect(band: MapNode, childCount: number, others: Rect[]): Rect {
  const width = EXPANDED_WIDTH;
  const height = BAND_FOCUS_HEADER + childCount * EXPANDED_ROW + EXPANDED_PADDING;
  const columns = [
    band.x + (band.width - width) / 2,
    band.x,
    band.x + band.width - width,
  ];
  const start = (x: number, up: boolean): Rect => ({
    x,
    y: up ? band.y - BAND_FOCUS_GAP - height : band.y + band.height + BAND_FOCUS_GAP,
    width,
    height,
  });

  let best: Rect | null = null;
  let bestDistance = Infinity;
  for (const up of [true, false]) {
    for (const x of columns) {
      const rect = pushClear(start(x, up), others, up);
      if (!rect) continue;
      const distance = up ? band.y - (rect.y + rect.height) : rect.y - (band.y + band.height);
      if (distance < bestDistance) {
        best = rect;
        bestDistance = distance;
      }
    }
  }
  return best ?? start(columns[0], false);
}

/**
 * Slides a candidate further away from its band until it clears every node.
 *
 * Each step jumps past one obstacle, so it settles in at most one pass per
 * node: a crowded map produces a longer stem rather than an overlap.
 */
function pushClear(rect: Rect, others: Rect[], up: boolean): Rect | null {
  let current = rect;
  for (let step = 0; step <= others.length; step += 1) {
    const hit = others.find((other) => overlaps(current, other, BAND_FOCUS_CLEARANCE));
    if (!hit) return current;
    current = {
      ...current,
      y: up
        ? hit.y - BAND_FOCUS_CLEARANCE - current.height
        : hit.y + hit.height + BAND_FOCUS_CLEARANCE,
    };
  }
  return null;
}

/** Camera target that frames the focus surface together with its own strip. */
export function bandFocusTarget(band: MapNode, surface: Rect): Rect {
  return unionRect(surface, {
    x: surface.x,
    y: band.y,
    width: surface.width,
    height: band.height,
  });
}

function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

/** Anchor point where a connector meets a node, on the given side. */
function port(rect: Rect, side: "top" | "bottom" | "left" | "right"): Point {
  const c = centerOf(rect);
  switch (side) {
    case "top":
      return { x: c.x, y: rect.y };
    case "bottom":
      return { x: c.x, y: rect.y + rect.height };
    case "left":
      return { x: rect.x, y: c.y };
    default:
      return { x: rect.x + rect.width, y: c.y };
  }
}

/** Horizontal segments of the progression spine, used as a no-cross corridor. */
function spineSegments(nodes: MapNode[], byId: Map<string, MapNode>): Array<{ y: number; x1: number; x2: number }> {
  const segments: Array<{ y: number; x1: number; x2: number }> = [];
  for (const node of nodes) {
    for (const nextId of node.category.next) {
      const target = byId.get(nextId);
      if (!target) continue;
      const a = centerOf(node);
      const b = centerOf(target);
      if (Math.abs(a.y - b.y) > 40) continue;
      segments.push({ y: a.y, x1: Math.min(a.x, b.x), x2: Math.max(a.x, b.x) });
    }
  }
  return segments;
}

function crossesSpine(points: Point[], segments: Array<{ y: number; x1: number; x2: number }>): boolean {
  for (let i = 0; i < points.length - 1; i += 1) {
    const p = points[i];
    const q = points[i + 1];
    if (p.x !== q.x) continue; // only vertical runs can cut the horizontal spine
    const top = Math.min(p.y, q.y);
    const bottom = Math.max(p.y, q.y);
    for (const seg of segments) {
      if (top < seg.y && seg.y < bottom && p.x >= seg.x1 && p.x <= seg.x2) return true;
    }
  }
  return false;
}

function withinAny(point: Point, rects: Rect[]): boolean {
  return rects.some(
    (r) =>
      point.x >= r.x - 8 &&
      point.x <= r.x + r.width + 8 &&
      point.y >= r.y - 8 &&
      point.y <= r.y + r.height + 8,
  );
}

/**
 * Orthogonal connector between two nodes.
 *
 * Straight when the pair shares a row (the spine), otherwise a single-elbow L.
 * If both elbows would cut across the spine, the connector is taken around the
 * outside lane instead — that is the one relation (comprendre ↔ rechercher)
 * whose endpoints sit on opposite sides of the progression line.
 */
function routePoints(
  a: MapNode,
  b: MapNode,
  segments: Array<{ y: number; x1: number; x2: number }>,
): Point[] {
  const ca = centerOf(a);
  const cb = centerOf(b);
  const boxes = [a, b];

  if (Math.abs(ca.y - cb.y) <= 40) {
    const left = ca.x <= cb.x ? a : b;
    const right = ca.x <= cb.x ? b : a;
    return [port(left, "right"), port(right, "left")];
  }

  const goingDown = cb.y > ca.y;
  const goingRight = cb.x > ca.x;

  // Elbow 1: leave A vertically, enter B horizontally.
  const elbowV: Point[] = [
    port(a, goingDown ? "bottom" : "top"),
    { x: ca.x, y: cb.y },
    port(b, goingRight ? "left" : "right"),
  ];
  // Elbow 2: leave A horizontally, enter B vertically.
  const elbowH: Point[] = [
    port(a, goingRight ? "right" : "left"),
    { x: cb.x, y: ca.y },
    port(b, goingDown ? "top" : "bottom"),
  ];

  for (const candidate of [elbowV, elbowH]) {
    if (withinAny(candidate[1], boxes)) continue;
    if (crossesSpine(candidate, segments)) continue;
    return candidate;
  }

  // Outside lane: down/up the left gutter, clear of every node.
  const lane = GUTTER_LEFT;
  const upper = ca.y < cb.y ? a : b;
  const lower = ca.y < cb.y ? b : a;
  return [
    port(upper, "left"),
    { x: lane, y: centerOf(upper).y },
    { x: lane, y: centerOf(lower).y },
    port(lower, "left"),
  ];
}

/** SVG path through orthogonal points, with rounded corners. */
export function pointsToPath(points: Point[], radius = 16): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const inLen = Math.hypot(corner.x - prev.x, corner.y - prev.y);
    const outLen = Math.hypot(next.x - corner.x, next.y - corner.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const inUnit = { x: Math.sign(corner.x - prev.x), y: Math.sign(corner.y - prev.y) };
    const outUnit = { x: Math.sign(next.x - corner.x), y: Math.sign(next.y - corner.y) };
    d += ` L ${corner.x - inUnit.x * r} ${corner.y - inUnit.y * r}`;
    d += ` Q ${corner.x} ${corner.y} ${corner.x + outUnit.x * r} ${corner.y + outUnit.y * r}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export interface MapGraph {
  nodes: MapNode[];
  edges: MapEdge[];
  bandTicks: BandTick[];
  /** Adjacency used for emphasis and keyboard traversal. */
  neighbours: Record<string, string[]>;
}

/**
 * Builds the drawable graph.
 *
 * `next` produces directional progression edges, `connections` produces
 * structural relation edges. A pair present in both is drawn once, as
 * progression. Bands are not connected by lines — they carry attachment ticks
 * instead, which keeps long support links from cutting across the whole plan.
 */
export function buildGraph(categories: Category[]): MapGraph {
  const nodes = layoutNodes(categories);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const segments = spineSegments(nodes, byId);

  const edges: MapEdge[] = [];
  const drawn = new Set<string>();
  const neighbours: Record<string, string[]> = {};

  function link(a: string, b: string) {
    const list = (neighbours[a] ??= []);
    if (!list.includes(b)) list.push(b);
    const reverse = (neighbours[b] ??= []);
    if (!reverse.includes(a)) reverse.push(a);
  }

  for (const node of nodes) {
    neighbours[node.id] ??= [];
  }

  for (const node of nodes) {
    for (const nextId of node.category.next) {
      const target = byId.get(nextId);
      if (!target) continue;
      const key = pairKey(node.id, nextId);
      if (drawn.has(key)) continue;
      drawn.add(key);
      link(node.id, nextId);
      edges.push({
        id: `progression-${node.id}-${nextId}`,
        from: node.id,
        to: nextId,
        kind: "progression",
        path: pointsToPath(routePoints(node, target, segments)),
      });
    }
  }

  const bandTicks: BandTick[] = [];

  for (const node of nodes) {
    for (const otherId of node.category.connections) {
      const target = byId.get(otherId);
      if (!target) continue;
      const key = pairKey(node.id, otherId);
      if (drawn.has(key)) continue;
      drawn.add(key);
      link(node.id, otherId);

      const band = node.role === "band" ? node : target.role === "band" ? target : null;
      const station = band === node ? target : node;
      if (band) {
        if (station.role === "band") continue;
        bandTicks.push({ bandId: band.id, nodeId: station.id, x: centerOf(station).x });
        continue;
      }

      edges.push({
        id: `relation-${node.id}-${otherId}`,
        from: node.id,
        to: otherId,
        kind: "relation",
        path: pointsToPath(routePoints(node, target, segments)),
      });
    }
  }

  return { nodes, edges, bandTicks, neighbours };
}

export type Direction = "left" | "right" | "up" | "down";

/**
 * Next node when an arrow key is pressed.
 *
 * Connected nodes win, so arrow keys walk the workflow itself rather than a
 * grid; if nothing connected lies that way, the nearest node in that direction
 * is used so no part of the map can become unreachable.
 */
export function stepFocus(
  nodes: MapNode[],
  neighbours: Record<string, string[]>,
  fromId: string,
  direction: Direction,
): string | null {
  const from = nodes.find((n) => n.id === fromId);
  if (!from) return null;
  const origin = centerOf(from);

  // Offset to the nearest point of the target box, not its centre: a
  // full-width support band sits directly below every station even though its
  // centre is far away.
  const offset = (node: MapNode) => ({
    x: Math.min(Math.max(origin.x, node.x), node.x + node.width) - origin.x,
    y: Math.min(Math.max(origin.y, node.y), node.y + node.height) - origin.y,
  });

  const inDirection = (node: MapNode) => {
    const { x: dx, y: dy } = offset(node);
    switch (direction) {
      case "left":
        return dx < 0 && Math.abs(dx) >= Math.abs(dy);
      case "right":
        return dx > 0 && Math.abs(dx) >= Math.abs(dy);
      case "up":
        return dy < 0 && Math.abs(dy) > Math.abs(dx);
      default:
        return dy > 0 && Math.abs(dy) > Math.abs(dx);
    }
  };

  // Distance along the travelled axis, with drift across it penalised, so a
  // node straight ahead beats a nearer one off to the side.
  const score = (node: MapNode) => {
    const { x: dx, y: dy } = offset(node);
    return direction === "left" || direction === "right"
      ? Math.abs(dx) + Math.abs(dy) * 2
      : Math.abs(dy) + Math.abs(dx) * 2;
  };

  const connected = new Set(neighbours[fromId] ?? []);
  const candidates = nodes.filter((n) => n.id !== fromId && inDirection(n));
  const preferred = candidates.filter((n) => connected.has(n.id));
  const pool = preferred.length > 0 ? preferred : candidates;
  if (pool.length === 0) return null;
  return pool.reduce((best, node) => (score(node) < score(best) ? node : best)).id;
}

export interface Camera {
  x: number;
  y: number;
  k: number;
}

export interface Viewport {
  width: number;
  height: number;
}

/** Padding kept around the whole world in overview, as a fraction of the fit. */
const FIT_INSET = 0.94;
/** Requested focus magnification relative to the overview scale. */
const FOCUS_FACTOR = 1.5;
/**
 * World units of surrounding map that must stay visible around a focused node.
 * Sized to just reach the nearest neighbouring station (the spine steps ~500
 * units, the lower branch sits ~370 below it), so focus lowers its scale rather
 * than pushing every neighbour off frame on a short window.
 */
const FOCUS_MARGIN = 420;
/**
 * Same idea for a focused band, but smaller: its target already contains the
 * strip and is twice as tall as a station, so asking for a station's context
 * would pin the scale to the overview and leave the rows too small to read.
 */
export const BAND_FOCUS_CONTEXT = 200;

export function fitScale(viewport: Viewport): number {
  if (viewport.width <= 0 || viewport.height <= 0) return 1;
  return Math.min(viewport.width / WORLD.width, viewport.height / WORLD.height) * FIT_INSET;
}

export function overviewCamera(viewport: Viewport): Camera {
  const k = fitScale(viewport);
  return {
    k,
    x: (viewport.width - WORLD.width * k) / 2,
    y: (viewport.height - WORLD.height * k) / 2,
  };
}

/**
 * Camera centred on `target`.
 *
 * The scale is the requested 1.5x, but never more than the scale at which the
 * target plus `FOCUS_MARGIN` of context still fits the viewport — so a short
 * window zooms less instead of losing the surrounding map.
 */
export function focusCamera(viewport: Viewport, target: Rect, margin = FOCUS_MARGIN): Camera {
  const base = fitScale(viewport);
  const maxContextual = Math.min(
    viewport.width / (target.width + margin * 2),
    viewport.height / (target.height + margin * 2),
  );
  const k = Math.max(base, Math.min(base * FOCUS_FACTOR, maxContextual));
  const c = centerOf(target);
  return clampCamera(
    { k, x: viewport.width / 2 - c.x * k, y: viewport.height / 2 - c.y * k },
    viewport,
    unionRect(WORLD_RECT, target),
  );
}

/**
 * Keeps the world from drifting far off frame when focusing an edge node.
 *
 * `bounds` is normally the world, but a focused band's surface can sit just
 * outside it; including it here is what stops the surface being clamped off
 * the bottom of the stage.
 */
function clampCamera(camera: Camera, viewport: Viewport, bounds: Rect = WORLD_RECT): Camera {
  const overscan = 140 * camera.k;
  const clampAxis = (value: number, start: number, extent: number, size: number) => {
    const near = start * camera.k; // screen offset of the near edge, before panning
    const far = (start + extent) * camera.k;
    if (far - near <= size) return (size - (far - near)) / 2 - near;
    return Math.min(overscan - near, Math.max(size - overscan - far, value));
  };
  return {
    k: camera.k,
    x: clampAxis(camera.x, bounds.x, bounds.width, viewport.width),
    y: clampAxis(camera.y, bounds.y, bounds.height, viewport.height),
  };
}
