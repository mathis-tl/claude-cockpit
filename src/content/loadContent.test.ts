import { describe, expect, it } from "vitest";
import { guideData, stackData } from "./loadContent";

describe("loadContent", () => {
  it("loads and validates the real stack and guide content without throwing", () => {
    expect(stackData.components.length).toBeGreaterThan(0);
    expect(guideData.workflows.length).toBeGreaterThan(0);
  });

  it("decodes prompt templates as real strings, never a literal backslash-n escape", () => {
    for (const workflow of guideData.workflows) {
      expect(workflow.promptTemplate).not.toContain("\\n");
    }
  });

  it("decodes multi-line prompt templates into real newline characters", () => {
    const multiLineWorkflowIds = ["new-project", "debug-bug", "verify-work"];
    for (const id of multiLineWorkflowIds) {
      const workflow = guideData.workflows.find((w) => w.id === id);
      expect(workflow?.promptTemplate).toContain("\n");
    }
  });

  it("every workflow.related id points at an existing workflow", () => {
    const ids = new Set(guideData.workflows.map((w) => w.id));
    for (const workflow of guideData.workflows) {
      for (const relatedId of workflow.related) {
        expect(ids.has(relatedId)).toBe(true);
      }
    }
  });

  it("every workflow.category id points at a declared category", () => {
    const categoryIds = new Set(guideData.categories.map((c) => c.id));
    for (const workflow of guideData.workflows) {
      expect(categoryIds.has(workflow.category)).toBe(true);
    }
  });

  it("every category.connections id points at an existing category", () => {
    const categoryIds = new Set(guideData.categories.map((c) => c.id));
    for (const category of guideData.categories) {
      for (const connectionId of category.connections) {
        expect(categoryIds.has(connectionId)).toBe(true);
      }
    }
  });

  it("no category connects to itself", () => {
    for (const category of guideData.categories) {
      expect(category.connections).not.toContain(category.id);
    }
  });
});
