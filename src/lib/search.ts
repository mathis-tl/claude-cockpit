import type { Category, GuideData, StackComponent, Workflow } from "../content/types";
import { EMPTY_OVERLAY, type NotesOverlay } from "./notesOverlay";

export interface SearchResult {
  kind: "workflow" | "command" | "stack" | "category";
  id: string;
  title: string;
  subtitle: string;
  score: number;
  /** True when the query matched something the user wrote, not the base content. */
  fromNotes?: boolean;
}

const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;

function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS_PATTERN, "");
}

/** Substring relevance: earlier + shorter-field matches score higher. Field weights
 * reflect how strongly a match there signals user intent (title beats prompt body). */
function fieldScore(query: string, field: string | undefined, weight: number): number {
  if (!field) return 0;
  const normField = normalize(field);
  const index = normField.indexOf(query);
  if (index === -1) return 0;
  const positionBonus = index === 0 ? 1.5 : 1;
  const lengthPenalty = 1 / Math.sqrt(normField.length + 1);
  return weight * positionBonus * (1 + lengthPenalty);
}

function scoreWorkflow(query: string, workflow: Workflow): number {
  return (
    fieldScore(query, workflow.title, 10) +
    fieldScore(query, workflow.summary, 4) +
    workflow.tags.reduce((acc, tag) => acc + fieldScore(query, tag, 6), 0) +
    fieldScore(query, workflow.promptTemplate, 1) +
    workflow.steps.reduce((acc, step) => acc + fieldScore(query, step, 1), 0)
  );
}

function scoreCategory(query: string, category: Category): number {
  return fieldScore(query, category.label, 9) + fieldScore(query, category.description, 4);
}

function scoreStackComponent(query: string, component: StackComponent): number {
  return (
    fieldScore(query, component.name, 10) +
    fieldScore(query, component.role, 4) +
    fieldScore(query, component.kind, 3) +
    fieldScore(query, component.command, 2)
  );
}

/**
 * Personal text is worth finding: a note is something you chose to write, so a
 * match there ranks just under a title match and is flagged in the result.
 */
function scoreNotes(query: string, override: { notes?: string } | undefined): number {
  return fieldScore(query, override?.notes, 8);
}

export function searchGuide(
  guide: GuideData,
  stackComponents: StackComponent[],
  rawQuery: string,
  overlay: NotesOverlay = EMPTY_OVERLAY,
): SearchResult[] {
  const query = normalize(rawQuery.trim());
  if (!query) return [];

  const results: SearchResult[] = [];

  for (const category of guide.categories) {
    const override = overlay.categories[category.id];
    const description = override?.description ?? category.description;
    const base = scoreCategory(query, { ...category, description });
    const notes = scoreNotes(query, override);
    if (base + notes > 0) {
      results.push({
        kind: "category",
        id: category.id,
        title: category.label,
        subtitle: description,
        score: base + notes,
        fromNotes: base === 0,
      });
    }
  }

  for (const workflow of guide.workflows) {
    const override = overlay.workflows[workflow.id];
    const summary = override?.summary ?? workflow.summary;
    const base = scoreWorkflow(query, { ...workflow, summary });
    const notes = scoreNotes(query, override);
    if (base + notes > 0) {
      results.push({
        kind: "workflow",
        id: workflow.id,
        title: workflow.title,
        subtitle: summary,
        score: base + notes,
        fromNotes: base === 0,
      });
    }
  }

  for (const command of guide.quickCommands) {
    const score =
      fieldScore(query, command.label, 8) +
      fieldScore(query, command.command, 8) +
      fieldScore(query, command.purpose, 3) +
      command.tags.reduce((acc, tag) => acc + fieldScore(query, tag, 5), 0);
    if (score > 0) {
      results.push({
        kind: "command",
        id: command.id,
        title: command.label,
        subtitle: command.purpose,
        score,
      });
    }
  }

  for (const component of stackComponents) {
    const score = scoreStackComponent(query, component);
    if (score > 0) {
      results.push({
        kind: "stack",
        id: component.id,
        title: component.name,
        subtitle: component.role,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
