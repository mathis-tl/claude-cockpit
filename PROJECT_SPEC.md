# Claude Cockpit — Product & Technical Specification

## 1. Purpose

Claude Cockpit is a small local desktop-oriented web application kept open next to VS Code.

It is not a long-form manual. It is an **intention-first decision interface** for answering:

- What am I trying to do with Claude Code?
- How should I phrase the request?
- Which workflow should Claude follow?
- When are Codebase Memory, Agent Reach, Skills, subagents, TDD, verification, or a fresh review useful?
- What command should I use for session/context management?
- What should I avoid?
- What is my current Claude stack?

The detailed Markdown/TXT guide may exist as a backup, but the cockpit is the primary daily interface.

## 2. Product principles

1. Intent before tools.
2. Progressive disclosure.
3. Copy over memorization.
4. Data-driven maintenance.
5. Local-first.
6. Lean.

## 3. Preferred implementation

- Vite
- React
- TypeScript
- plain CSS or a small internal design system
- local JSON content imported at build time
- localStorage only for UI preferences/favorites/recent items

No backend, database, authentication, analytics, telemetry, remote CMS, runtime API calls, or large UI framework unless strongly justified.

### Native macOS packaging

The Vite/React app remains the single source of truth. A native macOS `.app`
is produced by wrapping the same static build in Tauri (`src-tauri/`) — no
Electron/Chromium bundling, no separate codebase, no backend added. The
wrapper only provides a native window and app bundle around the existing
frontend; the web app must keep working standalone (`npm run dev` /
`npm run build` + `npm run preview`).

## 4. Main information architecture

### Home — "Où en es-tu ?"

The home screen is an interactive workflow map, not a documentation list. A
central diagram (`WorkflowMap`) shows the product's intention categories as
clickable blocks connected by lines that reflect how the work actually flows
between them:
- Démarrer / reprendre
- Construire
- Comprendre / debugger
- Rechercher / décider
- Vérifier / reviewer
- Session / contexte (supporting)
- Stack / sécurité (supporting)
- Final (synthetic terminal node — closes the loop into verification/review)

Category-to-category connections are content-driven (`category.connections` in
`content/guide-content.json`), not hardcoded in the component. Hovering or
selecting a block highlights it and its directly connected neighbors.

Also:
- a compact side rail (session commands, general principles, notes-overlay
  export/import/reset) instead of a full-height sidebar;
- a slim top nav (brand, Workflows/Repères/Stack links, `⌘K` trigger);
- global search / command palette (`⌘K`), which also matches categories;
- favorites and recent workflows as a compact optional row above the map.

Clicking a block opens a right-side detail panel over the home screen rather
than replacing it with a full navigation flow (`#/category/:id`,
`#/workflow/:id`, and `#/final` stay deep-linkable).

### Block detail panel

Clicking a category block opens its description and the list of workflows it
contains. Clicking a workflow (from the category panel, search, or a related
chip) opens its full detail:
- one-line purpose;
- when to use;
- when not to use;
- recommended steps;
- suggested stack components, each tagged automatic/manual/mixed based on
  `stack.json`'s `automation` field;
- prompt template;
- deeper explanation;
- anti-patterns;
- related workflows;
- an editable personal note (see §7).

The synthetic "Final" node summarizes what closes out a task (verification,
independent review, the `[STACK]` footer format) by referencing existing
`verify-work`/`fresh-review` workflow content rather than duplicating it.

### Stack

Dedicated stack inspector:
- current version;
- updated date;
- components grouped by type;
- role;
- status;
- when to use;
- when not to use;
- local path/config when relevant.

Actions:
- Copy stack as JSON
- Copy stack as Markdown
- Copy stack as ASCII tree
- Download/export stack snapshot
- Copy a compact "stack transmission" block for another AI/session

All exports are generated from `content/stack.json`.

### Quick reference

Include:
- `/compact`
- `/clear`
- `/context`
- `/rename`
- `claude --resume`
- `claude --continue`
- Plan Mode
- `headroom doctor`
- `headroom perf`
- relevant diagnostics

## 5. Search

`⌘K` opens a local search/command palette.

Search:
- workflow titles;
- descriptions;
- tags;
- prompt content;
- commands;
- stack component names.

## 6. Favorites and recent workflows

Persist favorite IDs, recent workflow IDs, and optional UI preferences in localStorage.

## 7. Editing and future updates

Personal notes: users can override a category's description or a workflow's
summary/notes from the detail panel (Edit/Save/Cancel/Reset). This is a local
`localStorage` overlay merged over the base content at render time — it never
modifies `content/*.json`. The side rail offers export/import/reset for the
whole overlay.

Normal maintenance path (base content):

```text
edit JSON
-> validate
-> app renders updated content
```

Adding a skill should usually require only:
1. edit `content/stack.json`;
2. update relevant workflow cards if daily behavior changes;
3. update version/date/changelog;
4. build/test.

## 8. Stack exports

Required:
- canonical JSON;
- human-readable Markdown;
- ASCII tree;
- compact transmission block.

Copy in one click. Where possible, download a timestamped snapshot.

## 9. Visual direction

Desktop-first for side-by-side use with VS Code.

Desired:
- premium, bold, Apple-like product feel — not a documentation page;
- focused;
- utilitarian but polished;
- calm;
- warm blond/champagne canvas, near-black ink — never pure black or pure white;
- bold modern sans-serif for all UI text; monospace reserved for commands/labels;
- a small hero band of premium "portal" cards for the most important workflows,
  list-based rows for everything else — not a card grid throughout;
- accent color (Claude brand terracotta) restrained to focus states, ticks,
  marks, and small CTAs — not decorative;
- strong typographic hierarchy;
- high information density without clutter;
- clean cards with hairline borders and subtle shadows (no heavy shadows,
  no flat/shadowless-only treatment);
- restrained animation.

Avoid:
- AI-neon clichés;
- excessive glassmorphism;
- heavy/omnipresent gradients;
- oversized full-bleed marketing hero sections (the portal band stays compact);
- generic admin-dashboard appearance;
- streaming-service pastiche (the hero band borrows rhythm/energy only).

See `DESIGN_SPEC.md` (repository root) for the current design source of truth. It supersedes this section wherever the two disagree.

The home screen should be useful within 2 seconds.

## 10. Accessibility

- keyboard navigable;
- visible focus;
- semantic controls;
- good contrast;
- reduced motion respected;
- search usable without mouse.

## 11. Data integrity

Validate content against JSON schemas at development/build time or provide equivalent typed validation.

Malformed core data should fail loudly in development.

## 12. Testing expectations

At minimum test:
- search relevance;
- favorites persistence;
- valid JSON export;
- Markdown/ASCII export from stack data;
- exact prompt copy behavior;
- invalid core data handling if validation is implemented.

Do not test trivial CSS.

## 13. Acceptance criteria

V1 is complete when:
- documented install/run starts the app;
- home is intention-first;
- every initial workflow is discoverable;
- `⌘K` works;
- details are progressively disclosed;
- prompts/commands are copyable;
- favorites persist;
- quick reference exists;
- stack inspector exists;
- JSON/Markdown/ASCII/transmission exports work;
- content is data-driven;
- no runtime external API is needed;
- build succeeds;
- relevant tests pass;
- README explains future stack/content updates.
