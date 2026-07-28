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
