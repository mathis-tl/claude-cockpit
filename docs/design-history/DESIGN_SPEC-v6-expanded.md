# DESIGN_SPEC.md — Claude Cockpit

Status: CURRENT SOURCE OF TRUTH
Version: 6.0
Purpose: Product interaction + visual design specification

> This file is the only current design source of truth for Claude Cockpit.
> Historical design iterations must live outside this file and must not be used
> as current implementation guidance.

---

# 1. Product definition

Claude Cockpit is not a documentation website and not a generic dashboard.

It is a **visual operating map for using Claude Code well**.

The primary user question is:

> “Where am I in my workflow, what should I do now, and which part of my Claude stack is relevant?”

The interface must help answer that question in seconds.

The product is designed to stay open next to VS Code and be consulted many times
during a working session.

Therefore the priorities are:

1. immediate understanding;
2. spatial orientation;
3. fast access to the right workflow;
4. progressive disclosure;
5. copyable actions and prompts;
6. low visual friction;
7. local editable personal guidance.

---

# 2. Core interaction model

The primary interface is an **interactive spatial workflow map**.

Do not make the homepage primarily:
- a card grid;
- a documentation list;
- a dashboard;
- a large permanent utility panel.

The map is the product.

The initial view shows the Claude workflow as a coherent system.

Major workflow nodes:

- Démarrer / reprendre
- Construire
- Comprendre / debugger
- Rechercher / décider
- Vérifier / reviewer
- Final

Supporting layers:

- Session / contexte
- Stack / sécurité

The supporting layers must be visually secondary to the main workflow.

---

# 3. Workflow topology

The default mental model is:

```text
                        RECHERCHER / DÉCIDER
                                ○
                               / \
                              /   \

DÉMARRER / REPRENDRE  ○ ─── ○ CONSTRUIRE ─── ○ VÉRIFIER / REVIEWER ─── ○ FINAL
                         \        |
                          \       |
                           \      ○
                      COMPRENDRE / DEBUGGER


                 ┌─────────────────────────────┐
                 │      SESSION / CONTEXTE     │
                 └─────────────────────────────┘

                 ───────────────────────────────
                         STACK / SÉCURITÉ
                    underlying support layer
```

This diagram is conceptual, not a requirement for exact coordinates.

The final composition should:
- make the main progression readable;
- show branches and relationships;
- keep support layers visually distinct;
- avoid looking like a generic flowchart editor.

Connections must express meaning rather than decoration.

---

# 4. Hierarchy inside each major node

A major category is not the final level of information.

Example:

```text
COMPRENDRE / DEBUGGER
        |
        ├── Comprendre une zone du code
        |
        └── Debugger un bug
```

The overview map should show major categories first.

Individual workflows appear after focus/selection, or as compact children when
space allows.

Do not show every piece of detailed guidance simultaneously.

Use progressive disclosure.

---

# 5. Focus / zoom interaction

The workflow map should feel spatial and kinetic.

The desired interaction model is:

```text
OVERVIEW
   ↓
select major node
   ↓
FOCUS / CAMERA MOVE
   ↓
show children + relationships
   ↓
select workflow
   ↓
DETAIL VIEW
```

When hovering or focusing a node:

- keep the layout stable;
- emphasize the node;
- emphasize directly connected edges;
- slightly dim unrelated nodes;
- do not make nodes jump upward;
- do not use bouncy movement.

When clicking a major node:

- smoothly move/focus the visual field toward that node;
- optionally increase its visual prominence;
- reveal its child workflows;
- preserve enough surrounding context to remain oriented.

The user must always understand where they are in the overall system.

Provide an obvious way to return to overview.

---

# 6. Motion language

Motion exists to explain structure.

Allowed:
- smooth focus transitions;
- spatial pan/zoom;
- connected-edge highlighting;
- opacity changes;
- gentle node emphasis;
- child-node reveal;
- smooth detail-panel transitions.

