# AGENTS

General-purpose, reusable engineering playbook for any repo.

## Read order & precedence

Read in this order:

1. this file
2. `ARCHITECTURE.md` (if present)
3. `PROJECT.md` (if present)

Precedence: `PROJECT.md` > `ARCHITECTURE.md` > `AGENTS.md`

## Safety protocol

### What counts as approval

Approval must be explicit in the conversation. If an action is listed as "Needs approval", do not perform it unless the user clearly approves it.

- Allowed actions (approval not required):
  - Read
  - Search
  - Analyze
  - Verify
  - Web search tools

- Allowed commands (approval not required):
  - `grep`, `glob`, `ls`
  - Dry-run commands
  - Check-only tasks: `check-types`, `lint`, `test`, `build`
  - Read-only git: `git status`, `git diff`, `git log`, `git show`, `git blame`
  - Project-wise Git-tracked local edits (only within Allowed paths)

- Needs approval (CI / state-change risks):
  - Git operations that modify repo local state (e.g. `git add`, `git reset`, `git checkout`)
  - Dependency graph mutations (`bun install`, `bun add/remove/upgrade`, lockfile changes)
  - Commands that modify tracked files outside Allowed paths
  - Migrations, codegen that writes tracked files, or any destructive ops

- Never allowed commands:
  - Git operations that modify repo remote state (e.g. `git commit`, `git push`, `git merge`, `git rebase`)
  - Unsafe and danger commands (e.g. `sudo`, `sudo su`, `sudo rm -rf /`)
  - Unverified binary or shell executable

## Security Guardrails

- Do not read `.env*` files as an agent.
- When running **Bun** commands as an agent, default to `--no-env-file` to prevent automatic `.env` loading.
  - Only allow env-file loading when the task explicitly requires it and approval is granted.
- `bun install`, `bun add/remove/upgrade`, and any dependency graph mutation require explicit approval.
- If you must allow install in an agent workflow, use `bun install --frozen-lockfile --ignore-scripts`.
- Never modify VS Code settings, AI settings, allowlists, denylists, or any files under `.vscode` or `~/.config`.
- Never run denied commands that change repo state or project state.
- Prefer file **tools** (`read_file`/`search_files`/`apply_diff`/`write_to_file`) over terminal commands for file inspection and edits.
- **No chaining** in terminal commands (`;`, `&&`, `||`).
- Pipes (`|`) are allowed only for read-only inspection (e.g. `git diff | head -n 50`).
- **No redirects/heredocs** in terminal commands when running as an agent; use file tools for writes.
- Run commands separately for deterministic logs.
- Do not use find with `-exec`/`-execdir`/`-ok`/`-delete`.
- If a task requires anything outside these rules, stop and ask the user for explicit confirmation.

## Operating principles

- Small plan, fast proof: Execute the smallest viable plan that can be verified quickly.
- Predict before act: Classify the task, inventory risks, choose the right playbook.
- Gather context (bounded): Explore repo + recent git history first; expand only if needed.
- Deterministic & idempotent: Non-interactive, repeatable commands; safe retries.
- Evidence first: Every change ships with objective proof (commands, outputs, screenshots if UI).
- Fail fast, recover clean: Keep artifacts; revert noisy diffs; restart smaller.

## Task loop (always)

Intake -> Explore -> Plan -> Execute -> Verify -> Report.

