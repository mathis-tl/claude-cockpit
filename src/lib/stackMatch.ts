import type { StackComponent } from "../content/types";

export interface MatchedStackItem {
  text: string;
  component?: StackComponent;
}

/** Best-effort link from a workflow's free-text stack line (e.g. "tdd-adaptive si risqué")
 * back to its structured stack.json component, so the UI can show an automation badge
 * without requiring workflow.stack to be restructured into component ids. */
export function matchStackItems(items: string[], components: StackComponent[]): MatchedStackItem[] {
  return items.map((text) => {
    const normalized = text.toLowerCase();
    let best: StackComponent | undefined;
    for (const component of components) {
      const name = component.name.toLowerCase();
      if (normalized.includes(name) && (!best || name.length > best.name.length)) {
        best = component;
      }
    }
    return { text, component: best };
  });
}
