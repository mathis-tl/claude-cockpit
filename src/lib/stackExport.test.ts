import { describe, expect, it } from "vitest";
import {
  exportStackAsAsciiTree,
  exportStackAsJson,
  exportStackAsMarkdown,
  exportStackAsTransmission,
  stackSnapshotFilename,
} from "./stackExport";
import { stackData } from "../content/loadContent";

describe("exportStackAsJson", () => {
  it("produces valid JSON that round-trips to the source data", () => {
    const json = exportStackAsJson(stackData);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual(stackData);
  });
});

describe("exportStackAsMarkdown", () => {
  it("includes the stack name, version and every component", () => {
    const markdown = exportStackAsMarkdown(stackData);
    expect(markdown).toContain(stackData.name);
    expect(markdown).toContain(stackData.stackVersion);
    for (const component of stackData.components) {
      expect(markdown).toContain(component.name);
    }
  });
});

describe("exportStackAsAsciiTree", () => {
  it("groups components under their kind as tree branches", () => {
    const tree = exportStackAsAsciiTree(stackData);
    const kinds = [...new Set(stackData.components.map((c) => c.kind))];
    for (const kind of kinds) {
      expect(tree).toContain(kind);
    }
    for (const component of stackData.components) {
      expect(tree).toContain(component.name);
    }
  });
});

describe("exportStackAsTransmission", () => {
  it("produces a compact block listing every component id", () => {
    const transmission = exportStackAsTransmission(stackData);
    for (const component of stackData.components) {
      expect(transmission).toContain(component.id);
    }
  });
});

describe("stackSnapshotFilename", () => {
  it("embeds the version and update date", () => {
    const filename = stackSnapshotFilename(stackData);
    expect(filename).toContain(stackData.stackVersion);
    expect(filename).toContain(stackData.updatedAt);
    expect(filename.endsWith(".json")).toBe(true);
  });
});
