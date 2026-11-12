-- Mansi Portfolio — consultation bookings + payment proof storage
-- Run once in Supabase: SQL Editor → New query → paste → Run.

create table if not exists public.consultation_requests (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  name                text not null check (char_length(name) between 1 and 200),
  email               text not null check (char_length(email) between 5 and 320 and email like '%_@_%._%'),
  topic               text not null check (char_length(topic) between 1 and 100),
  questions           text not null check (char_length(questions) between 1 and 5000),
  slot                text,
  payment_method      text,
  amount              text,
  payer_name          text,
  payment_reference   text,
  payment_proof_path  text,
  status              text not null default 'AWAITING PAYMENT VERIFICATION'
);

-- Safe for an earlier run of this file
alter table public.consultation_requests add column if not exists payer_name text;
alter table public.consultation_requests add column if not exists payment_reference text;
alter table public.consultation_requests add column if not exists payment_proof_path text;

comment on table public.consultation_requests is
  'Consultation bookings submitted from the portfolio booking page. Nothing is saved until a payment proof is uploaded.';

alter table public.consultation_requests enable row level security;

-- Visitors may add a booking, but never read, edit or delete other people's data.
revoke all on public.consultation_requests from anon, authenticated;
grant insert on public.consultation_requests to anon;

drop policy if exists "anon can insert bookings" on public.consultation_requests;
create policy "anon can insert bookings"
  on public.consultation_requests
  for insert
  to anon
  with check (status = 'AWAITING PAYMENT VERIFICATION');

-- Newest first in the dashboard
create index if not exists consultation_requests_created_at_idx
  on public.consultation_requests (created_at desc);


-- ── Payment proof storage ──────────────────────────────────────────────
-- Private bucket: visitors can upload; you read them as the project owner
-- (dashboard / service role). No public read policy on purpose.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880,
        array['image/png','image/jpeg','image/webp','application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/png','image/jpeg','image/webp','application/pdf'];

drop policy if exists "anon can upload payment proofs" on storage.objects;
create policy "anon can upload payment proofs"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'payment-proofs');

drop policy if exists "owner can read payment proofs" on storage.objects;

-- Sanity check: should list 13 columns
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'consultation_requests'
order by ordinal_position;
