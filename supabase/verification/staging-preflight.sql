-- Farmer Circle Upgrade staging preflight
-- Read-only verification queries. Run after applying migrations to staging.

with required_tables(name) as (
  values
    ('profiles'),
    ('trade_journals'),
    ('daily_biases'),
    ('learning_attendance'),
    ('drive_files')
)
select
  'table:' || name as check_name,
  case when to_regclass('public.' || name) is not null then 'PASS' else 'FAIL' end as status,
  coalesce(to_regclass('public.' || name)::text, 'missing') as details
from required_tables
order by name;

with required_rls(name) as (
  values
    ('profiles'),
    ('trade_journals'),
    ('daily_biases'),
    ('learning_attendance'),
    ('drive_files')
)
select
  'rls:' || required_rls.name as check_name,
  case when coalesce(c.relrowsecurity, false) then 'PASS' else 'FAIL' end as status,
  'enabled=' || coalesce(c.relrowsecurity, false)::text as details
from required_rls
left join pg_class c on c.relname = required_rls.name
left join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
order by required_rls.name;

with required_policies(name) as (
  values
    ('profiles_select_own'),
    ('profiles_insert_own'),
    ('profiles_update_own'),
    ('trades_select_own'),
    ('trades_insert_own'),
    ('trades_update_own'),
    ('trades_delete_own'),
    ('bias_select_authenticated'),
    ('bias_insert_mentor_admin'),
    ('bias_update_mentor_admin'),
    ('bias_delete_mentor_admin'),
    ('attendance_insert_own'),
    ('attendance_select_own_or_staff'),
    ('drive_files_select_allowed'),
    ('drive_files_insert_own')
)
select
  'policy:' || required_policies.name as check_name,
  case when p.policyname is not null then 'PASS' else 'FAIL' end as status,
  coalesce(p.schemaname || '.' || p.tablename, 'missing') as details
from required_policies
left join pg_policies p
  on p.schemaname = 'public'
 and p.policyname = required_policies.name
order by required_policies.name;

with required_buckets(name) as (
  values
    ('profile-photos'),
    ('daily-bias-screenshots'),
    ('attendance-proofs')
)
select
  'bucket:' || required_buckets.name as check_name,
  case when b.id is not null then 'PASS' else 'FAIL' end as status,
  case when b.id is null then 'missing' else 'public=' || b.public::text end as details
from required_buckets
left join storage.buckets b on b.id = required_buckets.name
order by required_buckets.name;

select
  'privilege:authenticated_profiles_role_update' as check_name,
  case
    when has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE') then 'FAIL'
    else 'PASS'
  end as status,
  'update_role=' || has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')::text as details;

select
  'privilege:authenticated_profiles_full_name_update' as check_name,
  case
    when has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE') then 'PASS'
    else 'FAIL'
  end as status,
  'update_full_name=' || has_column_privilege('authenticated', 'public.profiles', 'full_name', 'UPDATE')::text as details;