Avoid:
- bouncing;
- large hover scaling;
- decorative looping animation;
- springy movement;
- card lift;
- motion that makes text harder to read.

Suggested feel:
- controlled;
- precise;
- cinematic but restrained;
- premium;
- fast enough for repeated daily use.

Respect `prefers-reduced-motion`.

Reduced-motion mode must remain fully usable.

---

# 7. Workflow detail experience

Selecting an individual workflow opens its detailed guidance.

The detail experience should not feel like navigating to a documentation page.

Preferred:
- contextual right drawer;
- focused overlay;
- or spatial detail panel tied to the selected node.

The detail must contain clearly separated sections:

## What it is
Short definition.

## When to use it
Concrete triggers.

## When not to use it
Cases where the workflow is unnecessary.

## Automation
Clearly indicate:

- AUTOMATIC
- MANUAL
- MIXED

This distinction is essential.

## Stack involved
Show only relevant stack components.

## Steps
Short actionable workflow.

## Prompt
Copyable prompt template.

## Commands
Only when manual commands are relevant.

## Anti-patterns
Compact warnings.

## Related workflows
Links back into the spatial map.

## Personal notes
Editable local user layer.

---

# 8. Automatic / manual / mixed

Every stack-related item shown in workflow details should make its mode obvious.

Examples:

Headroom
- AUTOMATIC
- infrastructure below normal Claude CLI usage

Codebase Memory
- MIXED
- Claude may use it when architecture/blast radius matters
- can also be requested explicitly

Agent Reach
- MIXED
- situational external research

tdd-adaptive
- MIXED
- Claude may select it when risk warrants test-first development

verification-loop
- MIXED
- expected near completion of meaningful changes

fresh-code-reviewer
- MANUAL / CONDITIONAL
- independent review for significant risk

SkillSpector
- MANUAL
- before third-party agent infrastructure installation

Graphify
- MANUAL / OCCASIONAL
- visual or multimodal graph only

This information must come from the data model, not be hard-coded into visual
components.

---

# 9. Personal editable guide layer

The Claude usage guidance must be editable directly by the user.

This editability applies to the **usage-guide layer**, not to every internal
technical object.

Editable examples:
- workflow short description;
- personal reminders;
- custom wording;
- notes;
- personal tips;
- optional custom annotation.

The base JSON remains immutable canonical content.

Use a local overlay model:

```text
BASE JSON
   +
PERSONAL OVERLAY
   ↓
RENDERED CONTENT
```

The overlay should support:

- Edit
- Save
- Cancel
- Reset this field
- Reset workflow
- Reset all personal edits
- Export personal edits
- Import personal edits

Storage:
- localStorage is acceptable for V1;
- keep the overlay exportable as JSON;
- do not mutate the base guide JSON from the browser.

Search should include personal notes when practical.

---

# 10. Inline editing behavior

Editing should feel note-like.

Preferred interaction:

```text
Debugger un bug                       ✎

Trouver la root cause avant
de patcher le symptôme.               ✎
```

Clicking edit should turn the field into a simple inline editor.

Avoid building a CMS.

Keep editing lightweight and direct.

---

# 11. General guidance / utilities

General commands and stack rules should exist, but must not dominate the screen.

Do NOT dedicate ~25–30% of the viewport to a permanently open command rail.

Preferred treatments:
- compact utility drawer;
- collapsible floating panel;
- command palette;
- small bottom/side utility tray.

Useful commands include:

- /context
- /compact
- /clear
- /rename
- claude --resume
- claude --continue
- headroom doctor
- headroom perf
- claude-direct

General rules include:

- one session = one coherent objective;
- use Codebase Memory when architecture/blast radius is unclear;
- use Agent Reach when external/current information matters;
- prefer search/reuse before building custom infrastructure;
- use verification-loop before claiming significant completion;
- use fresh-code-reviewer when independent review materially reduces risk;
- use SkillSpector before third-party agent infrastructure installation.

These must be quickly accessible but visually secondary.

---

# 12. Search / command palette

