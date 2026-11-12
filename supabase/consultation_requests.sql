-- Mansi Portfolio — consultation bookings
-- Run once in Supabase: SQL Editor → New query → paste → Run.

create table if not exists public.consultation_requests (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null check (char_length(name) between 1 and 200),
  email           text not null check (char_length(email) between 5 and 320 and email like '%_@_%._%'),
  topic           text not null check (char_length(topic) between 1 and 100),
  questions       text not null check (char_length(questions) between 1 and 5000),
  slot            text,
  payment_method  text,
  amount          text,
  upi_sender_name text,
  status          text not null default 'PAID — pending manual verification'
);

comment on table public.consultation_requests is
  'Consultation bookings submitted from the portfolio booking page.';

alter table public.consultation_requests enable row level security;

-- Visitors may add a booking, but never read, edit or delete other people's data.
revoke all on public.consultation_requests from anon, authenticated;
grant insert on public.consultation_requests to anon;

drop policy if exists "anon can insert bookings" on public.consultation_requests;
create policy "anon can insert bookings"
  on public.consultation_requests
  for insert
  to anon
  with check (true);

-- Newest first in the dashboard
create index if not exists consultation_requests_created_at_idx
  on public.consultation_requests (created_at desc);

-- Sanity check: should list 11 columns
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'consultation_requests'
order by ordinal_position;
