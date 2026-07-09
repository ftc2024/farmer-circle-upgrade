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

## Setup

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm run build
npm run dev
```

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ECONOMIC_CALENDAR_API_URL=
```

Apply the migration in `supabase/migrations/202607090001_farmer_circle_upgrade.sql` to the same Supabase project used by the legacy app. Review policy names first if the production project already contains equivalent policies.

## Architecture

- `src/app`: routes and layouts
- `src/components`: reusable UI and layout
- `src/features`: domain UI and pure business logic
- `src/lib`: Supabase SSR/browser clients, auth and utilities
- `src/types`: shared domain contracts
- `supabase/migrations`: database/storage/RLS contract

The legacy repository remains the behavioral reference and is not modified by this rebuild.