⌘K remains a primary navigation mechanism.

Search across:

- category names;
- workflow names;
- workflow descriptions;
- commands;
- prompts;
- stack component names;
- personal notes when practical.

Selecting a result should navigate/focus directly to the relevant node or detail.

Search must work locally.

---

# 13. Visual direction

The UI is neutral.

The map, motion and illustrations provide personality.

Target palette:

- app canvas: off-white / near-white / very light neutral gray
- surfaces: white
- primary text: near-black
- secondary text: neutral gray
- borders: subtle cool/light gray
- accent: orange for actions and active/focus states

Avoid:
- dark brown cards;
- champagne/beige-dominant UI;
- orange-tinted large surfaces;
- cyan as an interface accent;
- heavy gradients;
- AI-neon aesthetics.

Orange should remain meaningful.

Use orange for:
- primary CTA;
- active selection;
- focus;
- key action state.

Do not use orange decoratively everywhere.

---

# 14. Typography

Use a modern bold sans-serif system.

Preferred stack:
- system / SF-like sans-serif
- clear bold display hierarchy
- readable body text
- monospace only for commands / technical labels

Avoid serif typography in the main product UI.

Hierarchy should come primarily from:
- size;
- weight;
- spacing;
- position.

Not decoration.

---

# 15. Illustration system

Use the supplied **workflow illustration reference sheet** as the visual language
for the major workflow areas.

The six reference concepts are:

1. Démarrer / reprendre
   drafting table / blueprint / tools

2. Session / contexte
   folders / windows / streams

3. Construire
   modular technical machine

4. Comprendre / debugger
   computer/system inspection

5. Rechercher / décider
   branching options / A-B-C comparison

6. Vérifier / reviewer
   checklist / approval / validation

Visual language:
- technical editorial illustration;
- black linework;
- white/light gray objects;
- cyan/turquoise accents inside illustrations;
- coherent isometric/diagrammatic family.

Important:
- cyan belongs to illustrations, not the UI;
- workflow text remains HTML, never baked into image files;
- images should be local assets;
- image paths belong in data;
- illustrations should be replaceable without component rewrites.

The illustrations may appear:
- inside nodes;
- behind focused nodes;
- in detail headers;
- as contextual visual anchors.

Do not put imagery everywhere.

---

# 16. Map visual language

The map should feel like a designed information system, not a React Flow demo.

Avoid:
- generic boxes connected with plain lines;
- identical node sizes;
- obvious "diagram editor" handles;
- excessive labels;
- heavy borders around every block.

Prefer:
- varied spatial hierarchy;
- strong typographic node labels;
- subtle surfaces;
- meaningful connections;
- illustration anchors;
- whitespace;
- visual grouping;
- soft depth;
- selected/focused states.

Supporting layers such as Session/Context and Stack/Security may have distinct
visual treatment to communicate that they operate across the workflow rather
than as a simple sequential step.

---

# 17. Final node

"Final" is a meaningful terminal state, not just a decorative box.

It represents:

```text
VERIFY
   ↓
optional FRESH REVIEW
   ↓
SUMMARY / HANDOFF
   ↓
[STACK] REPORT
```

The Final detail should surface:
- verification status;
- review recommendation;
- remaining uncertainty;
- stack usage footer format.

---

# 18. Responsive behavior

Desktop is primary.

Target use:
- side-by-side with VS Code;
- medium-to-wide desktop windows.

On smaller widths:

- preserve hierarchy;
- allow controlled map pan/zoom where useful;
- or provide a simplified navigable map/list fallback;
- never make core workflows inaccessible.

Do not simply shrink the desktop map until text becomes unreadable.

---

# 19. Accessibility

Required:

- full keyboard navigation;
- visible focus states;
- semantic controls;
- Escape closes overlays/panels;
- reduced-motion support;
- sufficient contrast;
- no information conveyed solely through color;
- map nodes accessible without mouse.

Automation state labels must include text, not color alone.

---

# 20. Data architecture

