import type { Automation, Category, GuideData, Workflow } from "../content/types";

/** Short label for an automation state. Text, never colour alone. */
export const AUTOMATION_LABEL: Record<Automation, string> = {
  automatic: "automatique",
  manual: "manuel",
  mixed: "mixte",
};

export function workflowsByIds(guide: GuideData, ids: string[]): Workflow[] {
  return ids
    .map((id) => guide.workflows.find((w) => w.id === id))
    .filter((w): w is Workflow => Boolean(w));
}

export function categoryById(guide: GuideData, id: string): Category | undefined {
  return guide.categories.find((c) => c.id === id);
}

/**
 * Workflows revealed when a category is entered.
 *
 * A category normally owns its workflows. One that owns none — the terminal —
 * surfaces the workflows it references instead, so the map never opens onto an
 * empty node and no component needs to know which category that is.
 */
export function categoryChildren(guide: GuideData, categoryId: string): Workflow[] {
  const own = guide.workflows.filter((w) => w.category === categoryId);
  if (own.length > 0) return own;
  const category = categoryById(guide, categoryId);
  return category ? workflowsByIds(guide, category.references) : [];
}
