# TradeBench

## Overview
TradeBench is a quiz and study application for apprenticeship training. Users select their year of study and access questions, study guides, and track their progress.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Radix UI components (shadcn/ui pattern)
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **Backend**: Supabase (optional - app works in local/offline mode without it)
- **Language**: JavaScript/JSX

## Project Structure
```
src/
  api/           - API clients (localClient.js for offline, supabaseClient.js for Supabase)
  components/    - UI components (ui/ for shadcn primitives, dashboard/, quiz/, study/ for features)
  hooks/         - Custom React hooks
  lib/           - Utilities, auth context, anonymous session
  pages/         - Page components (Dashboard, Quiz, Study, YearSelection, etc.)
  utils/         - Utility functions
data/            - JSON data files for questions and study guides
scripts/         - Data generation and migration scripts
```

## Configuration
- Vite dev server runs on port 5000, host 0.0.0.0
- Path alias: `@/` maps to `./src/`
- Tailwind config: `tailwind.config.js`
- PostCSS config: `postcss.config.js`

## Environment Variables (Optional)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- Without these, the app runs in local/offline mode using localStorage and JSON data files

## Running
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
