# Repository Guidelines

## Project Overview

Civ6 (Gathering Storm) district adjacency puzzle lab. Single-page React app (Vite) for learning/placing district adjacency bonuses, validating placement rules, and brute-forcing optimal layouts. Standard rules only (no civ/leader abilities, policies, or building multipliers). UI and docs are in Japanese.

## Architecture & Data Flow

- Entry: `index.html` → `src/main.jsx` → `src/App.jsx` (default export `App`).
- `src/App.jsx` is a ~1000-line monolith: data definitions (`TERRAIN`, `FEATURES`, `EXTRAS`, `DISTRICTS`, `SCORED`, etc.), hex geometry, river graph (`buildRivers`), rule engine (`checkDistrict`, `validateAll`), scoring (`scoreAt`, `allScores`), solver (`optimize`), 5 puzzle templates, and the entire UI.
- State: local `useState` only (no store/context/router). `mode` (`sandbox`/`puzzle`), `map`/`rivers` (sandbox), `answer` (puzzle placements), `brush`, `ghost` (solver preview), etc.
- Derived via `useMemo`: `activeMap`, `rv` (river graph), `scores`, `invalid`, `best` (puzzle optimum). Tile shape `{ t, f, x, d, pop? }` = terrain/feature/extra/district; `tileOf()` merges with `BLANK`.
- Board: axial hex `(q,r)`, radius 3 (37 tiles). River edges are `ekey(a,b)` strings grouped into connected components via union-find.
- Mutations are immutable spreads; `withDistrict()` strips removable extras/features on district placement.
- UI primitives: `src/components/ui/button.jsx`, `src/components/ui/card.jsx` (minimal Tailwind wrappers).
- Styling: Tailwind v4 utility-first, dark slate theme; board rendered as inline SVG.

## Key Directories

- `src/` — app source. `App.jsx` (all logic/UI), `main.jsx` (entry), `index.css` (`@import "tailwindcss";`), `components/ui/` (Button, Card), `assets/` (empty/unused).
- `public/` — static assets copied verbatim (`favicon.svg` used; `icons.svg` unused dead sprite).
- `.github/workflows/` — `deploy.yml` (GitHub Pages).
- Root configs: `vite.config.js`, `package.json`, `.oxlintrc.json`, `.gitignore`, `index.html`.
- `skills/` — Civ6 rule reference (`civ6lib`, `hex-grid-spatial`); reference-only, not imported by the app.

## Development Commands

```bash
npm install          # install (CI uses npm ci)
npm run dev          # Vite dev server
npm run build        # production build → dist/
npm run preview      # serve dist/
npm run lint         # oxlint
```

- Runtime: Node 20.x (CI `node-version: 20`); Vite 8 engine floor `^20.19.0 || >=22.12.0` — ensure recent Node locally. `import.meta.dirname` in `vite.config.js` needs Node ≥20.11.
- Package manager: npm only. Do not add yarn/pnpm lockfiles.
- Path alias: `@` → `src/` (defined in `vite.config.js`; no `jsconfig.json`).
- Tailwind v4 via Vite plugin (CSS-first; no `tailwind.config.js`).

## Code Conventions & Common Patterns

- Language: JavaScript/JSX, no TypeScript. React 19. ESM (`"type": "module"`).
- Components: PascalCase files for components (`App.jsx`), lowercase for ui primitives (`button.jsx`). Default export for `App`; named exports for ui.
- Constants: `SCREAMING_SNAKE_CASE` (`TERRAIN`, `EDGES`, `TOOL_TABS`). Helpers: camelCase (`tileOf`, `checkDistrict`). Domain ids in English; UI strings/comments in Japanese.
- Section banners: `/* ==== ... ==== */` (Japanese) to delimit modules within `App.jsx`.
- React patterns: `useMemo` for derives; no `useCallback`, no memoized components, no custom hooks/context. State atoms are local.
- Pure rule functions (`checkDistrict`, `scoreAt`, `optimize`) take `(map, rv, ...)` and are UI-agnostic — good test targets.
- No JSDoc/`@param`; no TODO/FIXME markers.

## Important Files

- `src/App.jsx` — entire app logic + UI.
- `src/main.jsx` — root render with `StrictMode`.
- `src/index.css` — Tailwind entry.
- `vite.config.js` — `base: './'`, plugins, `@` alias.
- `.oxlintrc.json` — react + oxc plugins; `rules-of-hooks: error`; `only-export-components: warn` (`allowConstantExport: true`).
- `.github/workflows/deploy.yml` — Pages build/deploy on `main`/`master` push.
- `index.html` — `lang="ja"`, entry `/src/main.jsx`. Note: `href="/favicon.svg"` is root-absolute and may 404 under a Pages project subpath.
- `README.md` — authoritative game-rule spec (adjacency tables, placement rules, templates, sources). Has a stale dir tree and a stray `EOF\necho done` artifact at EOF.

## Runtime/Tooling Preferences

- Node 20.x (see CI). Lint via oxlint (`npm run lint`); no formatter, no typecheck, no test runner configured.
- Tailwind v4 CSS-first; no config file.
- GitHub Pages: relative `base: './'` so any repo name works; set Pages Source to GitHub Actions.

## Testing & QA

- **No tests exist.** No test framework, config, or `test` script; CI only builds. Verification is `npm run build` + `npm run lint`.
- Natural fit if adding tests: Vitest (Vite-native) in `vite.config.js`. High-value pure targets: `scoreAt`, `checkDistrict`, `optimize`, `buildRivers`, and the 6 templates.