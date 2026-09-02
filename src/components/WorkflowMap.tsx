import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GuideData, Workflow } from "../content/types";
import {
  BAND_FOCUS_CONTEXT,
  BAND_FOCUS_GAP,
  WORLD,
  bandFocusRect,
  bandFocusTarget,
  buildGraph,
  expandedRect,
  focusCamera,
  overviewCamera,
  stepFocus,
  type Camera,
  type Direction,
  type MapNode,
  type Rect,
} from "../lib/mapLayout";
import { AUTOMATION_LABEL, categoryChildren } from "../lib/guideModel";
import { Icon } from "./Icon";
import "./WorkflowMap.css";

interface WorkflowMapProps {
  guide: GuideData;
  /** Category the camera is focused on, or null for overview. */
  selectedCategoryId: string | null;
  /** Workflow whose detail view is open, kept marked on the map. */
  activeWorkflowId: string | null;
  onSelectCategory: (id: string) => void;
  onSelectWorkflow: (id: string) => void;
  onClearSelection: () => void;
}

const ARROW_DIRECTION: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

/** Movement past which a pointer gesture is a pan rather than a click. */
const DRAG_THRESHOLD = 4;

const bandFocusId = (id: string) => `band-focus-${id}`;

function useViewport(ref: React.RefObject<HTMLElement | null>) {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return viewport;
}

