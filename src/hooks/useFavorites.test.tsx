import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useFavorites } from "./useFavorites";

describe("useFavorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite("new-project")).toBe(false);
  });

  it("toggles a workflow into and out of favorites", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite("new-project"));
    expect(result.current.favorites).toEqual(["new-project"]);
    expect(result.current.isFavorite("new-project")).toBe(true);

    act(() => result.current.toggleFavorite("new-project"));
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isFavorite("new-project")).toBe(false);
  });

  it("persists favorites to localStorage across mounts", () => {
    const { result, unmount } = renderHook(() => useFavorites());
    act(() => result.current.toggleFavorite("debug-bug"));
    unmount();

    const { result: second } = renderHook(() => useFavorites());
    expect(second.current.favorites).toEqual(["debug-bug"]);
  });
});
