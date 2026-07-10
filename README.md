# Farmer Circle Upgrade

Production-oriented rebuild of `ftc2024/farmer-circle2` using Next.js 15 App Router and TypeScript.

## Stack

- Next.js 15
- React 19
- TypeScript strict mode
- TailwindCSS
- Supabase Auth / PostgreSQL / Storage / RLS
- Vercel-ready
- Railway-compatible for external services

## Feature parity implemented

- Supabase email/password login and password recovery
- Protected App Router dashboard
- Responsive desktop sidebar and mobile navigation
- Performance dashboard
- Advanced trade journal with CRUD, pips, PnL, RR, emotion and outcome
- Daily Bias with role-aware CRUD and screenshot upload
- Profile/account center and avatar upload
- Learning center categories
- Attendance with proof upload and CSV export
- Economic calendar via server-side proxy
- Non-destructive Supabase migration with RLS and storage policies

## Local setup

```bash
cp .env.example .env.local
npm install
npm run env:check
npm run typecheck
npm run lint
npm run build
npm run dev
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ECONOMIC_CALENDAR_API_URL=
```

Apply the migration in `supabase/migrations/202607090001_farmer_circle_upgrade.sql`. Review the target database before applying it to production.

## Staging gate

1. Create an isolated Supabase staging project.
2. Copy `.env.staging.example` values into the preview deployment environment.
3. Apply `supabase/migrations/202607090001_farmer_circle_upgrade.sql` to staging.
4. Run `supabase/verification/staging-preflight.sql` in the staging SQL editor.
5. Deploy the feature branch to a preview environment.
6. Verify the health endpoint:

```bash
curl -fsS https://your-preview-deployment.vercel.app/api/health
```

7. Run unauthenticated HTTP smoke checks:

```bash
STAGING_BASE_URL=https://your-preview-deployment.vercel.app npm run smoke:staging
```

The smoke script verifies:

- `/api/health` returns healthy status
- `/login` renders successfully
- unauthenticated `/dashboard` redirects to `/login`

The SQL preflight verifies:

- required public tables exist
- RLS is enabled on required tables
- expected policies exist
- storage buckets exist
- `authenticated` cannot update `profiles.role`
- `authenticated` can update allowed profile fields

## Health endpoint

`GET /api/health` returns `200` only when the required public Supabase environment variables are present. It never returns secret values.

## Architecture

- `src/app`: routes, layouts and route handlers
- `src/components`: reusable UI and layout
- `src/features`: domain UI and pure business logic
- `src/lib`: Supabase SSR/browser clients, auth and utilities
- `src/types`: shared domain contracts
- `scripts`: operational environment and smoke checks
- `supabase/migrations`: database/storage/RLS contract
- `supabase/verification`: read-only staging verification queries

The legacy repository remains the behavioral reference and is not modified by this rebuild.
