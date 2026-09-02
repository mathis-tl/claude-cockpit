import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlockPanel } from "./BlockPanel";
import { guideData, stackData } from "../content/loadContent";
import { EMPTY_OVERLAY, type NotesOverlay } from "../lib/notesOverlay";
import { AUTOMATION_LABEL } from "../lib/guideModel";

const workflow = guideData.workflows[0];

function renderPanel(overlay: NotesOverlay = EMPTY_OVERLAY) {
  const props = {
    guide: guideData,
    stack: stackData,
    route: { view: "workflow", id: workflow.id } as const,
    overlay,
    onSetField: vi.fn(),
    onResetField: vi.fn(),
    onResetWorkflow: vi.fn(),
    isFavorite: () => false,
    onToggleFavorite: vi.fn(),
    navigate: vi.fn(),
    onClose: vi.fn(),
  };
  return { ...render(<BlockPanel {...props} />), props };
}

describe("BlockPanel", () => {
  it("shows the workflow's automation state from data", () => {
    renderPanel();
    expect(screen.getByText(AUTOMATION_LABEL[workflow.automation])).toBeInTheDocument();
  });

  it("saves an edited summary on Cmd+Enter", () => {
    const { props } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: /Modifier : Résumé/ }));
    const field = screen.getByRole("textbox", { name: "Résumé" });
    fireEvent.change(field, { target: { value: "Mon propre résumé" } });
    fireEvent.keyDown(field, { key: "Enter", metaKey: true });

    expect(props.onSetField).toHaveBeenCalledWith(
      "workflows",
      workflow.id,
      "summary",
      "Mon propre résumé",
    );
  });

  it("discards the edit on Escape without closing the panel", () => {
    const { props } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: /Modifier : Résumé/ }));
    const field = screen.getByRole("textbox", { name: "Résumé" });
    fireEvent.change(field, { target: { value: "jeté" } });
    fireEvent.keyDown(field, { key: "Escape" });
    fireEvent.blur(field);

    expect(props.onSetField).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
    expect(screen.getByText(workflow.summary)).toBeInTheDocument();
  });

  it("offers a per-workflow restore only once something is overridden", () => {
    const { unmount } = renderPanel();
    expect(screen.queryByText("Rétablir ce workflow")).not.toBeInTheDocument();
    unmount();

    const { props } = renderPanel({
      version: 1,
      categories: {},
      workflows: { [workflow.id]: { notes: "une note" } },
    });
    fireEvent.click(screen.getByText("Rétablir ce workflow"));
    expect(props.onResetWorkflow).toHaveBeenCalledWith(workflow.id);
  });
});
