# ARCHITECTURE

Canonical responsibilities for React + Tailwind apps. Update only when responsibilities change.

## Safety protocol

Refer to `AGENTS.md` for safety protocol

## Dependency overview

| Name                       | Kind       | Description                 | Dependency |
| -------------------------- | ---------- | --------------------------- | ---------- |
| react, react-dom           | UI         | UI Library                  | runtime    |
| @tanstack/react-query      | API        | UI Server State             | runtime    |
| tailwindcss                | UI         | Utility styling             | dev        |
| @biomejs/biome             | Formatter  | Lint + format               | dev        |
| vitest                     | Tests      | Unit, integration, bench    | dev        |
| @playwright/test           | Tests      | E2E + visual                | dev        |
| vite                       | Builder    | Build + dev server          | dev        |
| @typescript/native-preview | Type-check | Optional fast type checking | dev        |

- ESM only; no CommonJS.
- New runtime dependencies require PR justification (need, size, alternatives).

## Directory layout

The tree below is illustrative; the authoritative rule is module responsibility boundaries.

```tree
.
├── .env                               # Project environment files
├── .editorconfig                      # Editor configuration for consistent formatting across IDEs
├── .gitignore                         # Git ignore file — excludes build, IDE, and temp files
├── .mcp.json                          # MCP configuration (custom project metadata/config)
├── .vscode                            # VS Code configuration folder
│   ├── settings.json                  # Workspace settings
│   ├── mcp.json                       # VS Code MCP integration config
│   └── extensions.json                # Recommended extensions
├── .kilocode                          # Kilocode IDE configuration
│   └── mcp.json                       # Kilocode-specific MCP configuration
├── .roo                               # Roo IDE configuration
│   └── mcp.json                       # Roo-specific MCP configuration
├── .zed                               # Zed editor configuration
│   └── settings.json                  # Zed settings file
├── biome.json                         # Biome (lint + format) configuration
├── AGENTS.md                          # Documentation about agents / AI assistants
├── ARCHITECTURE.md                    # System architecture overview  (used by AI Agents)
├── PROJECT.md                         # Project planning and goals document (used by AI Agents)
├── TODO.md                            # Developer TODO list (used by AI Agents, ignored by .gitignore)
├── README.md                          # Main project documentation and setup guide
├── bun.lock                           # Bun lockfile
├── package.json                       # Project package manifest
├── tsconfig.json                      # TypeScript configuration
├── vite.config.js                     # Vite config (if used)
├── playwright.config.ts               # Playwright config (if used)
├── scripts                            # Common scripts for automation/build/export (if defined in `PROJECT.md` or project files)
│   ├── build.sh                       # Build automation script (e.g., Vite production build); do not edit via agents unless asked by user
│   ├── export.ts                      # Example export utility script
│   └── etc                            # Placeholder for additional script files
├── src                                # Main source directory
│   ├── api                            # Re-usable React Hooks using API calls defined in `Queries` section
│   │   ├── stats.ts                   # React hook for `/api/stats` route (GET, GET/:id, POST, PUT, etc.)
│   │   └── index.ts                   # Barrel export for API hooks
│   ├── assets                         # Static assets directory
│   │   ├── images                     # Project image assets (logos, banners, illustrations, etc.)
│   │   └── icons                      # SVG or icon components/assets
│   ├── components                     # Components directory
│   │   ├── Button                     # Example component directory (button?!)
│   │   │   ├── Button.tsx             # Button component implementation
│   │   │   ├── index.ts               # Barrel export file
│   │   │   └── Button.test.tsx        # Unit test for Button component
│   │   └── Layout                     # Entire page layout component
│   ├── contexts                       # Re-usable React contexts
│   │   ├── ThemeContext.tsx           # Provides theme (light/dark mode) management
│   │   ├── AuthContext.tsx            # Provides authentication state and user session logic
│   │   ├── UserContext.tsx            # Provides user profile and preference data
│   │   └── index.ts                   # Barrel export for all contexts
│   ├── helpers                        # Helpers directory
│   │   ├── formatDate.ts              # Example date formatting helper
│   │   ├── formatDate.test.ts         # Example date formatting helper
│   │   ├── calculateTotal.ts          # Example calculation helper
│   │   ├── calculateTotal.test.ts     # Example calculation helper
│   │   └── index.ts                   # Barrel export for helpers
│   ├── hooks                          # Commonly used React hooks directory
│   │   ├── useAuth.ts                 # Custom hook for authentication (login, logout, token, etc.)
│   │   ├── useOnline.ts               # Custom hook to detect user's online/offline status
│   │   └── index.ts                   # Barrel export for custom hooks
│   ├── pages                          # Pages directory
│   │   └── Home                       # Example page directory (main page?!)
│   │       ├── Home.tsx               # Home page implementation
│   │       ├── index.ts               # Barrel export file
│   │       └── Home.test.tsx          # Unit test for Home page
│   ├── types                          # Source-scoped reusable types (used internally in src)
│   │   ├── api.d.ts                   # API request/response interfaces
│   │   ├── user.d.ts                  # User-related interfaces and models
│   │   └── index.d.ts                 # Shared app-level types
│   └── utils                          # Utils directory
│       ├── logger.ts                  # Example logger utility
│       ├── fetcher.ts                 # Example API fetcher utility
│       └── index.ts                   # Barrel export for utils
├── types                              # Global ambient type declarations (not bundled in src)
│   ├── env.d.ts                       # Type declarations for environment variables (ignored by .gitignore)
│   └── process.d.ts                   # Extended NodeJS.Process or global typing
├── tailwind.config.js                 # Tailwind CSS configuration
├── tests                              # Tests directory
│   ├── coverage                       # Coverage directory
│   ├── e2e/                           # Playwright specs
│   │   └── __screenshots__/           # visual goldens (managed by tests)
│   └── unit/                          # optional central unit tests (colocation also allowed)
├── dist/                              # Vite build output folder (ignored by .gitignore)
└── node_modules/                      # Installed dependencies (ignored by .gitignore)
```

