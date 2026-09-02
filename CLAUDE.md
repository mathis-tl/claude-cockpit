# Claude Cockpit Project Rules

## Product

This repository is the local source of truth for Claude Cockpit.

The product is an intention-first daily guide for using Claude Code effectively.
It should answer "what am I trying to do?" before exposing internal tool names.

## Architecture

Keep product knowledge data-driven.

- Stack facts belong in `content/stack.json`.
- Guide cards, prompts, commands and decision paths belong in `content/guide-content.json`.
- JSON contracts belong in `schemas/`.
- UI components render these sources; do not duplicate their content in component code.

Prefer a static frontend architecture:
- Vite
- React
- TypeScript
- CSS
- no backend
- no runtime network dependency
- minimal packages

## Data maintenance

The app must tolerate future additions/removals of:
- skills;
- agents;
- MCPs;
- infrastructure tools;
- workflows;
- guide scenarios.

Do not require component rewrites for ordinary content changes.

## Privacy

Everything runs locally.
Do not add analytics, telemetry, authentication, remote persistence, or third-party runtime APIs.

## Validation

For significant changes:
- build;
- typecheck;
- lint when configured;
- tests when relevant;
- inspect final diff;
- preserve data-schema compatibility.

## Scope control

Do not add features outside `PROJECT_SPEC.md` unless required to satisfy an acceptance criterion.

## Design source of truth

For all UI/UX work, `DESIGN_SPEC.md` is the only current design source of truth.

Files under `docs/design-history/` are historical records only.
Do not use historical design files as current implementation instructions.

When current UI conflicts with `DESIGN_SPEC.md`, follow `DESIGN_SPEC.md`.