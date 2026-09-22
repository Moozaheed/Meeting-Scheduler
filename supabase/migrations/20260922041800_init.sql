-- Initial schema for the meeting-card-scheduler Supabase backend.
--
-- Mirrors types/domain.ts exactly: three tables for the three entities
-- (Meeting, AgendaItem, Attendee), with agenda_items/attendees
-- cascade-deleted when their parent meeting is deleted (BR4.2).
--
-- Every domain field that isn't an id/count is stored as `text` rather
-- than a native date/time/timestamp type — deliberately, so a row read
-- back through supabase-js round-trips byte-for-byte with what the app
-- wrote, with no Postgres-side type coercion to account for. Date/time
-- arithmetic (e.g. BR7.1's upcoming/past status) is computed client-side
-- from these strings, same as before this migration.

create table if not exists public.meetings (
  id uuid primary key,
  title text not null,
  description text not null default '',
  date text not null,
  start_time text not null,
  end_time text not null,
  timezone text not null,
  meeting_link text not null default '',
  location text not null default '',
  host_name text not null,
  host_role_org text not null,
  host_email text not null,
  created_at text not null
);

create table if not exists public.agenda_items (
  id uuid primary key,
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  topic text not null,
  speaker text not null default '',
  duration_minutes integer not null,
  order_index integer not null
);

create table if not exists public.attendees (
  id uuid primary key,
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default ''
);

create index if not exists agenda_items_meeting_id_idx on public.agenda_items (meeting_id);
create index if not exists attendees_meeting_id_idx on public.attendees (meeting_id);

alter table public.meetings enable row level security;
alter table public.agenda_items enable row level security;
alter table public.attendees enable row level security;

-- This app has no authentication (unlisted-URL access model, unchanged
-- from the original design) — every visitor with the link uses the same
-- anonymous Supabase role. RLS is turned on per Supabase's own best
-- practice, but the policies below grant the `anon` role full CRUD so the
-- app keeps working exactly as before. This is a disclosed trade-off, not
-- an oversight: unlike the previous per-device-only storage, this data is
-- now reachable by anyone who has the publishable key and project URL —
-- see README.md's "Data & Privacy" section.
create policy "anon full access" on public.meetings
  for all to anon using (true) with check (true);
create policy "anon full access" on public.agenda_items
  for all to anon using (true) with check (true);
create policy "anon full access" on public.attendees
  for all to anon using (true) with check (true);