export function WorkflowMap({
  guide,
  selectedCategoryId,
  activeWorkflowId,
  onSelectCategory,
  onSelectWorkflow,
  onClearSelection,
}: WorkflowMapProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const headerRefs = useRef(new Map<string, HTMLButtonElement>());
  const viewport = useViewport(frameRef);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rovingId, setRovingId] = useState<string | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const { nodes, edges, bandTicks, neighbours } = useMemo(
    () => buildGraph(guide.categories),
    [guide.categories],
  );

  const childrenByCategory = useMemo(() => {
    const map = new Map<string, Workflow[]>();
    for (const category of guide.categories) {
      map.set(category.id, categoryChildren(guide, category.id));
    }
    return map;
  }, [guide]);

  const selectedNode = nodes.find((n) => n.id === selectedCategoryId) ?? null;

  // A band spans the whole world, so it cannot hold its children in place: they
  // get a surface of their own, anchored to the strip and sized by the rows.
  const bandFocus = useMemo(() => {
    if (!selectedNode || selectedNode.role !== "band") return null;
    const children = childrenByCategory.get(selectedNode.id) ?? [];
    if (children.length === 0) return null;
    const rect = bandFocusRect(
      selectedNode,
      children.length,
      nodes.filter((n) => n.id !== selectedNode.id),
    );
    return { band: selectedNode, children, rect };
  }, [selectedNode, childrenByCategory, nodes]);

  // The camera never follows the detail view: opening a workflow leaves the
  // map exactly where entering its category put it.
  const camera: Camera = useMemo(() => {
    if (!selectedNode) return overviewCamera(viewport);
    if (bandFocus) {
      return focusCamera(
        viewport,
        bandFocusTarget(bandFocus.band, bandFocus.rect),
        BAND_FOCUS_CONTEXT,
      );
    }
    const children = childrenByCategory.get(selectedNode.id) ?? [];
    return focusCamera(viewport, expandedRect(selectedNode, children.length));
  }, [selectedNode, bandFocus, childrenByCategory, viewport]);

  // A new destination always starts from a clean, centred camera.
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [selectedCategoryId]);

  const emphasisId = hoveredId ?? selectedCategoryId;
  const related = useMemo(() => {
    if (!emphasisId) return null;
    return new Set([emphasisId, ...(neighbours[emphasisId] ?? [])]);
  }, [emphasisId, neighbours]);

  const focusHeader = useCallback((id: string) => {
    setRovingId(id);
    headerRefs.current.get(id)?.focus();
  }, []);

  function handleHeaderKeyDown(event: React.KeyboardEvent, nodeId: string) {
    const direction = ARROW_DIRECTION[event.key];
    if (!direction) return;
    const next = stepFocus(nodes, neighbours, nodeId, direction);
    if (!next) return;
    event.preventDefault();
    focusHeader(next);
  }

  // Pointer panning, and background click as one of the ways back to overview.
  const drag = useRef<{ x: number; y: number; origin: { x: number; y: number }; moved: boolean } | null>(
    null,
  );

  function handlePointerDown(event: React.PointerEvent) {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest(".map-node, .map-focus, .workflow-map__hud")) return;
    drag.current = { x: event.clientX, y: event.clientY, origin: pan, moved: false };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    if (!state.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    state.moved = true;
    setPan({ x: state.origin.x + dx, y: state.origin.y + dy });
  }

  function handlePointerUp(event: React.PointerEvent) {
    const state = drag.current;
    drag.current = null;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    // Only a gesture that began on the background counts as "click away".
    if (state && !state.moved && selectedCategoryId) onClearSelection();
  }

  const tabbableId = rovingId ?? selectedCategoryId ?? nodes[0]?.id ?? null;

  return (
    <div className="workflow-map">
      <div
        className={`workflow-map__frame${drag.current?.moved ? " is-panning" : ""}`}
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="map__world"
          style={{
            width: WORLD.width,
            height: WORLD.height,
            transform: `translate(${camera.x + pan.x}px, ${camera.y + pan.y}px) scale(${camera.k})`,
          }}
        >
          <svg
            className="map__edges"
            width={WORLD.width}
            height={WORLD.height}
            viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="map-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const touched = related ? related.has(edge.from) && related.has(edge.to) : false;
              const state = !related ? "" : touched ? " is-active" : " is-dim";
              return (
                <path
                  key={edge.id}
                  d={edge.path}
                  className={`map-edge map-edge--${edge.kind}${state}`}
                  markerEnd={edge.kind === "progression" ? "url(#map-arrow)" : undefined}
                />
              );
            })}

            {bandTicks.map((tick) => {
              const band = nodes.find((n) => n.id === tick.bandId);
              if (!band) return null;
              const dim = related && !(related.has(tick.bandId) && related.has(tick.nodeId));
              return (
                <line
                  key={`${tick.bandId}-${tick.nodeId}`}
                  x1={tick.x}
                  y1={band.y - 18}
                  x2={tick.x}
                  y2={band.y}
                  className={`map-tick${dim ? " is-dim" : ""}`}
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <MapNodeView
              key={node.id}
              node={node}
              workflows={childrenByCategory.get(node.id) ?? []}
              isSelected={selectedCategoryId === node.id}
              isDim={Boolean(related) && !related?.has(node.id)}
              activeWorkflowId={activeWorkflowId}
              tabbable={tabbableId === node.id}
              registerRef={(el) => {
                if (el) headerRefs.current.set(node.id, el);
                else headerRefs.current.delete(node.id);
              }}
              onHover={setHoveredId}
              onSelect={onSelectCategory}
              onSelectWorkflow={onSelectWorkflow}
              onKeyDown={handleHeaderKeyDown}
            />
          ))}

          {bandFocus && (
            <BandFocusView
              band={bandFocus.band}
              rect={bandFocus.rect}
              workflows={bandFocus.children}
              activeWorkflowId={activeWorkflowId}
              onSelectWorkflow={onSelectWorkflow}
            />
          )}
        </div>

        <div className="workflow-map__hud">
          {selectedCategoryId && (
            <button type="button" className="workflow-map__back" onClick={onClearSelection}>
              <span aria-hidden="true">←</span> Vue d&rsquo;ensemble
            </button>
          )}
        </div>

        {/* Frame chrome, so it steps aside rather than sitting under a focused surface. */}
        <p className={`workflow-map__stamp${selectedCategoryId ? " is-hidden" : ""}`}>
          Guide v{guide.guideVersion} · {guide.updatedAt}
        </p>
      </div>

      <ul className="workflow-map__fallback">
        {nodes.map((node) => {
          const children = childrenByCategory.get(node.id) ?? [];
          return (
            <li key={node.id}>
              <button type="button" onClick={() => onSelectCategory(node.id)}>
                <Icon name={node.category.icon} size={18} />
                <span>{node.category.label}</span>
                {children.length > 0 && (
                  <span className="workflow-map__fallback-count">{children.length}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface MapNodeViewProps {
  node: MapNode;
  workflows: Workflow[];
  isSelected: boolean;
  isDim: boolean;
  activeWorkflowId: string | null;
  tabbable: boolean;
  registerRef: (el: HTMLButtonElement | null) => void;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onSelectWorkflow: (id: string) => void;
  onKeyDown: (event: React.KeyboardEvent, nodeId: string) => void;
}

function MapNodeView({
  node,
  workflows,
  isSelected,
  isDim,
  activeWorkflowId,
  tabbable,
  registerRef,
  onHover,
  onSelect,
  onSelectWorkflow,
  onKeyDown,
}: MapNodeViewProps) {
  const { category, role } = node;
  const rect = isSelected ? expandedRect(node, workflows.length) : node;
  const isBand = role === "band";

  return (
    <div
      className={[
        "map-node",
        `map-node--${role}`,
        isSelected ? "is-selected" : "",
        isDim ? "is-dim" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        ref={registerRef}
        className="map-node__header"
        tabIndex={tabbable ? 0 : -1}
        aria-expanded={workflows.length > 0 ? isSelected : undefined}
        // A focused band's rows live outside its box, so the link is explicit.
        aria-controls={isBand && isSelected ? bandFocusId(node.id) : undefined}
        onFocus={() => onHover(node.id)}
        onBlur={() => onHover(null)}
        onKeyDown={(event) => onKeyDown(event, node.id)}
        onClick={() => onSelect(node.id)}
      >
        {!isBand && category.image && (
          <img className="map-node__art" src={category.image} alt="" aria-hidden="true" />
        )}
        <span className="map-node__icon">
          <Icon name={category.icon} size={isBand ? 16 : 20} />
        </span>
        <span className="map-node__label">{category.label}</span>
        {isBand ? (
          <span className="map-node__desc">{category.description}</span>
        ) : (
          workflows.length > 0 && <span className="map-node__count">{workflows.length}</span>
        )}
      </button>

      {/* Bands reveal their children on a focus surface instead: see BandFocusView. */}
      {isSelected && !isBand && workflows.length > 0 && (
        <ChildList
          workflows={workflows}
          activeWorkflowId={activeWorkflowId}
          onSelectWorkflow={onSelectWorkflow}
        />
      )}
    </div>
  );
}

interface ChildListProps {
  workflows: Workflow[];
  activeWorkflowId: string | null;
  onSelectWorkflow: (id: string) => void;
}

function ChildList({ workflows, activeWorkflowId, onSelectWorkflow }: ChildListProps) {
  return (
    <ul className="map-node__children">
      {workflows.map((workflow) => (
        <li key={workflow.id}>
          <button
            type="button"
            className={`map-child${activeWorkflowId === workflow.id ? " is-selected" : ""}`}
            onClick={() => onSelectWorkflow(workflow.id)}
            aria-current={activeWorkflowId === workflow.id ? "true" : undefined}
          >
            <span className="map-child__title">{workflow.title}</span>
            <span className="map-child__summary">{workflow.summary}</span>
            <span className={`map-child__automation is-${workflow.automation}`}>
              {AUTOMATION_LABEL[workflow.automation]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

interface BandFocusViewProps {
  band: MapNode;
  rect: Rect;
  workflows: Workflow[];
  activeWorkflowId: string | null;
  onSelectWorkflow: (id: string) => void;
}

/**
 * The children of a focused support band, on their own surface.
 *
 * It lives in world space next to the strip it belongs to, joined by a stem, so
 * it pans and zooms with the map and reads as an extension of the band rather
 * than as a detached dialog. Nothing else moves while it is open.
 */
function BandFocusView({
  band,
  rect,
  workflows,
  activeWorkflowId,
  onSelectWorkflow,
}: BandFocusViewProps) {
  const isAbove = rect.y < band.y;
  // Anchored on the edge facing the band, so any extra content grows away from it.
  const placement = isAbove
    ? { bottom: WORLD.height - (rect.y + rect.height) }
    : { top: rect.y };
  const stemTop = isAbove ? rect.y + rect.height : band.y + band.height;

  return (
    <>
      <div
        className="map-focus__stem"
        aria-hidden="true"
        style={{ left: rect.x + rect.width / 2 - 1, top: stemTop, height: BAND_FOCUS_GAP }}
      />
      <div
        id={bandFocusId(band.id)}
        className="map-focus"
        style={{ left: rect.x, width: rect.width, minHeight: rect.height, ...placement }}
      >
        <div className="map-focus__head">
          <span className="map-node__icon">
            <Icon name={band.category.icon} size={16} />
          </span>
          <span className="map-focus__label">{band.category.label}</span>
          <span className="map-node__count">{workflows.length}</span>
        </div>
        <p className="map-focus__desc">{band.category.description}</p>
        <ChildList
          workflows={workflows}
          activeWorkflowId={activeWorkflowId}
          onSelectWorkflow={onSelectWorkflow}
        />
      </div>
    </>
  );
}
