# AGENTS

General-purpose, reusable engineering playbook for any repo.

## Read order & precedence

Read in this order:

1. this file
2. `ARCHITECTURE.md` (if present)
3. `PROJECT.md` (if present)

Precedence: `PROJECT.md` > `ARCHITECTURE.md` > `AGENTS.md`

## Safety protocol

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
  - Project-wise Git-tracked local edits

- Needs approval (CI risks):

  - Git operations (e.g. `git add`, `git commit`, `git push`, `git reset`)
  - Execute operations
  - Modify configs, install packages, run migrations

- Never allowed commands:

  - Unsafe and danger commands (e.g. `sudo`, `sudo su`, `sudo rm -rf /`)
  - Unverified binary or shell executable

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
- Review recent history for files you’ll edit:

  - `git log -n 3 --pretty=format:"%h %ad %an %s" --date=short -- <path>`
  - `git show <hash> -- <path>` as needed
  - `git blame -L <start>,<end> -- <path>` if touching tricky lines

Sometimes (only if needed):

- Snapshot env: `cat package.json tsconfig.json 2>/dev/null || true`

### Plan (minimal, executable, with fallback)

```yaml
PLAN:
  approach: "<primary strategy>"
  fallback: "<alternative if primary fails>"
  steps:
    - "Baseline checks: types, lint, unit"
    - "Small diff in allowed paths (list exact files)"
    - "Re-run checks; collect proof"
  commands:
    - "bun install"
    - "bun run check-types && bun run lint && bun run test"
```

Rules: prefer small diffs; dry runs first when available; `set -euo pipefail` and `&&` chains.

### Execute (deterministic edits)

- Stay inside Allowed paths. No destructive ops without approval.
- Never touch `.env*`, `.git*`, secrets, or prod data.
- ESM only (no CommonJS).
- Create files deterministically:

```bash
mkdir -p path/to && cat <<'EOF' > path/to/file.ts
// content
EOF
```

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

- Install deps: `bun install`
- Type check: `bun run check-types`
- Lint & format: `bun run lint` (auto-fix: add `--write`)
- Unit/integration tests: `bun run test`
- Benchmark: `bun run bench`
- Dev server: `bun run dev`
- Build: `bun run build`
- Preview: `bun run preview`
- Run file: `bun <file>`
- Run script: `bun run <script>`

> Bun auto-loads `.env` -> do NOT add `dotenv`

### Fallback commands

When scripts are missing and you cannot add them

- Typecheck (preferred): `bunx tsgo -p tsconfig.json --noEmit`
  - Fallback (if `tsgo` unavailable): `bunx tsc -p tsconfig.json --noEmit`
- Lint/format: `bunx @biomejs/biome check .` (auto-fix: add `--write`)
- Unit/integration tests: `bunx vitest run`
- E2E/visual: `bunx playwright test`
- Benchmark: `bunx vitest bench`

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
  - Example: `import { describe, it, expect } from 'bun:test'`

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
