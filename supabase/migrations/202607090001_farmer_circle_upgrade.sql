-- Farmer Circle Upgrade: non-destructive baseline
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'member' check (role in ('member','mentor','admin')),
  phone text,
  first_name text,
  last_name text,
  bio text,
  address text,
  city text,
  country text,
  avatar_url text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trade_journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_date date not null,
  pair text not null,
  setup text not null,
  direction text not null check (direction in ('long','short')),
  entry_price numeric,
  stop_loss numeric,
  take_profit numeric,
  risk_percent numeric,
  result_r numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_biases (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  market text not null,
  direction text not null check (direction in ('bullish','bearish','neutral')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_attendance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  topic text not null,
  session_time timestamptz not null,
  note text,
  proof_url text,
  proof_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.drive_files (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  folder_type text not null,
  related_table text,
  related_id uuid,
  title text,
  original_filename text,
  mime_type text,
  file_size_bytes bigint,
  drive_file_id text not null unique,
  drive_folder_id text,
  web_view_link text,
  web_content_link text,
  thumbnail_link text,
  visibility text not null default 'private' check (visibility in ('private','member','public')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists trade_journals_user_date_idx on public.trade_journals(user_id, trade_date desc);
create index if not exists daily_biases_created_idx on public.daily_biases(created_at desc);
create index if not exists attendance_user_created_idx on public.learning_attendance(user_id, created_at desc);
create index if not exists drive_files_related_idx on public.drive_files(related_table, related_id);

alter table public.profiles enable row level security;
alter table public.trade_journals enable row level security;
alter table public.daily_biases enable row level security;
alter table public.learning_attendance enable row level security;
alter table public.drive_files enable row level security;

-- Role is administrator-controlled; authenticated members cannot self-promote.
revoke update (role) on public.profiles from authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "trades_select_own" on public.trade_journals;
create policy "trades_select_own" on public.trade_journals for select to authenticated using (auth.uid() = user_id);
drop policy if exists "trades_insert_own" on public.trade_journals;
create policy "trades_insert_own" on public.trade_journals for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "trades_update_own" on public.trade_journals;
create policy "trades_update_own" on public.trade_journals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "trades_delete_own" on public.trade_journals;
create policy "trades_delete_own" on public.trade_journals for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "bias_select_authenticated" on public.daily_biases;
create policy "bias_select_authenticated" on public.daily_biases for select to authenticated using (true);
drop policy if exists "bias_insert_mentor_admin" on public.daily_biases;
create policy "bias_insert_mentor_admin" on public.daily_biases for insert to authenticated with check (
  auth.uid() = author_id and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','mentor'))
);
drop policy if exists "bias_update_mentor_admin" on public.daily_biases;
create policy "bias_update_mentor_admin" on public.daily_biases for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','mentor'))
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','mentor'))
);
drop policy if exists "bias_delete_mentor_admin" on public.daily_biases;
create policy "bias_delete_mentor_admin" on public.daily_biases for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','mentor'))
);

drop policy if exists "attendance_insert_own" on public.learning_attendance;
create policy "attendance_insert_own" on public.learning_attendance for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "attendance_select_own_or_staff" on public.learning_attendance;
create policy "attendance_select_own_or_staff" on public.learning_attendance for select to authenticated using (
  auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','mentor'))
);

drop policy if exists "drive_files_select_allowed" on public.drive_files;
create policy "drive_files_select_allowed" on public.drive_files for select to authenticated using (
  owner_user_id = auth.uid() or visibility in ('member','public') or folder_type in ('learning_videos','learning_pdfs')
);
drop policy if exists "drive_files_insert_own" on public.drive_files;
create policy "drive_files_insert_own" on public.drive_files for insert to authenticated with check (owner_user_id = auth.uid() and uploaded_by = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('profile-photos','profile-photos',true,3145728,array['image/jpeg','image/png','image/webp']),
  ('daily-bias-screenshots','daily-bias-screenshots',false,10485760,array['image/jpeg','image/png','image/webp']),
  ('attendance-proofs','attendance-proofs',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "profile_photos_select_all" on storage.objects;
create policy "profile_photos_select_all" on storage.objects for select to public using (bucket_id = 'profile-photos');
drop policy if exists "profile_photos_insert_own" on storage.objects;
create policy "profile_photos_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "daily_bias_screenshots_select_authenticated" on storage.objects;
create policy "daily_bias_screenshots_select_authenticated" on storage.objects for select to authenticated using (bucket_id = 'daily-bias-screenshots');
drop policy if exists "daily_bias_screenshots_insert_staff" on storage.objects;
create policy "daily_bias_screenshots_insert_staff" on storage.objects for insert to authenticated with check (
  bucket_id = 'daily-bias-screenshots' and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','mentor'))
);

drop policy if exists "attendance_proofs_select_public" on storage.objects;
create policy "attendance_proofs_select_public" on storage.objects for select to public using (bucket_id = 'attendance-proofs');
drop policy if exists "attendance_proofs_insert_own" on storage.objects;
create policy "attendance_proofs_insert_own" on storage.objects for insert to authenticated with check (
  bucket_id = 'attendance-proofs' and (storage.foldername(name))[1] = auth.uid()::text
);
