import { describe, expect, it } from "vitest";
import {
  EMPTY_OVERLAY,
  OverlayParseError,
  mergeCategory,
  mergeWorkflow,
  parseOverlay,
  serializeOverlay,
} from "./notesOverlay";
import type { Category, Workflow } from "../content/types";

const category: Category = {
  id: "start",
  label: "Démarrer / reprendre",
  description: "Base description",
  connections: ["build"],
  icon: "spark",
  image: "/illustrations/start.svg",
  mapRole: "station",
  position: { x: 200, y: 380 },
  next: ["build"],
  references: [],
};

const workflow: Workflow = {
  id: "new-project",
  category: "start",
  title: "Nouveau projet",
  icon: "spark",
  summary: "Base summary",
  tags: [],
  whenToUse: [],
  whenNotToUse: [],
  stack: [],
  steps: [],
  promptTemplate: "",
  antiPatterns: [],
  related: [],
  automation: "manual",
};

describe("mergeCategory / mergeWorkflow", () => {
  it("returns the base content when there is no override", () => {
    expect(mergeCategory(category, undefined).description).toBe("Base description");
    expect(mergeWorkflow(workflow, undefined).summary).toBe("Base summary");
  });

  it("applies an override without mutating the base object", () => {
    const merged = mergeCategory(category, { description: "My wording" });
    expect(merged.description).toBe("My wording");
    expect(category.description).toBe("Base description");
  });

  it("ignores an empty-string override and falls back to base content", () => {
    expect(mergeWorkflow(workflow, { summary: "" }).summary).toBe("Base summary");
  });
});

describe("serializeOverlay / parseOverlay", () => {
  it("round-trips a well-formed overlay", () => {
    const overlay = {
      version: 1 as const,
      categories: { start: { description: "custom" } },
      workflows: { "new-project": { notes: "remember this" } },
    };
    const parsed = parseOverlay(serializeOverlay(overlay));
    expect(parsed).toEqual(overlay);
  });

  it("throws OverlayParseError on invalid JSON", () => {
    expect(() => parseOverlay("not json")).toThrow(OverlayParseError);
  });

  it("throws OverlayParseError when the root is not an object", () => {
    expect(() => parseOverlay("[1,2,3]")).toThrow(OverlayParseError);
  });

  it("drops unknown fields and empty entries instead of throwing", () => {
    const raw = JSON.stringify({
      categories: { start: { description: "kept", bogusField: "dropped" } },
      workflows: { ghost: {} },
    });
    const parsed = parseOverlay(raw);
    expect(parsed.categories.start).toEqual({ description: "kept" });
    expect(parsed.workflows.ghost).toBeUndefined();
  });

  it("serializes the empty overlay back to itself", () => {
    expect(parseOverlay(serializeOverlay(EMPTY_OVERLAY))).toEqual(EMPTY_OVERLAY);
  });
});
