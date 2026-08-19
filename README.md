# Pathwise

A decision-analysis app for working through big life decisions — the kind with no obviously right answer. Create a scenario, describe your situation and constraints, weigh options against your priorities, get an AI-generated analysis per option, and track how your thinking changes over time through versioned reflections.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v3, custom design tokens (see `src/styles/globals.css`)
- **Data & state:** TanStack Query, Zustand, React Hook Form + Zod
- **Routing:** React Router v8 (library mode)
- **Backend:** Supabase (Postgres, Auth, Row Level Security, Edge Functions)
- **AI:** OpenRouter (model-agnostic — swappable without touching the schema)

## Project structure

## Project structure

**`src/app/`** — router, providers (auth/query), layouts

**`src/components/ui/`** — shared primitives (Button, Input, Label)

**`src/features/auth/`** — sign in / sign up

**`src/features/dashboard/`** — scenario list

**`src/features/scenario/`** — everything scenario-related: options, current situation, constraints, priorities, timeline, reflections, versioning, AI analysis

**`src/lib/supabase/`** — client singleton

**`src/lib/utils/`** — `cn()` helper

**`src/stores/`** — global Zustand stores (auth session)

**`supabase/functions/generate-analysis/`** — Edge Function that builds a prompt from scenario context, calls OpenRouter, and stores the result

Each feature under `features/scenario/` follows the same shape: `api/` (Supabase queries), `hooks/` (TanStack Query wrappers), `components/`, `types/`.

## Data model (high level)


## Data model (high level)

- `scenarios` — lean, queryable metadata (title, visibility, owner)
- `scenario_versions` — immutable snapshots (goal, situation, constraints, priorities, timeline). Everyday edits happen in-place on the latest version; a new version is only created deliberately, alongside a reflection.
- `options` — user-authored, stable, not versioned
- `option_analysis` — AI-generated, versioned separately from `options` so the model can change (GPT-5 today, something else tomorrow) without touching user data
- `scenario_reflections` — check-in notes tied to a scenario/version

Full schema and RLS policies live in Supabase (see the SQL run during setup — not currently checked into this repo).

## Setup

1. **Install dependencies**

```bash
   npm install
```

2. **Environment variables** — copy `.env.example` to `.env.local` and fill in your Supabase project's URL and publishable (anon) key:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

3. **Database** — run the schema SQL in the Supabase SQL Editor (tables: `profiles`, `scenarios`, `scenario_versions`, `options`, `option_analysis`, `scenario_reflections`, all with RLS enabled).

4. **Edge Function (AI analysis)** — requires the Supabase CLI:

```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase secrets set OPENROUTER_API_KEY=sk-or-v1-xxxxx
   npx supabase functions deploy generate-analysis
```

The OpenRouter key lives server-side only — it's never exposed to the browser.

5. **Run the dev server**

```bash
   npm run dev
```

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — typecheck (`tsc -b`) then build for production
- `npm run preview` — preview the production build locally

## Status

Core loop is complete and tested end-to-end: auth, scenario CRUD, options, current situation / constraints / priorities / timeline editing, visibility control, reflections with version history, and AI-generated per-option analysis.
