import type { Category, Workflow } from "../content/types";

export type OverlayScope = "categories" | "workflows";

export interface CategoryOverride {
  description?: string;
  notes?: string;
}

export interface WorkflowOverride {
  summary?: string;
  notes?: string;
}

export interface NotesOverlay {
  version: 1;
  categories: Record<string, CategoryOverride>;
  workflows: Record<string, WorkflowOverride>;
}

export const EMPTY_OVERLAY: NotesOverlay = { version: 1, categories: {}, workflows: {} };

export class OverlayParseError extends Error {
  constructor(reason: string) {
    super(`Invalid notes overlay: ${reason}`);
    this.name = "OverlayParseError";
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function sanitizeOverrideMap<T>(raw: unknown, allowedFields: string[]): Record<string, T> {
  if (!isPlainObject(raw)) return {};
  const result: Record<string, T> = {};
  for (const [id, entry] of Object.entries(raw)) {
    if (!isPlainObject(entry)) continue;
    const clean: Record<string, string> = {};
    let hasField = false;
    for (const field of allowedFields) {
      const value = entry[field];
      if (typeof value === "string" && value.length > 0) {
        clean[field] = value;
        hasField = true;
      }
    }
    if (hasField) result[id] = clean as T;
  }
  return result;
}

/** Parses and sanitizes an imported overlay payload. Unknown/malformed entries are dropped rather than throwing, except for a non-object root. */
export function parseOverlay(raw: string): NotesOverlay {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new OverlayParseError("not valid JSON");
  }
  if (!isPlainObject(parsed)) {
    throw new OverlayParseError("root value must be an object");
  }
  return {
    version: 1,
    categories: sanitizeOverrideMap<CategoryOverride>(parsed.categories, ["description", "notes"]),
    workflows: sanitizeOverrideMap<WorkflowOverride>(parsed.workflows, ["summary", "notes"]),
  };
}

export function serializeOverlay(overlay: NotesOverlay): string {
  return JSON.stringify(overlay, null, 2);
}

export function overlayFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `claude-cockpit-notes-${date}.json`;
}

export function mergeCategory(category: Category, override: CategoryOverride | undefined): Category {
  if (!override?.description) return category;
  return { ...category, description: override.description };
}

export function mergeWorkflow(workflow: Workflow, override: WorkflowOverride | undefined): Workflow {
  if (!override?.summary) return workflow;
  return { ...workflow, summary: override.summary };
}
