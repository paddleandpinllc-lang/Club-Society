-- Club Society Phase 4 hosted PWA prototype schema
-- Run this in Supabase SQL Editor for the first shared-data prototype.
-- This keeps the whole local app state in one JSON payload per club.
-- For production, split this into events, players, profiles, check-ins, posts, and payments tables with authenticated row-level security.

create table if not exists public.club_state (
  club_id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.club_state enable row level security;

-- Prototype policy:
-- Allows the anon public key to read/write this table.
-- Use only for early testing with a private/unlisted app link.
-- Replace with authenticated policies before broad public launch.
drop policy if exists "prototype read club state" on public.club_state;
create policy "prototype read club state"
on public.club_state
for select
to anon
using (true);

drop policy if exists "prototype upsert club state" on public.club_state;
create policy "prototype upsert club state"
on public.club_state
for insert
to anon
with check (true);

drop policy if exists "prototype update club state" on public.club_state;
create policy "prototype update club state"
on public.club_state
for update
to anon
using (true)
with check (true);