**Execute** and **Verify** requires [safety protocol](#safety-protocol).

### Intake → write a task card (inline)

```yaml
TASK:
  type: [feature|bugfix|refactor|setup]
  goal: "<one sentence>"
  files: ["likely/targeted paths"]
  constraints: ["allowed_paths only", "no secrets", "non-interactive cmds"]
  success_signals:
    ["tests green", "lint/typecheck pass", "no new console errors"]
  risk: [low|medium|high] # medium+ requires approval
```

### Explore (repo-first)

Always:

- Read local context: `ARCHITECTURE.md`, `PROJECT.md`, `DRAFTS/*.md` if present.
- use file tools to read these if present.
- Review recent history for files you’ll edit:
  - `git log -n 3 --pretty=format:"%h %ad %an %s" --date=short -- <path>`
  - `git show <hash> -- <path>` as needed
  - `git blame -L <start>,<end> -- <path>` if touching tricky lines

Sometimes (only if needed):

- Snapshot env: read `package.json` and `tsconfig.json` via file tools if they exist.

### Plan (minimal, executable, with fallback)

#### Fast loop (pre-PR)

```yaml
PLAN:
  approach: "<primary strategy>"
  fallback: "<alternative if primary fails>"
  steps:
    - "Baseline checks: types, lint, unit"
    - "Small diff in allowed paths (list exact files)"
    - "Re-run checks; collect proof"
  commands:
    # Requires approval if deps are not already installed / cache not present:
    - bun install --frozen-lockfile --ignore-scripts
    - bun run --no-env-file check-types
    - bun run --no-env-file lint # Targeted tests only
    - bun run --no-env-file test
```

#### Full loop (DoD)

```yaml
PLAN:
  approach: "<primary strategy>"
  fallback: "<alternative if primary fails>"
  steps:
    - "Baseline checks: types, lint, unit"
    - "Small diff in allowed paths (list exact files)"
    - "Re-run checks; collect proof"
  commands:
    # Requires approval if deps are not already installed / cache not present:
    - bun install --frozen-lockfile --ignore-scripts
    - bun run --no-env-file check-types
    - bun run --no-env-file lint # Full test suite
    - bun run --no-env-file test
    - bun run --no-env-file build
```

Rules: prefer small diffs; dry runs first when available; safeguard destructive operations.

### Execute (deterministic edits)

- Stay inside Allowed paths. No destructive ops without approval.
- Never touch `.env*`, `.git*`, secrets, or prod data.
- ESM only (no CommonJS).
- Create/modify files via file tools (`write_to_file` / `apply_diff`) to avoid shell redirections and ensure deterministic diffs.

### Verify (all applicable checks)

- Typecheck must pass
- Lint/format must pass
- Unit/integration must pass
- Build must pass
- If UI changed: Playwright E2E + visual (default screenshot threshold `0.2`)
- No new runtime console errors/warnings in changed areas
- Coverage ≥ thresholds (if configured)

### Report (attach proof)

```yaml
PROOF:
  commands:
    - "bun run test"   → exit 0
    - "bun run build"  → exit 0
  outputs:
    - "All tests passed"
    - "Build completed"
  screenshots: ["before.png", "after.png"]  # if UI changed
  intent: "What/why/where; known tradeoffs"
```

## Test runner policy (important)

- Default recommendation: Bun’s built-in test runner (`bun test` and imports from `bun:test`) for speed and fewer dependencies.
- Project override: if `PROJECT.md` specifies Vitest (or another runner), follow it:
  - use that runner’s import APIs in tests
  - ensure `bun run test` (package.json) executes the configured runner

## Core commands

Defaults; Projects may override in `PROJECT.md`.

Project `package.json` MUST expose scripts:

- `check-types` - Type check, code type correctness
- `lint` - Linting, code quality or feedback from codebase
- `test` - Unit/integration tests running
- `bench` - Benchmark
- `dev` - Start a development server
- `build` - Build a project
- `preview` - Start a preview of build folder

(or document exact fallbacks in `PROJECT.md`).

Default to Bun instead of Node.js.

- Initial deps installation (requires approval): `bun install --frozen-lockfile --ignore-scripts`
- Install new deps (requires approval): `bun install`
- Type check: `bun run check-types`
- Lint & format: `bun run lint` (auto-fix: add `--write`)
- Unit/integration tests: `bun run test`
- Benchmark: `bun run bench`
- Dev server: `bun run dev`
- Build: `bun run build`
- Preview: `bun run preview`
- Run file: `bun <file>`

Also follow below requirements:

- Bun can auto-load `.env` files by default; in agent-mode prefer `--no-env-file` unless explicitly needed.
- In agent workflows, default to `bun run --no-env-file` unless the task explicitly requires env-file loading and approval is granted.
- Install new deps: if deps already installed, skip; otherwise request approval to run `bun install`.

### Fallback commands

When scripts are missing and you cannot add them

- Typecheck (preferred): `bunx --no-install tsgo -p tsconfig.json --noEmit`
  - Fallback (if `tsgo` unavailable): `bunx --no-install tsc -p tsconfig.json --noEmit`

- Lint/format: `bunx --no-install @biomejs/biome check .` (auto-fix: add `--write`)
- Unit/integration tests:
  - If PROJECT uses `bun:test`: `bun test`
  - If PROJECT uses Vitest: `bunx --no-install vitest run`
- E2E/visual: `bunx --no-install playwright test`
- Benchmark:
  - If PROJECT uses Vitest: `bunx --no-install vitest bench`

## Definition of Done (DoD)

1. Green checks
   - No new console errors/warnings in changed areas
   - JSDoc for any new/changed public API
   - Types OK
   - Lint/format pass.
   - Unit/integration pass.
   - Benchmark pass.
   - Coverage ≥ thresholds (if configured)
   - Build succeeds
2. If UI changed: E2E + visual pass (default threshold `0.2`)
3. Scope: edits stay in Allowed paths
4. Proof: run summary/PR includes commands + outputs and screenshots/diffs (if UI)

## Allowed paths

Defaults; Projects may override in `PROJECT.md`.

- Allowed:
  - `src/`
  - `tests/`
  - `DRAFTS/`
  - `tailwind.config.js`
  - `vite.config.js`
  - `package.json` (scripts & devDeps only)
  - `biome.json`
  - `tsconfig*.json`
  - `playwright.config.*`

- Needs approval (CI risks):
  - `.github/workflows/`

- Never:
  - `.roo/`
  - `.kilocode/`
  - `.zed/`
  - `dist/`
  - `scripts/` (unless `PROJECT.md` explicitly allows)

## Coding standards

Defaults; Projects may override in `PROJECT.md`.

- TypeScript STRICT; ESM only.
- Small components; pure functions; custom hooks.
- Single source of truth—no duplicates.
- JSDoc for new/changed public APIs.
- Minimize new deps; runtime dep additions require PR rationale (need, size, alternatives).
- No `// @ts-ignore` or `// @ts-expect-error` without a one-line justification.
- Prefer `context7` (MCP/tools) for doc lookups if available; otherwise local/official docs.

### Git hygiene & local history

- Before edits, review the last 3 changes for any file you touch.
- Small, atomic commits; meaningful messages (Conventional Commits preferred).
- Push via PRs; never commit secrets.

## Coding style

Defaults; Projects may override in `PROJECT.md`.

- Formatting via [`biome.json`](./biome.json)
- TS config extends [`tsconfig.json`](./tsconfig.json)

## Testing

Defaults; Projects may override in `PROJECT.md`.

- Unit/integration (`bun run test`)
  - If using bun:test: `import { describe, it, expect } from 'bun:test'`
  - If using Vitest (project-defined): `import { describe, it, expect } from 'vitest'`

## CI gates (required)

- Typecheck must pass
- Lint/format must pass
- Unit/integration must pass
- Coverage (if configured) must pass

## Security & secrets

- Never read `.env*`, `.gitignore`d files, or any sensitive files listed above.
- Never commit secrets/credentials.
- No destructive commands or prod DB migrations without explicit approval.
- No production data in tests (use fixtures/factories).

## Benchmarks (when requested / perf-critical)

- Use a lightweight micro-benchmark (e.g., Vitest bench) as a devDependency
- Record results in `DRAFTS/BENCHMARK.md`

## Risk tiers & recovery

- Low: file edits, running tests → proceed
- Medium: dependency bumps, build/CI workflow changes → require approval
- High: destructive ops, secrets, protected paths → prohibited without explicit approval

If plans drift or fixes lack a failing test:

1. Stop & narrow scope.
2. Keep artifacts.
3. Revert noise.
4. Restart smaller.

## Files to keep updated

- `DRAFTS/TODO.md` - sub-tasks & state
- `DRAFTS/FAILED.md` - unresolved failures
- `DRAFTS/BENCHMARK.md` - perf results (if any)
