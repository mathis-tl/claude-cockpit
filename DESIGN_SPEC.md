# DESIGN_SPEC.md — Claude Cockpit

Status: CURRENT SOURCE OF TRUTH
Version: 6.0

> This file is the only active design specification.
> Historical design files are archive material only and must not influence implementation.

## 1. Product

Claude Cockpit is a **visual operating map for using Claude Code well**.

It is not:
- a documentation site;
- a card dashboard;
- a generic flowchart editor.

It must answer quickly:

> Where am I in my workflow, what should I do now, and which part of my Claude stack matters?

The app is designed to stay open next to VS Code and be consulted repeatedly.

Priorities:
1. immediate understanding;
2. spatial orientation;
3. fast action;
4. progressive disclosure;
5. editable personal guidance.

## 2. Primary interaction

The homepage is dominated by an **interactive spatial workflow map**.

Main nodes:
- Démarrer / reprendre
- Construire
- Comprendre / debugger
- Rechercher / décider
- Vérifier / reviewer
- Final

Supporting layers:
- Session / contexte
- Stack / sécurité

Supporting layers are visually secondary and should feel transversal rather than like ordinary sequential steps.

Conceptual topology:

```text
                     RECHERCHER / DÉCIDER
                              ○
                             / \
                            /   \

DÉMARRER ○ ─────── ○ CONSTRUIRE ─────── ○ VÉRIFIER ─────── ○ FINAL
              \           |
               \          |
                \         ○
             COMPRENDRE / DEBUGGER

         ┌───────────────────────────────┐
         │       SESSION / CONTEXTE      │
         └───────────────────────────────┘

         ─────────── STACK / SÉCURITÉ ───────────
```

Exact coordinates are not prescribed.
Connections must communicate meaning, not decoration.

## 3. Drill-down hierarchy

Major category first, individual workflow second.

Example:

```text
COMPRENDRE / DEBUGGER
├── Comprendre une zone du code
└── Debugger un bug
```

Overview must not expose all detailed text.

Interaction:

```text
OVERVIEW
→ select category
→ smooth spatial focus
→ reveal child workflows
→ select workflow
→ detail view
```

Always preserve orientation and provide an obvious return to overview.

## 4. Kinetic motion

Motion explains structure.

Allowed:
- smooth pan/focus;
- controlled zoom;
- edge highlighting;
- opacity changes;
- child reveal;
- detail transition.

Hover/focus:
- emphasize selected node and direct neighbors;
- dim unrelated nodes slightly;
- keep layout stable.

Never:
- bounce;
- jump cards upward;
- large hover scale;
- decorative loops;
- excessive spring motion.

Respect `prefers-reduced-motion`.

## 5. Workflow details

Selecting a workflow opens a contextual drawer/overlay/spatial detail panel.

Show:

- What it is
- When to use
- When not to use
- Automatic / Manual / Mixed
- Relevant stack components
- Steps
- Prompt
- Commands when relevant
- Anti-patterns
- Related workflows
- Personal notes

Do not turn this into a long documentation page.

## 6. Automatic / manual / mixed

Automation mode must be visually explicit and data-driven.

Current mental model:

- Headroom → AUTOMATIC
- Codebase Memory → MIXED
- Agent Reach → MIXED
- tdd-adaptive → MIXED
- verification-loop → MIXED
- fresh-code-reviewer → MANUAL / CONDITIONAL
- SkillSpector → MANUAL
- Graphify → MANUAL / OCCASIONAL

Do not hard-code these labels inside visual components.

## 7. Editable personal guide layer

The Claude usage-guide content must be editable directly in the app.

Editable:
- short descriptions;
- personal reminders;
- custom wording;
- personal notes.

Do not make the entire product a CMS.

Architecture:

```text
BASE JSON + PERSONAL LOCAL OVERLAY → RENDERED CONTENT
```

Base content remains canonical and immutable.

V1 overlay:
- localStorage;
- exportable/importable JSON.

Actions:
- Edit
- Save
- Cancel
- Reset field/workflow
- Reset all
- Export
- Import

Editing should feel note-like and preferably inline.

## 8. Utilities

General commands and rules remain accessible but do NOT occupy a permanent large side rail.

Use:
- compact utility drawer;
- collapsible tray;
- command palette;
- small secondary panel.

Useful commands:
- /context
- /compact
- /clear
- /rename
- claude --resume
- claude --continue
- headroom doctor
- headroom perf
- claude-direct

General rules:
- one session = one coherent objective;
- CBM when architecture/blast radius is unclear;
- Reach when current external information matters;
- verify meaningful changes;
- fresh review when risk justifies it;
- SkillSpector before third-party agent infrastructure.

## 9. Search

⌘K remains primary navigation.

Search:
- categories;
- workflows;
- descriptions;
- prompts;
- commands;
- stack components;
- personal notes when practical.

Selecting a result should focus/open the corresponding map object directly.

## 10. Visual language

UI stays neutral.

Palette direction:
- canvas: near-white / very light neutral gray;
- surfaces: white;
- primary text: near-black;
- secondary: neutral gray;
- borders: subtle light gray;
- orange: CTA, focus, selection, active state only.

