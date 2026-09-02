# Claude Cockpit

A local, intention-first daily guide for using Claude Code effectively. See `PROJECT_SPEC.md` for the full product/UX contract.

Static Vite + React + TypeScript app. No backend, no analytics, no runtime network calls — everything is read from `content/*.json` at build time and favorites/recent items are kept in `localStorage`.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`).

## Build

```bash
npm run build    # typecheck + production build into dist/
npm run preview  # serve the production build locally
```

## Validate

```bash
npm run typecheck
npm run lint
npm run test
```

Core content (`content/stack.json`, `content/guide-content.json`) is validated against the contracts in `schemas/` at load time (see `src/content/validate.ts`). Malformed data throws immediately in development instead of rendering silently.

## Updating the stack or guide content

The UI never hard-codes stack or workflow content — everything renders from `content/stack.json` and `content/guide-content.json`. See `docs/MAINTENANCE.md` for the exact update checklist (bump version, update `updatedAt`, note the change in `CHANGELOG.md`, re-run validation).

## Key interactions

- `⌘K` / `Ctrl+K` — open the command palette to search workflows, quick commands and stack components.
- Home — pick an intention card, grouped by category; favorites and recently opened workflows surface in a rail above the grid.
- Workflow detail — progressive disclosure via collapsible sections (steps, prompt, stack, anti-patterns); prompts and commands are one-click copyable.
- Stack — inspect every component (role, status, scope, when to use/avoid) and export the stack as JSON, Markdown, an ASCII tree, or a compact transmission block for another session; download a timestamped snapshot.
- Repères (quick reference) — session/context commands (`/compact`, `/clear`, `/context`, …) with one-click copy.

## Architecture

```
content/            source-of-truth JSON (stack + guide)
schemas/             JSON Schema contracts for that content
src/content/         typed loader + runtime validation
src/lib/             pure functions: search ranking, stack exports, clipboard
src/hooks/           localStorage-backed favorites/recent, hash-based routing
src/components/      InstrumentBar, CommandPalette, Home, WorkflowDetail,
                     StackInspector, QuickReference
```
