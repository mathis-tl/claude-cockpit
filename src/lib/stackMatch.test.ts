import { describe, expect, it } from "vitest";
import { matchStackItems } from "./stackMatch";
import type { StackComponent } from "../content/types";

const components: StackComponent[] = [
  {
    id: "codebase-memory",
    name: "Codebase Memory",
    kind: "mcp",
    status: "active",
    scope: "global",
    role: "",
    whenToUse: [],
    whenNotToUse: [],
    automation: "manual",
  },
  {
    id: "headroom",
    name: "Headroom",
    kind: "infrastructure",
    status: "active",
    scope: "global-wrapper",
    role: "",
    whenToUse: [],
    whenNotToUse: [],
    automation: "automatic",
  },
];

describe("matchStackItems", () => {
  it("matches a stack line that names a component exactly", () => {
    const [result] = matchStackItems(["Codebase Memory"], components);
    expect(result.component?.id).toBe("codebase-memory");
  });

  it("matches a stack line that embeds a component name in prose", () => {
    const [result] = matchStackItems(["Headroom transparent"], components);
    expect(result.component?.id).toBe("headroom");
  });

  it("leaves unmatched lines without a component", () => {
    const [result] = matchStackItems(["Subagents pour parallélisme interne"], components);
    expect(result.component).toBeUndefined();
  });

  it("is case-insensitive", () => {
    const [result] = matchStackItems(["codebase memory pour comprendre"], components);
    expect(result.component?.id).toBe("codebase-memory");
  });
});
