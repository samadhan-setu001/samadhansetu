create extension if not exists pgcrypto;

create type public.authority_type as enum ('in_house_officer', 'external_agency');
create type public.complaint_status as enum ('filed','assigned','in_progress','work_completed','under_review','resolved','reopened');
create type public.assignment_status as enum ('assigned','accepted','in_progress','work_completed','authority_review','resolved','reopened');
create type public.verification_verdict as enum ('confirmed','disputed');
create type public.priority_level as enum ('low','normal','high','urgent');
create type public.review_status as enum ('pending','approved','rejected','reassigned');

create table public.citizen_wallets (
  wallet_id uuid primary key references auth.users(id) on delete cascade,
  reputation_score numeric(5,2) not null default 50.00 check (reputation_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.domains (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.authorities (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  type public.authority_type not null,
  domain_id uuid references public.domains(id),
  tenure_start date,
  tenure_end date,
  performance_score numeric(5,2) not null default 50.00 check (performance_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.domain_authority_map (
  domain_id uuid not null references public.domains(id),
  authority_id uuid not null references public.authorities(id),
  effective_from timestamptz not null default now(),
  effective_to timestamptz,
  primary key (domain_id, authority_id, effective_from),
  check (effective_to is null or effective_to > effective_from)
);

create table public.officers (
  id uuid primary key references auth.users(id) on delete cascade,
  officer_id text unique not null check (officer_id ~ '^OFF-[0-9]{4,}$'),
  name text not null,
  role text,
  authority_id uuid not null references public.authorities(id),
  domain_id uuid references public.domains(id),
  active boolean not null default true,
  performance_score numeric(5,2) not null default 50.00 check (performance_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.citizen_wallets(wallet_id),
  derived_citizen_id text not null unique,
  domain_id uuid not null references public.domains(id),
  description text check (char_length(description) <= 3000),
  before_photo_url text not null,
  lat numeric(9,6) not null check (lat between -90 and 90),
  long numeric(9,6) not null check (long between -180 and 180),
  status public.complaint_status not null default 'filed',
  assigned_authority_id uuid references public.authorities(id),
  duplicate_of uuid references public.complaints(id),
  upvote_count integer not null default 0 check (upvote_count >= 0),
  created_at timestamptz not null default now()
);

create table public.complaint_upvotes (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  wallet_id uuid not null references public.citizen_wallets(wallet_id),
  derived_citizen_id text not null,
  photo_url text not null,
  lat numeric(9,6) check (lat between -90 and 90),
  long numeric(9,6) check (long between -180 and 180),
  created_at timestamptz not null default now(),
  unique (complaint_id, wallet_id)
);

create table public.case_assignments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  officer_id uuid not null references public.officers(id),
  assigned_by uuid not null references public.authorities(id),
  assigned_at timestamptz not null default now(),
  deadline timestamptz,
  priority public.priority_level not null default 'normal',
  status public.assignment_status not null default 'assigned'
);

create table public.resolutions (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  officer_id uuid not null references public.officers(id),
  after_photo_url text not null,
  after_photo_hash text not null,
  lat numeric(9,6) not null check (lat between -90 and 90),
  long numeric(9,6) not null check (long between -180 and 180),
  resolved_at timestamptz not null default now(),
  officer_note text check (char_length(officer_note) <= 3000),
  previous_hash text,
  record_hash text not null unique,
  review_status public.review_status not null default 'pending',
  reviewed_by uuid references public.authorities(id),
  reviewed_at timestamptz
);

create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  wallet_id uuid not null references public.citizen_wallets(wallet_id),
  derived_citizen_id text not null,
  verdict public.verification_verdict not null,
  comment text check (char_length(comment) <= 3000),
  created_at timestamptz not null default now(),
  unique (complaint_id, wallet_id)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_type text not null check (actor_type in ('citizen','authority','officer','system')),
  actor_id text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index complaints_domain_status_idx on public.complaints(domain_id, status);
create index complaints_active_geo_idx on public.complaints(domain_id, created_at desc) where status <> 'resolved';
create index assignments_officer_status_idx on public.case_assignments(officer_id, status);
create index resolutions_complaint_resolved_idx on public.resolutions(complaint_id, resolved_at desc);

insert into public.domains (name) values ('Road'), ('Streetlight'), ('Water'), ('Waste') on conflict (name) do nothing;

-- The public record intentionally contains no citizen wallet ID, phone data, or reputation.
create view public.complaints_public with (security_invoker = false) as
select id, derived_citizen_id, domain_id, description, before_photo_url, lat, long,
       status, assigned_authority_id, duplicate_of, upvote_count, created_at
from public.complaints;

grant usage on schema public to anon, authenticated;
grant select on public.complaints_public to anon, authenticated;

alter table public.citizen_wallets enable row level security;
alter table public.domains enable row level security;
alter table public.authorities enable row level security;
alter table public.domain_authority_map enable row level security;
alter table public.officers enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_upvotes enable row level security;
alter table public.case_assignments enable row level security;
alter table public.resolutions enable row level security;
alter table public.verifications enable row level security;
alter table public.audit_log enable row level security;

create policy "read domains" on public.domains for select to anon, authenticated using (true);
create policy "citizens read own wallet" on public.citizen_wallets for select to authenticated using (wallet_id = auth.uid());
create policy "citizens read own complaints" on public.complaints for select to authenticated using (wallet_id = auth.uid());
create policy "citizens read own upvotes" on public.complaint_upvotes for select to authenticated using (wallet_id = auth.uid());
create policy "citizens read own verifications" on public.verifications for select to authenticated using (wallet_id = auth.uid());
create policy "self read authority profile" on public.authorities for select to authenticated using (id = auth.uid());
create policy "self read officer profile" on public.officers for select to authenticated using (id = auth.uid());
-- All mutation and cross-role reads are mediated by Edge Functions with validation and audit logging.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('complaint-evidence', 'complaint-evidence', false, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "authenticated evidence upload" on storage.objects for insert to authenticated
with check (bucket_id = 'complaint-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner reads uploaded evidence" on storage.objects for select to authenticated
using (bucket_id = 'complaint-evidence' and (storage.foldername(name))[1] = auth.uid()::text);
