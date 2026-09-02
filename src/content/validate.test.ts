import { describe, expect, it } from "vitest";
import { validateGuideData, validateStackData, ContentValidationError } from "./validate";

const validStack = {
  schemaVersion: 1,
  stackVersion: "1.0.0",
  name: "Test stack",
  updatedAt: "2026-01-01",
  components: [
    {
      id: "a",
      name: "A",
      kind: "skill",
      status: "active",
      scope: "global",
      role: "does things",
      whenToUse: ["always"],
      whenNotToUse: [],
      automation: "manual",
    },
  ],
};

const validGuide = {
  schemaVersion: 1,
  guideVersion: "1.0.0",
  updatedAt: "2026-01-01",
  categories: [
    {
      id: "start",
      label: "Start",
      description: "Starting things",
      connections: [],
      icon: "spark",
      image: "/illustrations/start.svg",
      mapRole: "station",
      position: { x: 200, y: 380 },
      next: [],
      references: [],
    },
  ],
  quickCommands: [
    { id: "c", label: "/c", command: "/c", purpose: "does a thing", tags: [] },
  ],
  workflows: [
    {
      id: "w",
      category: "start",
      title: "W",
      icon: "spark",
      summary: "summary",
      tags: [],
      whenToUse: [],
      whenNotToUse: [],
      stack: [],
      steps: ["one"],
      promptTemplate: "do it",
      antiPatterns: [],
      related: [],
      automation: "manual",
    },
  ],
};

describe("validateStackData", () => {
  it("accepts well-formed stack data", () => {
    expect(() => validateStackData(validStack)).not.toThrow();
  });

  it("rejects a stack missing a required root field", () => {
    const { name: _name, ...broken } = validStack;
    expect(() => validateStackData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a component missing required fields", () => {
    const broken = {
      ...validStack,
      components: [{ id: "a", name: "A" }],
    };
    expect(() => validateStackData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a component with an invalid automation value", () => {
    const broken = {
      ...validStack,
      components: [{ ...validStack.components[0], automation: "sometimes" }],
    };
    expect(() => validateStackData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a non-object payload", () => {
    expect(() => validateStackData(null)).toThrow(ContentValidationError);
    expect(() => validateStackData("nope")).toThrow(ContentValidationError);
  });
});

describe("validateGuideData", () => {
  it("accepts well-formed guide data", () => {
    expect(() => validateGuideData(validGuide)).not.toThrow();
  });

  it("rejects a workflow missing promptTemplate", () => {
    const { promptTemplate: _p, ...brokenWorkflow } = validGuide.workflows[0];
    const broken = { ...validGuide, workflows: [brokenWorkflow] };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects quickCommands that are not an array", () => {
    const broken = { ...validGuide, quickCommands: "nope" };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a quick command missing tags", () => {
    const { tags: _tags, ...brokenCommand } = validGuide.quickCommands[0];
    const broken = { ...validGuide, quickCommands: [brokenCommand] };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a workflow missing related", () => {
    const { related: _related, ...brokenWorkflow } = validGuide.workflows[0];
    const broken = { ...validGuide, workflows: [brokenWorkflow] };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a workflow whose related field is not a string array", () => {
    const broken = {
      ...validGuide,
      workflows: [{ ...validGuide.workflows[0], related: "not-an-array" }],
    };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a workflow with an invalid automation value", () => {
    const broken = {
      ...validGuide,
      workflows: [{ ...validGuide.workflows[0], automation: "sometimes" }],
    };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a category with an invalid mapRole", () => {
    const broken = {
      ...validGuide,
      categories: [{ ...validGuide.categories[0], mapRole: "satellite" }],
    };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a category whose position is not numeric", () => {
    const broken = {
      ...validGuide,
      categories: [{ ...validGuide.categories[0], position: { x: "200", y: 380 } }],
    };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a category missing description or connections", () => {
    const broken = {
      ...validGuide,
      categories: [{ id: "start", label: "Start" }],
    };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });

  it("rejects a category whose connections field is not a string array", () => {
    const broken = {
      ...validGuide,
      categories: [{ ...validGuide.categories[0], connections: "start" }],
    };
    expect(() => validateGuideData(broken)).toThrow(ContentValidationError);
  });
});
