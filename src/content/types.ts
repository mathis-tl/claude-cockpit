export type Automation = "automatic" | "manual" | "mixed";

export interface StackComponent {
  id: string;
  name: string;
  kind: string;
  status: string;
  scope: string;
  role: string;
  whenToUse: string[];
  whenNotToUse: string[];
  automation: Automation;
  configPath?: string;
  command?: string;
  commands?: string[];
  notes?: string[];
}

export interface StackData {
  schemaVersion: number;
  stackVersion: string;
  name: string;
  updatedAt: string;
  principles: string[];
  defaultWorkflow: string[];
  components: StackComponent[];
  stackFooter?: { format: string };
}

/** Visual weight of a map node. Drives node size, surface and label scale. */
export type MapRole = "hub" | "station" | "terminal" | "band";

/** Centre of a node in map world coordinates (see lib/mapLayout.ts). */
export interface MapPosition {
  x: number;
  y: number;
}

export interface Category {
  id: string;
  label: string;
  description: string;
  /** Structural relationships, undirected. Rendered as light connectors. */
  connections: string[];
  icon: string;
  image: string;
  mapRole: MapRole;
  position: MapPosition;
  /** Directional progression along the spine. Rendered with an arrowhead. */
  next: string[];
  /** Workflow ids surfaced by a category that owns none of its own. */
  references: string[];
}

export interface QuickCommand {
  id: string;
  label: string;
  command: string;
  purpose: string;
  tags: string[];
}

export interface Workflow {
  id: string;
  category: string;
  title: string;
  icon: string;
  summary: string;
  tags: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  stack: string[];
  steps: string[];
  promptTemplate: string;
  antiPatterns: string[];
  related: string[];
  automation: Automation;
  featured?: boolean;
}

export interface GuideData {
  schemaVersion: number;
  guideVersion: string;
  updatedAt: string;
  categories: Category[];
  quickCommands: QuickCommand[];
  workflows: Workflow[];
}