Avoid:
- dark brown cards;
- champagne/beige-dominant UI;
- orange-tinted large surfaces;
- cyan UI accents;
- heavy gradients;
- AI-neon aesthetics.

Typography:
- modern bold sans-serif;
- SF/system-like;
- mono only for commands/technical labels;
- no serif in the main product UI.

## 11. Illustration system

Use the supplied **workflow illustration reference sheet** as the art direction.

Six concepts:
1. Démarrer / reprendre — drafting table / blueprint
2. Session / contexte — folders / windows / streams
3. Construire — modular technical machine
4. Comprendre / debugger — computer/system inspection
5. Rechercher / décider — branching options / A-B-C comparison
6. Vérifier / reviewer — checklist / approval

Style:
- technical editorial;
- black linework;
- white/light gray objects;
- cyan/turquoise inside illustrations only;
- coherent isometric/diagrammatic family.

Rules:
- cyan belongs to illustrations, not UI chrome;
- text stays HTML, never baked into image files;
- assets are local;
- image references live in data;
- illustrations remain replaceable without component rewrites.

## 12. Map design

The map must look like a designed information system, not a generic React Flow canvas.

Avoid:
- identical rectangles connected by plain lines;
- editor handles;
- equal node weights;
- heavy borders everywhere.

Prefer:
- varied spatial hierarchy;
- whitespace;
- meaningful grouping;
- strong typography;
- subtle surfaces;
- illustration anchors;
- soft depth;
- clear selected/focused states.

The map must dominate the viewport.

## 13. Final node

Final represents:

```text
VERIFY
→ optional FRESH REVIEW
→ SUMMARY / HANDOFF
→ [STACK] REPORT
```

It is a meaningful terminal state, not decoration.

## 14. Data architecture

Preserve:
- `content/stack.json`
- `content/guide-content.json`
- search
- favorites
- recents
- stack exports
- local-first behavior

Extend schemas only when necessary.

Possible fields:
- category.connections
- category.image
- category.positionHint
- workflow.automation
- workflow.image
- workflow.mapRole

Personal edits are overlay data, not canonical guide content.

Do not hard-code workflow IDs, labels, stack behavior or assets in React components.

## 15. Stack vs workflow map

Keep them separate:

- Workflow map = how to use Claude
- Stack view = which components exist

Preserve stack exports:
- JSON
- Markdown
- ASCII
- transmission block

## 16. Responsive + accessibility

Desktop first, optimized beside VS Code.

On smaller widths:
- use controlled pan/zoom or a simplified navigable fallback;
- never shrink the map until labels become unreadable.

Required:
- keyboard navigation;
- visible focus;
- Escape closes overlays;
- reduced-motion support;
- sufficient contrast;
- automation states include text, not color only.

## 17. Implementation constraints

Keep the map lightweight.

Prefer:
- SVG connections;
- CSS transforms;
- performant native/browser animation;
- minimal dependencies.

Do not add a heavyweight graph framework unless it provides a clear advantage for the required spatial focus/zoom behavior.

Before adding any dependency, prefer reuse and the smallest maintainable implementation.

## 18. Home

Initial screen:

1. compact top nav;
2. short title/instruction;
3. interactive workflow map;
4. optional compact favorites/recent indicators;
5. unobtrusive utilities access.

Do NOT show immediately:
- long explanations;
- all commands;
- full stack data;
- large permanent utility rails.

## 19. Success scenarios

### Debug
Open → Comprendre/debugger → Debugger un bug → see root-cause flow, CBM/TDD relevance, prompt, verification.

### Resume
Open → Démarrer/reprendre or Session/contexte → distinguish project resume from Claude session resume → get exact command.

### Finish feature
Open → Vérifier/reviewer → verification-loop → optional fresh-code-reviewer → Final.

### Personal note
Open workflow → edit note inline → save locally → export overlay.

These must be faster than searching a text manual.

## 20. Override rules

When uncertain, follow these in order:

1. The workflow map is the product.
2. Overview first, detail second.
3. Preserve spatial orientation.
4. UI neutral; illustrations provide most color.
5. Orange means action/selection, not decoration.
6. Motion explains structure, never spectacle.
7. No documentation walls on overview.
8. Utilities stay accessible but secondary.
9. Usage guidance is directly editable.
10. Data remains source of truth.

## 21. Implementation process

Before coding:

1. inspect current components;
2. identify reusable logic;
3. identify layout assumptions that must be removed;
4. propose final topology/focus behavior;
5. propose minimal schema changes;
6. explain personal overlay implementation.

Do not preserve old components if they enforce the wrong UX.

Then implement.

After:
- build;
- typecheck;
- lint if configured;
- tests;
- keyboard map check;
- reduced-motion check;
- notes save/reset/import/export check;
- data-driven architecture check;
- `verification-loop`;
- `fresh-code-reviewer` if structural risk warrants it.

## 22. Final test

Before declaring complete:

> If all detail panels are hidden, does the screen immediately communicate how the Claude workflow is organized?

> Can I get from “I have a bug” to the right workflow and prompt in a few seconds?

> Does this feel like an operating instrument rather than a documentation site?

If any answer is no, simplify.
