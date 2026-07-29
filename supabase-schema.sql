create table if not exists public.saeteuk_records (
  id uuid primary key default gen_random_uuid(),
  student_id text not null,
  grade text not null,
  subject text not null,
  created_at timestamptz not null default now(),
  results jsonb not null default '[]'::jsonb
);
alter table public.saeteuk_records enable row level security;
create policy "allow anon demo insert" on public.saeteuk_records for insert to anon with check (true);
create policy "allow anon demo read" on public.saeteuk_records for select to anon using (true);

create table if not exists public.inquiry_sessions (
  id uuid primary key default gen_random_uuid(),
  student_no text not null,
  student_name text not null,
  title text not null,
  perspectives jsonb not null default '[]'::jsonb,
  path text not null,
  report_sections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.inquiry_sessions enable row level security;
create policy "allow anon inquiry insert" on public.inquiry_sessions for insert to anon with check (true);
create policy "allow anon inquiry read" on public.inquiry_sessions for select to anon using (true);
