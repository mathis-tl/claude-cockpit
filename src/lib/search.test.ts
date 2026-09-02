import { describe, expect, it } from "vitest";
import { searchGuide } from "./search";
import { guideData, stackData } from "../content/loadContent";
import type { NotesOverlay } from "./notesOverlay";

describe("searchGuide", () => {
  it("returns no results for an empty query", () => {
    expect(searchGuide(guideData, stackData.components, "")).toEqual([]);
    expect(searchGuide(guideData, stackData.components, "   ")).toEqual([]);
  });

  it("ranks a title match above a match only found deep in a prompt template", () => {
    const results = searchGuide(guideData, stackData.components, "debug");
    const titleMatch = results.find((r) => r.id === "debug-bug");
    expect(titleMatch).toBeDefined();
    expect(results[0].id).toBe("debug-bug");
  });

  it("is case- and accent-insensitive", () => {
    const lower = searchGuide(guideData, stackData.components, "reprendre");
    const upperAccented = searchGuide(guideData, stackData.components, "REPRENDRE");
    expect(upperAccented.map((r) => r.id)).toEqual(lower.map((r) => r.id));
    expect(lower.length).toBeGreaterThan(0);
  });

  it("finds stack components by name", () => {
    const results = searchGuide(guideData, stackData.components, "codebase memory");
    expect(results.some((r) => r.kind === "stack" && r.id === "codebase-memory")).toBe(true);
  });

  it("finds quick commands by their command string", () => {
    const results = searchGuide(guideData, stackData.components, "/compact");
    expect(results.some((r) => r.kind === "command" && r.id === "compact")).toBe(true);
  });

  it("returns nothing for a query that matches nothing", () => {
    const results = searchGuide(guideData, stackData.components, "zzz-not-present-anywhere");
    expect(results).toEqual([]);
  });

  it("finds a workflow through a personal note and flags the result", () => {
    const overlay: NotesOverlay = {
      version: 1,
      categories: {},
      workflows: { "debug-bug": { notes: "zzzmarqueurpersonnel" } },
    };
    const results = searchGuide(guideData, stackData.components, "zzzmarqueurpersonnel", overlay);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("debug-bug");
    expect(results[0].fromNotes).toBe(true);
  });

  it("finds a category through a personal note", () => {
    const overlay: NotesOverlay = {
      version: 1,
      categories: { build: { notes: "zzzmarqueurcategorie" } },
      workflows: {},
    };
    const results = searchGuide(guideData, stackData.components, "zzzmarqueurcategorie", overlay);
    expect(results.map((r) => r.id)).toEqual(["build"]);
  });

  it("searches the overridden summary rather than the base one", () => {
    const overlay: NotesOverlay = {
      version: 1,
      categories: {},
      workflows: { "debug-bug": { summary: "zzzresumeremplace" } },
    };
    const results = searchGuide(guideData, stackData.components, "zzzresumeremplace", overlay);
    expect(results[0].id).toBe("debug-bug");
    expect(results[0].subtitle).toBe("zzzresumeremplace");
    expect(results[0].fromNotes).toBe(false);
  });
});