Preserve the existing data-driven architecture.

Canonical sources remain:

- `content/stack.json`
- `content/guide-content.json`

Extend schemas only where necessary.

Potential additions may include:

```text
category.connections
category.image
category.positionHint
workflow.automation
workflow.image
workflow.mapRole
```

Do not hard-code workflow IDs, labels, stack behavior or images in React
components when they belong in content data.

Personal notes are an overlay, not canonical content.

---

# 21. Stack exports

Preserve:

- JSON export;
- Markdown export;
- ASCII tree;
- transmission block.

The stack view should remain available as a separate utility view.

The workflow map and the stack export are different concepts:

- Workflow map = how to use Claude
- Stack view = what components exist

Do not merge them into one overloaded diagram.

---

# 22. Performance / implementation

The workflow map should remain lightweight.

Prefer:
- CSS transforms;
- SVG connections;
- performant animation primitives;
- minimal dependencies.

Do not add a heavyweight graph framework unless it provides a concrete advantage
for the required kinetic focus/zoom behavior.

Before adding any new graph/animation dependency:
- check whether the current stack can implement the interaction cleanly;
- prefer a small implementation over unnecessary infrastructure.

---

# 23. Home state

On app launch, show:

1. compact top navigation;
2. title / short instruction;
3. interactive workflow map;
4. optional compact favorites/recent indicators;
5. unobtrusive access to general utilities.

Do NOT immediately show:
- long workflow explanations;
- all commands;
- all stack details;
- permanent large side rails.

The map should dominate the viewport.

---

# 24. Interaction success criteria

A user should be able to:

## Scenario A — Debug a bug
Open app
→ click Comprendre / debugger
→ click Debugger un bug
→ immediately see:
  - when to use;
  - CBM relevance;
  - TDD relevance;
  - root-cause workflow;
  - prompt;
  - verification step.

## Scenario B — Resume work
Open app
→ focus Démarrer / reprendre or Session / contexte
→ see whether to resume project vs resume Claude session
→ get exact commands.

## Scenario C — Finish feature
Open app
→ Verify / reviewer
→ verification-loop
→ optional fresh-code-reviewer
→ Final.

## Scenario D — Personal note
Open workflow
→ edit personal note inline
→ save locally
→ export overlay later.

These scenarios should feel faster than finding equivalent information in a text
document.

---

# 25. Design rules that override everything else

When uncertain, apply these rules in order:

1. The workflow map is the primary product.
2. Overview first, detail second.
3. Preserve spatial orientation during focus/zoom.
4. UI stays neutral; illustrations provide most visual color.
5. Orange means action/selection, not decoration.
6. Motion explains structure; it never exists for spectacle.
7. Do not expose documentation walls on the overview.
8. General utilities remain accessible but secondary.
9. Personal guide content is directly editable.
10. The data model remains the source of truth.

---

# 26. Implementation process

Before implementation:

1. inspect the current code;
2. identify which current components can be reused;
3. identify components that encode the wrong layout assumptions;
4. propose the map topology and focus model;
5. propose the smallest required data-schema changes;
6. explain how personal notes remain an overlay.

Do not preserve an existing component merely because it already exists if it
forces the wrong interaction model.

Then implement.

After implementation:

1. build;
2. typecheck;
3. lint if configured;
4. run relevant tests;
5. verify map keyboard navigation;
6. verify reduced-motion mode;
7. verify note save/reset/import/export;
8. verify JSON-driven content remains intact;
9. use `verification-loop`;
10. use `fresh-code-reviewer` if the implementation has significant structural risk.

---

# 27. Final visual/product test

Before declaring the redesign complete, ask:

> If I hide all detail panels, does the remaining screen immediately communicate
> how my Claude workflow is organized?

If no, the map is not doing enough.

Then ask:

> Can I get from “I have a bug” to the right prompt and workflow in a few seconds?

If no, the interaction is too complex.

Finally:

> Does this feel like an operating instrument rather than a documentation site?

If no, simplify.
