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

- Figma assets export: `bun run figma:export` (dry: `bun run figma:export:dry`)

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
- Centralized fetcher in `src/utils/fetcher.ts`
- No fetch in components

## Assets

**Workflow:**

```bash
# Via MCP (preferred)
# MCP tools export to src/assets/ and update manifest

# Via script (automated)
bun run figma:export          # Export all
bun run figma:export:dry      # Preview only
```

Assets: Icons, images, logo, backgrounds → `src/assets/`
Manifest: `figma-assets.manifest.json` maps nodes → paths
Formats: SVG, PNG, WebP (multi-scale, optional Sharp conversion)

## Execution checklist

```bash
# 1. Baseline
bun install
bun run check-types
bun run lint
bun run test

# 2. Tokens
# Extract via MCP → update tailwind.config.js

# 3. Assets
bun run figma:export:dry
bun run figma:export

# 4. Implement
# Mobile-first, then desktop variants

# 5. Verify
bun run test
bun run build
bun run preview
bun run e2e-test  # If UI changed
```

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
