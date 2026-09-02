# Claude Cockpit — Build Task

Build the application described by the files already present in this repository.

Before editing anything:

1. read `PROJECT_SPEC.md`;
2. read project `CLAUDE.md`;
3. inspect `content/stack.json`, `content/guide-content.json`, and the JSON schemas;
4. understand the desired information architecture and maintenance model;
5. use the `frontend-design` skill if it is relevant;
6. propose a concise implementation plan.

Then implement the project end-to-end.

Important constraints:

- This is a local, data-driven reference cockpit for everyday Claude Code usage.
- The UI must not hard-code the stack or guide content when that content belongs in JSON.
- The application must remain easy to update when the Claude stack changes.
- No backend, database, authentication, analytics, telemetry, or external runtime API calls.
- Prefer Vite + React + TypeScript with minimal dependencies.
- Do not add a UI framework unless there is a strong concrete reason.
- Preserve a fast static build that can run locally.
- Implement search, keyboard navigation, copy/export, favorites, progressive disclosure, and responsive behavior.
- Export the current stack as JSON and as a human-readable Markdown/text schema generated from `content/stack.json`.
- Add validation/tests appropriate to the project.
- Do not blindly implement every feature at once if a smaller coherent architecture is better; however, complete all acceptance criteria from `PROJECT_SPEC.md` before declaring the task done.
- Use the repository's data schemas as contracts.
- If you discover a better implementation detail that keeps the same product behavior and maintenance goals, choose it and explain the decision.
- Do not ask me to restate requirements already present in these files.

After implementation:

1. run the project's relevant build/type/lint/test checks;
2. use `verification-loop` for the final engineering quality gate;
3. if the change is substantial enough, use `fresh-code-reviewer` for an independent final review;
4. fix material findings;
5. give me the run command and a concise architecture summary.

Do not modify my global Claude configuration.
