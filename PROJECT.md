# PROJECT

Scooter App: Figma → React + Tailwind

## Overrides (this file wins)

### Allowed paths (additions)

- `figma-assets.manifest.json`
- `DRAFTS/` (if used for work tracking)

### Secrets / tokens

- Prefer Figma MCP tools for asset export.
- REST API fallback requires explicit human-provided token via environment (not by reading `/.env.mcp`).

## Task

Convert Figma designs to React (TypeScript) + Tailwind CSS.

## Core commands

In addition to `AGENTS.md` and `ARCHITECTURE.md` commands.

Project `package.json` MUST expose scripts:

- `figma:export` - Export assets from Figma based on manifest
- `figma:export:dry` - Preview asset exports without downloading

(or document exact fallbacks in `PROJECT.md`).

Default to Bun instead of Node.js.

- Figma assets export: `bun run --no-env-file figma:export` (dry: `bun run --no-env-file figma:export:dry`)
  - `figma:export` is bulk-writing → approval-gated unless explicitly requested.

## Security Guardrails

- Follow `AGENTS.md` and `ARCHITECTURE.md` for all environment/secrets rules (including `--no-env-file`, approval gating, and “never read .env\*”).
- This file only adds project-specific command expectations (e.g., `figma:export`, `figma:export:dry`) and architectural boundaries.

## Testing framework (project override)

This project uses **Vitest** for unit/integration tests.

- Unit tests should use Vitest APIs (e.g. `import { describe, it, expect } from 'vitest'`)
- `bun run test` must execute Vitest (via package.json script)
- Benchmarking (if used) uses Vitest bench

## Design source

Figma file: "Веб-инвест макеты" (title: "веб инвест")

- Mobile: "Макеты моб" (node-id `13:996`)
- Desktop: "Макеты ПК" (node-id `13:995`)

Access:

- Primary: `figma` MCP tools
- Fallback: Figma REST API (token must be provided explicitly via environment by a human; agents must not read `.env*`)

- Exclude: iPhone wireframe (presentation only)

## Styling

- Tailwind CSS for all styling
- Extract Figma tokens → `tailwind.config.js`
- Match design exactly (colors, typography, spacing)
- No hardcoded values in components

## Layout

- React only (no Next.js)
- Component-based structure
- Local state: `React.useState` / `useReducer`
- Single responsive codebase:
  - Mobile matches "Макеты моб"
  - Desktop matches "Макеты ПК"

## API Integration

- TanStack React Query for all data
- Centralized API fetcher defined at [ARCHITECTURE](./ARCHITECTURE.md)
- No fetch in components

## Data & flow

### React Query conventions (required)

#### QueryClient ownership

- The app must create a single `QueryClient` instance in one place (e.g., `src/app/queryClient.ts` or `src/main.tsx`) and provide it via `QueryClientProvider`.
- Do not create per-page QueryClients.

#### Query key conventions

- Use stable, serializable keys:
  - `['resource']`
  - `['resource', { ...params }]`
- Do not embed functions, class instances, Dates, or non-serializable values in query keys.

#### Defaults (recommended)

- Prefer conservative retries:
  - Queries (GET): retry a small number of times for transient failures.
  - Mutations (non-idempotent): no/low retry unless explicitly safe.
- Set `staleTime` intentionally for each domain to avoid refetch thrash.

#### Error normalization contract

- All network errors must be normalized by the centralized API fetcher into a consistent shape.
- API hooks should expose `{ data, error, isLoading }` and must not leak raw `fetch`/`Response` objects to UI.

## Assets

**Workflow:**

```bash
# Via MCP (preferred)
# MCP tools export to src/assets/ and update manifest

# Via script (automated)
bun run --no-env-file figma:export          # Export all
bun run --no-env-file figma:export:dry      # Preview only
```

Assets: Icons, images, logo, backgrounds → `src/assets/`
Manifest: `figma-assets.manifest.json` maps nodes → paths
Formats: SVG, PNG, WebP (multi-scale, optional Sharp conversion)

## Definition of Done

- Figma parity (mobile + desktop, exclude iPhone wireframe)
- All assets in `src/assets/`
- Tailwind theme has design tokens
- React Query for data (no fetch in components)
- All AGENTS.md DoD gates ✅
- Screenshots/diffs attached (if UI)

## Visual tolerance

Default: `threshold: 0.2` for Playwright screenshots

## Risks

- MCP unavailable → use REST fallback with `.env.mcp` with a token explicitly provided via environment by a human (agents must not read `.env*`)
- Asset export fails → check token/permissions, run `bun run figma:export:dry` to verify, then retry export
