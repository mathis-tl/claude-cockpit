import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useNotesOverlay } from "./useNotesOverlay";

describe("useNotesOverlay", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    const { result } = renderHook(() => useNotesOverlay());
    expect(result.current.isEmpty).toBe(true);
  });

  it("sets and reads a category field", () => {
    const { result } = renderHook(() => useNotesOverlay());
    act(() => result.current.setField("categories", "start", "description", "My wording"));
    expect(result.current.overlay.categories.start?.description).toBe("My wording");
    expect(result.current.isEmpty).toBe(false);
  });

  it("resets a single field without touching sibling fields", () => {
    const { result } = renderHook(() => useNotesOverlay());
    act(() => {
      result.current.setField("workflows", "new-project", "summary", "custom summary");
      result.current.setField("workflows", "new-project", "notes", "a reminder");
    });
    act(() => result.current.resetField("workflows", "new-project", "summary"));
    expect(result.current.overlay.workflows["new-project"]?.summary).toBeUndefined();
    expect(result.current.overlay.workflows["new-project"]?.notes).toBe("a reminder");
  });

  it("drops the entry entirely once its last field is reset", () => {
    const { result } = renderHook(() => useNotesOverlay());
    act(() => result.current.setField("categories", "start", "notes", "note"));
    act(() => result.current.resetField("categories", "start", "notes"));
    expect(result.current.overlay.categories.start).toBeUndefined();
    expect(result.current.isEmpty).toBe(true);
  });

  it("exports then imports back to an equivalent overlay", () => {
    const { result } = renderHook(() => useNotesOverlay());
    act(() => result.current.setField("categories", "build", "notes", "keep momentum"));
    const exported = result.current.exportJson();

    act(() => result.current.resetAll());
    expect(result.current.isEmpty).toBe(true);

    act(() => result.current.importJson(exported));
    expect(result.current.overlay.categories.build?.notes).toBe("keep momentum");
  });

  it("persists across mounts", () => {
    const { result, unmount } = renderHook(() => useNotesOverlay());
    act(() => result.current.setField("workflows", "debug-bug", "notes", "check logs first"));
    unmount();

    const { result: second } = renderHook(() => useNotesOverlay());
    expect(second.current.overlay.workflows["debug-bug"]?.notes).toBe("check logs first");
  });
});
