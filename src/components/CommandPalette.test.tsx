import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./CommandPalette";
import { guideData, stackData } from "../content/loadContent";
import { EMPTY_OVERLAY } from "../lib/notesOverlay";

describe("CommandPalette", () => {
  it("wraps focus from the last focusable element back to the first on Tab", () => {
    render(
      <CommandPalette
        guide={guideData}
        stackComponents={stackData.components}
        overlay={EMPTY_OVERLAY}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    const focusable = dialog.querySelectorAll("button, input");
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <CommandPalette
        guide={guideData}
        stackComponents={stackData.components}
        overlay={EMPTY_OVERLAY}
        onClose={onClose}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
