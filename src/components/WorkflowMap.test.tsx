import { fireEvent, render, screen, within } from "@testing-library/react";
import mapCss from "./WorkflowMap.css?raw";
import { describe, expect, it, vi } from "vitest";
import { WorkflowMap } from "./WorkflowMap";
import { guideData } from "../content/loadContent";
import { categoryChildren } from "../lib/guideModel";

function renderMap(overrides: Partial<Parameters<typeof WorkflowMap>[0]> = {}) {
  const props = {
    guide: guideData,
    selectedCategoryId: null,
    activeWorkflowId: null,
    onSelectCategory: vi.fn(),
    onSelectWorkflow: vi.fn(),
    onClearSelection: vi.fn(),
    ...overrides,
  };
  return { ...render(<WorkflowMap {...props} />), props };
}

describe("WorkflowMap", () => {
  it("places one node per category and draws both edge kinds", () => {
    const { container } = renderMap();

    expect(container.querySelectorAll(".map-node")).toHaveLength(guideData.categories.length);
    expect(container.querySelectorAll(".map-edge--progression").length).toBeGreaterThan(0);
    expect(container.querySelectorAll(".map-edge--relation").length).toBeGreaterThan(0);
  });

  it("selects a category when its header is clicked", () => {
    const { props } = renderMap();

    fireEvent.click(screen.getAllByRole("button", { name: /Construire/ })[0]);
    expect(props.onSelectCategory).toHaveBeenCalledWith("build");
  });

  it("reveals the children of the selected category on the node itself", () => {
    const { container } = renderMap({ selectedCategoryId: "build" });

    const node = container.querySelector(".map-node.is-selected");
    expect(node).not.toBeNull();
    const rows = within(node as HTMLElement).getAllByRole("button");
    // one header plus one row per child workflow
    expect(rows).toHaveLength(categoryChildren(guideData, "build").length + 1);
  });

  it("leaves the other nodes at their overview position when one is selected", () => {
    const overview = renderMap().container.querySelector<HTMLElement>(
      '.map-node[style*="left"]:not(.is-selected)',
    );
    const overviewLeft = overview?.style.left;

    const { container } = renderMap({ selectedCategoryId: "build" });
    const same = container.querySelector<HTMLElement>(".map-node:not(.is-selected)");

    expect(same?.style.left).toBe(overviewLeft);
  });

  it("reveals a focused band's children on their own surface", () => {
    const { container } = renderMap({ selectedCategoryId: "session" });

    const band = container.querySelector(".map-node--band.is-selected") as HTMLElement;
    // The strip keeps its compact box; nothing is stuffed inside it.
    expect(band.querySelector(".map-node__children")).toBeNull();

    const surface = container.querySelector(".map-focus") as HTMLElement;
    expect(surface).not.toBeNull();
    expect(within(surface).getAllByRole("button")).toHaveLength(
      categoryChildren(guideData, "session").length,
    );
  });

  it("leaves the band strip at its overview geometry while focused", () => {
    const overview = renderMap().container.querySelector<HTMLElement>(".map-node--band");
    const before = overview?.getAttribute("style");

    const { container } = renderMap({ selectedCategoryId: "session" });
    const after = container.querySelector<HTMLElement>(".map-node--band")?.getAttribute("style");

    expect(after).toBe(before);
  });

  it("opens a workflow from a focused band's surface", () => {
    const { container, props } = renderMap({ selectedCategoryId: "stack" });

    const surface = container.querySelector(".map-focus") as HTMLElement;
    fireEvent.click(within(surface).getAllByRole("button")[0]);

    expect(props.onSelectWorkflow).toHaveBeenCalledWith(categoryChildren(guideData, "stack")[0].id);
  });

  it("keeps the focus surface out of the background-click path back to overview", () => {
    const { container, props } = renderMap({ selectedCategoryId: "session" });
    // jsdom has no PointerEvent, and fireEvent drops `button` on one; a
    // MouseEvent named "pointerdown" is what the handler actually reads.
    const press = (element: Element) => {
      element.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 0 }));
      element.dispatchEvent(new MouseEvent("pointerup", { bubbles: true, button: 0 }));
    };

    press(container.querySelector(".map-focus") as HTMLElement);
    expect(props.onClearSelection).not.toHaveBeenCalled();

    press(container.querySelector(".map__world") as HTMLElement);
    expect(props.onClearSelection).toHaveBeenCalledTimes(1);
  });

  it("keeps the child row single-line, which the height model depends on", () => {
    // jsdom does not lay out, so the guarantee is asserted on the stylesheet:
    // lib/mapLayout.ts sizes a focus surface as childCount x a fixed row
    // height, which only holds while neither line of a row can wrap.
    const rule = (selector: string) =>
      mapCss.slice(
        mapCss.indexOf(`${selector} {`),
        mapCss.indexOf("}", mapCss.indexOf(`${selector} {`)),
      );

    expect(rule(".map-child__title")).toContain("white-space: nowrap");
    expect(rule(".map-child__summary")).toContain("white-space: nowrap");
    expect(rule(".map-focus__desc")).toContain("line-clamp: 2");
  });

  it("opens a workflow from a revealed child row", () => {
    const { container, props } = renderMap({ selectedCategoryId: "build" });

    const node = container.querySelector(".map-node.is-selected") as HTMLElement;
    const [, firstChild] = within(node).getAllByRole("button");
    fireEvent.click(firstChild);

    expect(props.onSelectWorkflow).toHaveBeenCalledWith(categoryChildren(guideData, "build")[0].id);
  });
});
