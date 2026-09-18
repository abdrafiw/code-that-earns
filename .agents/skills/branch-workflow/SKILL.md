---
name: branch-workflow
description: Enforce this repository's branch-per-change Git workflow whenever implementing or committing a feature, fix, refactor, documentation update, or other file change; skip read-only reviews and explanations.
---

# Branch Workflow

Keep `main` deployable and use one dedicated branch for each coherent change.

## Before editing

- Inspect the working tree and current branch before modifying files.
- If the requested work already has a clearly matching task branch, continue on it.
- Otherwise, start from a clean local `main` and create a new branch before editing. Do not carry unrelated changes into the new branch.
- If `main` contains uncommitted work, do not stash, discard, or relocate it without the user's direction.

Use a short, descriptive branch name with the appropriate prefix:

- `feat/<scope>` for product functionality.
- `fix/<scope>` for defects.
- `refactor/<scope>` for behavior-preserving restructuring.
- `docs/<scope>` for documentation-only work.
- `chore/<scope>` for tooling, configuration, or maintenance.

## Commit and push boundaries

- Never commit feature or update work directly to `main`.
- Run `npm run build` after the final file change and before every commit. Commit only when that build succeeds.
- If the build fails, fix the failure and rerun it. Do not bypass, skip, or defer this gate unless the user explicitly directs otherwise after seeing the limitation.
- Run lint and relevant tests in proportion to the change, but they do not replace the required pre-commit build.
- Keep commits focused on the branch's stated scope and use Conventional Commit messages.
- Do not mix unrelated working-tree changes into a commit. Preserve user-owned changes and report them when they affect the task.
- Push the task branch only when the user requests a push. Never push these changes directly to `main`.
- Report the branch name and resulting commit hashes when handing work back.

Read-only inspection, explanation, diagnosis, and planning do not require a branch when no repository files will change.
