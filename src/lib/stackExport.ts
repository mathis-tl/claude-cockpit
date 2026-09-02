import type { StackData, StackComponent } from "../content/types";

export function exportStackAsJson(stack: StackData): string {
  return JSON.stringify(stack, null, 2);
}

function listLine(label: string, items: string[] | undefined): string | null {
  if (!items || items.length === 0) return null;
  return `  - ${label}: ${items.join("; ")}`;
}

export function exportStackAsMarkdown(stack: StackData): string {
  const lines: string[] = [];
  lines.push(`# ${stack.name}`);
  lines.push("");
  lines.push(`Version: \`${stack.stackVersion}\` — Updated: \`${stack.updatedAt}\``);
  lines.push("");

  if (stack.principles?.length) {
    lines.push("## Principles");
    lines.push("");
    for (const principle of stack.principles) lines.push(`- ${principle}`);
    lines.push("");
  }

  if (stack.defaultWorkflow?.length) {
    lines.push("## Default workflow");
    lines.push("");
    lines.push(stack.defaultWorkflow.join(" -> "));
    lines.push("");
  }

  const grouped = groupByKind(stack.components);
  lines.push("## Components");
  lines.push("");
  for (const [kind, components] of grouped) {
    lines.push(`### ${kind}`);
    lines.push("");
    for (const c of components) {
      lines.push(`- **${c.name}** (\`${c.id}\`) — ${c.status}, scope: ${c.scope}`);
      lines.push(`  ${c.role}`);
      const whenToUse = listLine("When to use", c.whenToUse);
      if (whenToUse) lines.push(whenToUse);
      const whenNotToUse = listLine("When not to use", c.whenNotToUse);
      if (whenNotToUse) lines.push(whenNotToUse);
      if (c.configPath) lines.push(`  - Config: \`${c.configPath}\``);
      if (c.command) lines.push(`  - Command: \`${c.command}\``);
      if (c.commands?.length) lines.push(`  - Commands: ${c.commands.map((cmd) => `\`${cmd}\``).join(", ")}`);
      lines.push("");
    }
  }

  return lines.join("\n").trimEnd() + "\n";
}

function groupByKind(components: StackComponent[]): [string, StackComponent[]][] {
  const map = new Map<string, StackComponent[]>();
  for (const c of components) {
    const bucket = map.get(c.kind) ?? [];
    bucket.push(c);
    map.set(c.kind, bucket);
  }
  return [...map.entries()];
}

export function exportStackAsAsciiTree(stack: StackData): string {
  const lines: string[] = [];
  lines.push(`${stack.name} (v${stack.stackVersion})`);
  const grouped = groupByKind(stack.components);
  grouped.forEach(([kind, components], groupIndex) => {
    const isLastGroup = groupIndex === grouped.length - 1;
    lines.push(`${isLastGroup ? "└─" : "├─"} ${kind}`);
    const groupPrefix = isLastGroup ? "   " : "│  ";
    components.forEach((c, i) => {
      const isLastItem = i === components.length - 1;
      lines.push(`${groupPrefix}${isLastItem ? "└─" : "├─"} ${c.name} [${c.status}]`);
    });
  });
  return lines.join("\n");
}

export function exportStackAsTransmission(stack: StackData): string {
  const lines: string[] = [];
  lines.push(`STACK ${stack.name} v${stack.stackVersion} (${stack.updatedAt})`);
  for (const c of stack.components) {
    lines.push(`- ${c.id}: ${c.kind}, ${c.status}, ${c.role}`);
  }
  if (stack.stackFooter?.format) {
    lines.push("");
    lines.push(stack.stackFooter.format);
  }
  return lines.join("\n");
}

export function stackSnapshotFilename(stack: StackData): string {
  return `claude-stack-${stack.updatedAt}-v${stack.stackVersion}.json`;
}
