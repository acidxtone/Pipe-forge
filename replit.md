# TradeBench

## Overview
TradeBench is a quiz and study application for apprenticeship training. Users select their year of study and access questions, study guides, and track their progress. Authentication is handled via custom email/password registration and login with bcrypt password hashing.

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Radix UI components (shadcn/ui pattern)
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **Backend**: Express 5 + TypeScript (server/) with Vite middleware for dev
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Auth**: Custom email/password auth with bcrypt + express-session (PostgreSQL-backed sessions)
- **Language**: JavaScript/JSX (frontend), TypeScript (backend)

## Project Structure
```
src/
  api/           - API clients (localClient.js for offline data)
  components/    - UI components (ui/ for shadcn primitives, dashboard/, quiz/, study/ for features)
  hooks/         - Custom React hooks
  lib/           - Utilities, auth context (AuthContext.jsx)
  pages/         - Page components (LandingPage, AuthPage, Dashboard, Quiz, Study, YearSelection, etc.)
  utils/         - Utility functions
server/
  index.ts       - Express server entry point (session setup, auth routes)
  auth.ts        - Custom email/password auth routes (register, login, logout, user)
  db.ts          - Drizzle ORM database connection
  vite.ts        - Vite dev middleware for serving frontend
shared/
  schema.ts      - Combined Drizzle schema exports
  models/auth.ts - Users (with password_hash) and sessions tables
data/            - JSON data files for questions and study guides
scripts/         - Data generation and migration scripts
```

## Configuration
- Express server runs on port 5000, host 0.0.0.0
- Vite runs in middleware mode (served through Express)
- Path alias: `@/` maps to `./src/`
- Tailwind config: `tailwind.config.js`
- PostCSS config: `postcss.config.js`
- Drizzle config: `drizzle.config.ts`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Replit)
- `SESSION_SECRET` - Session encryption secret (stored as secret)
- `REPL_ID` - Replit app ID (auto-provided)

## Auth Flow
- Landing page shown to unauthenticated users at `/`
- `/auth` - Login/signup page (client-side route)
- `POST /api/auth/register` - Create account with email, password, full name
- `POST /api/auth/login` - Sign in with email and password
- `GET /api/auth/user` - Get current authenticated user
- `PATCH /api/auth/user` - Update user profile (e.g. selectedYear)
- `POST /api/auth/logout` - End session
- `POST /api/auth/forgot-password/verify-email` - Step 1: verify email exists, returns security question
- `POST /api/auth/forgot-password/verify-answer` - Step 2: verify security answer, returns reset token
- `POST /api/auth/forgot-password/reset` - Step 3: set new password with valid reset token
- Sessions stored in PostgreSQL via connect-pg-simple
- Passwords hashed with bcrypt (12 salt rounds)
- Security answers hashed with bcrypt (case-insensitive comparison)
- Secure HTTP-only cookies with 7-day expiry

## Year Selection Flow
- First-time login (no selected_year in DB) → redirected to /YearSelection
- Returning login (selected_year exists in DB) → goes straight to Dashboard
- selected_year is stored server-side in the users table (persists across devices/sessions)
- YearHeader component shown at top of ALL authenticated pages (except YearSelection)
- YearHeader shows current year with a "Change" button linking to /YearSelection
- App.jsx LayoutWrapper automatically adds YearHeader to all routes

## Running
- `npm run dev` - Start Express + Vite dev server on port 5000
- `npm run build` - Build frontend for production
- `npm run db:push` - Push Drizzle schema to database

## Recent Changes
- 2026-02-06: Added server-side year persistence (selected_year column in users table, PATCH /api/auth/user endpoint)
- 2026-02-06: Moved YearHeader to App.jsx LayoutWrapper for consistent display on all authenticated pages
- 2026-02-06: AuthPage now routes to YearSelection (first-time) or Dashboard (returning) after login/signup
- 2026-02-06: Added forgot password flow with security questions (3-step: email → answer → new password)
- 2026-02-06: Added security_question and security_answer columns to users table
- 2026-02-06: Replaced Replit Auth with custom email/password authentication (bcrypt + sessions)
- 2026-02-06: Created AuthPage with sign in/sign up forms matching app design
- 2026-02-06: Added password_hash and full_name columns to users table
- 2026-02-06: Created Express backend server with Vite middleware
- 2026-02-06: Set up PostgreSQL database with Drizzle ORM (users, sessions tables)
- 2026-02-06: Created landing page for unauthenticated users
