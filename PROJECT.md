# PROJECT

Scooter App: Figma → React + Tailwind

## Task

Convert Figma designs to React (TypeScript) + Tailwind CSS.

## Core commands

In addition to `AGENTS.md` and `ARCHITECTURE.md` commands.

Project `package.json` MUST expose scripts:

- `figma:export` - Export assets from Figma based on manifest
- `figma:export:dry` - Preview asset exports without downloading

(or document exact fallbacks in `PROJECT.md`).

Default to Bun instead of Node.js.

- Figma assets: `bun run figma:export` (dry: `DRY_RUN=1 bun run figma:export`)

## Design source

Figma file: "Веб-инвест макеты" (title: "веб инвест")

- Mobile: "Макеты моб" (node-id `13-996`)
- Desktop: "Макеты ПК" (node-id `13-995`)

Access:

- Primary: `figma` MCP tools
- Fallback: Figma REST API (token in `/.env.mcp`)

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
bun run check-types && bun run lint && bun run test

# 2. Tokens
# Extract via MCP → update tailwind.config.js

# 3. Assets
bun run figma:export:dry
bun run figma:export

# 4. Implement
# Mobile-first, then desktop variants

# 5. Verify
bun run test
bun run build && bun run preview
bunx run e2e-test  # If UI changed
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

- MCP unavailable → use REST fallback with `.env.mcp`
- Asset export fails → check token/permissions, try dry run