## Core commands

In addition to `AGENTS.md` commands.

Project `package.json` MUST expose scripts:

- `e2e-test` - UI E2E/visual tests running

(or document exact fallbacks in `PROJECT.md`).

Default to Bun instead of Node.js.

- UI E2E/visual: `bun run e2e-test`

### Naming & placement

- Components: PascalCase directories/files (`Component/Component.tsx`).
- Tests: `*.test.ts[x]` colocated with source or under `tests/unit`.

## Primitives & policies

- [Local UI](#dependency-overview) state in components (`useState`/`useReducer`).
- All network I/O in `src/api/**` via a centralized `src/utils/fetcher.ts`.
- No [UI Library](#dependency-overview) or I/O inside `src/utils/**` and `src/helpers/**`.

## Module responsibilities

- `src/api`: Typed API Query hooks; invalidation; error normalization; **no UI**. See [UI Server State](#dependency-overview).
- `src/components`: Presentational; compose hooks; no direct `fetch`.
- `src/pages`: Route shells; orchestrate components + data hooks.
- `src/hooks`: Reusable client logic (no fetch side effects).
- `src/utils` / `src/helpers`: Pure functions; no [UI Library](#dependency-overview) or I/O; fully unit‑tested.

## TypeScript config

- ESM‑only; recommended:

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "target": "ES2022",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

Use imports like `import { foo } from "@/utils/foo"` to avoid brittle relative paths.

## Data & flow

- Fetch via src/api using [UI Server State](#dependency-overview) (typed responses, see [UI Server State](#dependency-overview)).
- Fetcher centralizes base URL, headers, error mapping.
- Components subscribe to hooks; mutations invalidate relevant caches.

## Styling & tokens

- Map design tokens → [Utility styling](#dependency-overview). Theme (colors, spacing, typography).
- Components must reference [Utility styling](#dependency-overview) theme/classes; avoid raw design values.
- Global styles limited to resets and [Utility styling](#dependency-overview) layers.

## Error handling & logging

- API errors normalized in `fetcher.ts`; hooks return `{ data, error, isLoading }`.
- UI: friendly error states; detailed logs only in dev.

## Performance & a11y budgets (advisory)

- Initial route JS ≤ 200KB gzip (unless CI specifies otherwise).
- Avoid layout shift; intrinsic sizes; [Utility styling](#dependency-overview) utilities.
- A11y: semantic landmarks, labeled controls, visible keyboard focus.

## Testing

Follow `PROJECT.md` for the chosen [unit test runner](#dependency-overview).

Just run `bun run test` script to ensure all tests are pass.

[E2E & visuals](#dependency-overview):

- Visual goldens: `tests/e2e/__screenshots__/`
- Stabilize screenshots: prefer config-level defaults (`expect.toHaveScreenshot`), and use style injection to hide volatile elements when needed unless overridden in `PROJECT.md`
- Update snapshots only for intentional visual changes and include diffs in proof
- Snapshots in `tests/e2e/__screenshots__/`

## CI & gates

- Typecheck, lint/format, unit/integration, coverage (if configured).
- If UI changed: Playwright E2E + visual snapshots against a preview build must pass.

## Change policy

- Do not change this file's structure or the directory layout without team approval.
