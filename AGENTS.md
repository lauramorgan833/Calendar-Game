# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Calendle is a single-package React + TypeScript frontend app (calendar puzzle game) built with Vite 5 and styled with Tailwind CSS / shadcn/ui. There is no backend service in this repo; cloud stat syncing uses a hosted Supabase instance that works without local setup.

### Commands

All standard commands are in `package.json`:

- **Dev server:** `npm run dev` (Vite on port 3000)
- **Lint:** `npx eslint .` (ESLint 9; pre-existing warnings/errors in the codebase are expected)
- **Build:** `npm run build`
- **Preview:** `npm run preview`

### Notes

- There are no automated tests configured in this codebase (no test runner, no test files).
- The Supabase connection uses a hardcoded hosted URL + anon key in `src/lib/supabase.ts`; no local Supabase or database setup is needed.
- Capacitor config exists for iOS/Android but is not required for web development.
- Vite dev server binds to `::` (all interfaces) on port 3000 with `allowedHosts: true`, so it is accessible from external connections without extra config.
