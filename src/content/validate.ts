/**
 * Lightweight structural validation mirroring schemas/*.schema.json.
 * Deliberately dependency-free: the schemas are small and stable, so a
 * hand-written check keeps the bundle minimal while still failing loudly
 * on malformed core data, per PROJECT_SPEC.md §11.
 */

export class ContentValidationError extends Error {
  constructor(source: string, problems: string[]) {
    super(
      `Invalid content in ${source}:\n${problems.map((p) => `  - ${p}`).join("\n")}`,
    );
    this.name = "ContentValidationError";
  }
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(isString);
}

const AUTOMATION_VALUES = new Set(["automatic", "manual", "mixed"]);
const MAP_ROLE_VALUES = new Set(["hub", "station", "terminal", "band"]);

function isPosition(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return typeof p.x === "number" && typeof p.y === "number";
}

function requireFields(
  obj: Record<string, unknown>,
  fields: string[],
  label: string,
  problems: string[],
): void {
  for (const field of fields) {
    if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
      problems.push(`${label} is missing required field "${field}"`);
    }
  }
}

function validateStackComponent(raw: unknown, index: number, problems: string[]): void {
  const label = `components[${index}]`;
  if (typeof raw !== "object" || raw === null) {
    problems.push(`${label} must be an object`);
    return;
  }
  const obj = raw as Record<string, unknown>;
  requireFields(
    obj,
    ["id", "name", "kind", "status", "scope", "role", "whenToUse", "whenNotToUse", "automation"],
    label,
    problems,
  );
  if ("whenToUse" in obj && !isStringArray(obj.whenToUse)) {
    problems.push(`${label}.whenToUse must be a string array`);
  }
  if ("whenNotToUse" in obj && !isStringArray(obj.whenNotToUse)) {
    problems.push(`${label}.whenNotToUse must be a string array`);
  }
  if ("automation" in obj && !AUTOMATION_VALUES.has(obj.automation as string)) {
    problems.push(`${label}.automation must be one of automatic|manual|mixed`);
  }
}

export function validateStackData(raw: unknown, source = "content/stack.json"): void {
  const problems: string[] = [];
  if (typeof raw !== "object" || raw === null) {
    throw new ContentValidationError(source, ["root value must be an object"]);
  }
  const obj = raw as Record<string, unknown>;
  requireFields(
    obj,
    ["schemaVersion", "stackVersion", "name", "updatedAt", "components"],
    "root",
    problems,
  );
  if (!Array.isArray(obj.components)) {
    problems.push("root.components must be an array");
  } else {
    obj.components.forEach((c, i) => validateStackComponent(c, i, problems));
  }
  if (problems.length > 0) {
    throw new ContentValidationError(source, problems);
  }
}

function validateWorkflow(raw: unknown, index: number, problems: string[]): void {
  const label = `workflows[${index}]`;
  if (typeof raw !== "object" || raw === null) {
    problems.push(`${label} must be an object`);
    return;
  }
  const obj = raw as Record<string, unknown>;
  requireFields(
    obj,
    [
      "id",
      "category",
      "title",
      "icon",
      "summary",
      "tags",
      "whenToUse",
      "whenNotToUse",
      "stack",
      "steps",
      "promptTemplate",
      "antiPatterns",
      "related",
      "automation",
    ],
    label,
    problems,
  );
  if ("automation" in obj && !AUTOMATION_VALUES.has(obj.automation as string)) {
    problems.push(`${label}.automation must be one of automatic|manual|mixed`);
  }
  for (const field of [
    "tags",
    "whenToUse",
    "whenNotToUse",
    "stack",
    "steps",
    "antiPatterns",
    "related",
  ]) {
    if (field in obj && !isStringArray(obj[field])) {
      problems.push(`${label}.${field} must be a string array`);
    }
  }
  if ("promptTemplate" in obj && !isString(obj.promptTemplate)) {
    problems.push(`${label}.promptTemplate must be a string`);
  }
}

function validateQuickCommand(raw: unknown, index: number, problems: string[]): void {
  const label = `quickCommands[${index}]`;
  if (typeof raw !== "object" || raw === null) {
    problems.push(`${label} must be an object`);
    return;
  }
  const obj = raw as Record<string, unknown>;
  requireFields(obj, ["id", "label", "command", "purpose", "tags"], label, problems);
  if ("tags" in obj && !isStringArray(obj.tags)) {
    problems.push(`${label}.tags must be a string array`);
  }
}

function validateCategory(raw: unknown, index: number, problems: string[]): void {
  const label = `categories[${index}]`;
  if (typeof raw !== "object" || raw === null) {
    problems.push(`${label} must be an object`);
    return;
  }
  const obj = raw as Record<string, unknown>;
  requireFields(
    obj,
    [
      "id",
      "label",
      "description",
      "connections",
      "icon",
      "image",
      "mapRole",
      "position",
      "next",
      "references",
    ],
    label,
    problems,
  );
  for (const field of ["connections", "next", "references"]) {
    if (field in obj && !isStringArray(obj[field])) {
      problems.push(`${label}.${field} must be a string array`);
    }
  }
  if ("mapRole" in obj && !MAP_ROLE_VALUES.has(obj.mapRole as string)) {
    problems.push(`${label}.mapRole must be one of hub|station|terminal|band`);
  }
  if ("position" in obj && !isPosition(obj.position)) {
    problems.push(`${label}.position must be an object with numeric x and y`);
  }
}

export function validateGuideData(raw: unknown, source = "content/guide-content.json"): void {
  const problems: string[] = [];
  if (typeof raw !== "object" || raw === null) {
    throw new ContentValidationError(source, ["root value must be an object"]);
  }
  const obj = raw as Record<string, unknown>;
  requireFields(
    obj,
    ["schemaVersion", "guideVersion", "updatedAt", "categories", "quickCommands", "workflows"],
    "root",
    problems,
  );
  if (!Array.isArray(obj.categories)) {
    problems.push("root.categories must be an array");
  } else {
    obj.categories.forEach((c, i) => validateCategory(c, i, problems));
  }
  if (!Array.isArray(obj.quickCommands)) {
    problems.push("root.quickCommands must be an array");
  } else {
    obj.quickCommands.forEach((c, i) => validateQuickCommand(c, i, problems));
  }
  if (!Array.isArray(obj.workflows)) {
    problems.push("root.workflows must be an array");
  } else {
    obj.workflows.forEach((w, i) => validateWorkflow(w, i, problems));
  }
  if (problems.length > 0) {
    throw new ContentValidationError(source, problems);
  }
}
